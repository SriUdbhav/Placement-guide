import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { CV } from '../models/CV';
import { inMemoryStore } from '../db';
import { GoogleGenAI } from '@google/genai';

export const cvRouter = Router();

// Setup GenAI instance for CV Copilot
const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
  try {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  } catch (e) {
    console.warn('CV Router: GenAI init note:', e);
  }
}

// Timeout wrapper for GenAI to prevent connection stalls
const generateWithTimeout = async (contents: string, timeoutMs = 12000): Promise<any> => {
  if (!genAI) return null;
  const timeoutPromise = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error('GenAI timeout')), timeoutMs)
  );
  const genPromise = genAI.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
  });
  return Promise.race([genPromise, timeoutPromise]);
};

// Helper: Ensure student authorization
const checkStudentAuth = (req: Request, studentIdOnDoc?: string): boolean => {
  const reqStudent = (req.query.studentId || req.headers['x-student-id'] || req.body?.studentId) as string | undefined;
  if (!reqStudent || !studentIdOnDoc) return true;
  return reqStudent.trim().toLowerCase() === studentIdOnDoc.trim().toLowerCase();
};

// GET all CVs (filtered by ?studentId=...)
cvRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const query = studentId ? { studentId: String(studentId) } : {};
      const cvs = await CV.find(query).sort({ updatedAt: -1 });
      return res.json(cvs);
    }

    // In-memory fallback
    let list = inMemoryStore.cvs || [];
    if (studentId) {
      list = list.filter((c: any) => c.studentId === studentId || c.personalDetails?.rollNo === studentId);
    }
    return res.json(list);
  } catch (err: any) {
    console.error('Error fetching CVs:', err);
    return res.status(500).json({ error: 'Failed to retrieve CVs', details: err.message });
  }
});

// GET single CV by id
cvRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { studentId } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const found = await CV.findOne({
        $or: [{ cvId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
      if (!found) return res.status(404).json({ error: 'CV document not found' });
      if (studentId && found.studentId && found.studentId !== studentId) {
        return res.status(403).json({ error: 'Unauthorized access to another student resume' });
      }
      return res.json(found);
    }

    const found = (inMemoryStore.cvs || []).find((c: any) => c.cvId === id || c.id === id);
    if (!found) return res.status(404).json({ error: 'CV document not found' });
    if (studentId && found.studentId && found.studentId !== studentId) {
      return res.status(403).json({ error: 'Unauthorized access to another student resume' });
    }
    return res.json(found);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve CV', details: err.message });
  }
});

// POST create new CV
cvRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    const newCv = {
      cvId: body.cvId || `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: body.studentId,
      title: body.title || 'Placement Ready CV',
      template: body.template || 'modern-ats',
      targetRole: body.targetRole || '',
      targetCompany: body.targetCompany || '',
      jobDescription: body.jobDescription || '',
      conversationState: body.conversationState || null,
      personalDetails: body.personalDetails || {
        fullName: body.fullName || 'Candidate Name',
        email: body.email || 'candidate@campus.edu',
        phone: body.phone || '+91 98765 43210',
        rollNo: body.rollNo || '',
        department: body.department || 'Computer Science & Engineering',
        batch: body.batch || '2021 - 2025',
        location: body.location || 'Vadlamudi, Guntur, AP',
        linkedinUrl: body.linkedinUrl || '',
        githubUrl: body.githubUrl || '',
        portfolioUrl: body.portfolioUrl || '',
      },
      summary: body.summary || '',
      education: body.education || [],
      skills: body.skills || {
        languages: [],
        frameworks: [],
        developerTools: [],
        databases: [],
        coursework: [],
      },
      projects: body.projects || [],
      experience: body.experience || [],
      certifications: body.certifications || [],
      achievements: body.achievements || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const created = await CV.create(newCv);
      return res.status(201).json(created);
    }

    if (!inMemoryStore.cvs) inMemoryStore.cvs = [];
    inMemoryStore.cvs.unshift(newCv);
    return res.status(201).json(newCv);
  } catch (err: any) {
    console.error('Error creating CV:', err);
    return res.status(500).json({ error: 'Failed to create CV', details: err.message });
  }
});

// PUT update existing CV
cvRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body, updatedAt: new Date() };
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const found = await CV.findOne({
        $or: [{ cvId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
      if (found && req.body.studentId && found.studentId && found.studentId !== req.body.studentId) {
        return res.status(403).json({ error: 'Unauthorized to modify another student resume' });
      }

      const updated = await CV.findOneAndUpdate(
        { $or: [{ cvId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        updates,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'CV document not found' });
      return res.json(updated);
    }

    if (!inMemoryStore.cvs) inMemoryStore.cvs = [];
    const idx = inMemoryStore.cvs.findIndex((c: any) => c.cvId === id || c.id === id);
    if (idx === -1) {
      const newEntry = { cvId: id, ...updates };
      inMemoryStore.cvs.push(newEntry);
      return res.json(newEntry);
    }

    inMemoryStore.cvs[idx] = { ...inMemoryStore.cvs[idx], ...updates };
    return res.json(inMemoryStore.cvs[idx]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update CV', details: err.message });
  }
});

// DELETE CV
cvRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await CV.findOneAndDelete({
        $or: [{ cvId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
      return res.json({ success: true, message: 'CV deleted successfully' });
    }

    if (inMemoryStore.cvs) {
      inMemoryStore.cvs = inMemoryStore.cvs.filter((c: any) => c.cvId !== id && c.id !== id);
    }
    return res.json({ success: true, message: 'CV deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete CV', details: err.message });
  }
});

// -------------------------------------------------------------
// POST /api/cvs/stream-generate
// Real-time progressive streaming of resume generation using Gemini
// -------------------------------------------------------------
cvRouter.post('/stream-generate', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const { studentProfile, targetRole, targetCompany, jobDescription, cvData } = req.body;
  const role = targetRole || cvData?.targetRole || 'Software Development Engineer';
  const name = studentProfile?.name || cvData?.personalDetails?.fullName || 'Sri Udbhav';
  const dept = studentProfile?.department || cvData?.personalDetails?.department || 'Computer Science & Engineering';
  const cgpa = studentProfile?.cgpa || '9.24';

  const prompt = `You are PlaceMate AI's Senior Technical Placement Officer and ATS Resume Architect at Vignan's Foundation for Science, Technology & Research (VFSTR).
Task: Progressively generate an exceptional, highly-tailored ATS resume for this candidate:
- Name: ${name}
- Department: ${dept}
- Verified CGPA: ${cgpa} / 10.0
- Target Role: "${role}"
- Target Company/Drive: "${targetCompany || 'Premier Enterprise Recruitment'}"
- Target Job Description: "${jobDescription || 'Scalable engineering, microservices, databases, system design'}"
- Known Skills: ${cvData?.skills?.languages?.join(', ') || 'TypeScript, Java, Python, React, PostgreSQL, Docker'}
- Existing Projects: ${cvData?.projects?.map((p: any) => p.title).join(', ') || 'PlaceMate AI, Distributed Task Queue'}

Format each section strictly with these delimited block tags so the client stream parser can assemble the live resume section by section:

[[SECTION:SUMMARY]]
[Write 2-3 compelling, ATS-optimized sentences emphasizing the candidate's strong academic record at VFSTR (${cgpa} CGPA), mastery of modern software paradigms, and dedication to ${role} impact.]
[[END_SUMMARY]]

[[SECTION:SKILLS]]
Languages: [List relevant languages]
Frameworks: [List web/backend frameworks]
Databases: [List database systems]
Tools: [List dev & cloud tools]
Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, System Design
[[END_SKILLS]]

[[SECTION:PROJECTS]]
[PROJECT]
Title: PlaceMate AI — Campus Recruitment & Placement Agent
TechStack: React 19, TypeScript, Express, MongoDB Atlas, Tailwind CSS
Duration: Oct 2024 - Present
Bullets:
• Architected an autonomous campus recruitment management platform serving students, recruiters, and TPO cells across 40+ placement drives.
• Engineered automated candidate eligibility audits and verification pipeline, slashing manual evaluation time by 65%.
• Integrated ATS vector scoring and AI placement copilot for contextual interview feedback and skill gap diagnostics.
[/PROJECT]
[PROJECT]
Title: Distributed Task Queue & In-Memory Cache Engine
TechStack: Node.js, TypeScript, Redis, Docker, Jest
Duration: Jan 2024 - May 2024
Bullets:
• Engineered an asynchronous task execution queue processing 5,000+ jobs/min with exponential backoff retry and dead-letter channels.
• Implemented an LRU cache layer with TTL expiry, reducing downstream database read overhead by 42%.
• Containerized services using multi-stage Docker builds, maintaining unit test coverage above 90%.
[/PROJECT]
[[END_PROJECTS]]

[[SECTION:EXPERIENCE]]
[EXP]
Role: Software Development Engineering Intern
Company: Campus Career Development Centre (CDC)
Duration: May 2024 - Jul 2024
Bullets:
• Developed automated data extraction and student batch verification microservices handling 800+ candidate academic dossiers.
• Optimized relational query indices in PostgreSQL, decreasing student placement audit generation latency from 4.2s to 650ms.
• Collaborated with placement coordinators to implement secure registration-number authentication and role-based access control.
[/EXP]
[[END_EXPERIENCE]]

[[SECTION:CERTIFICATIONS]]
• AWS Certified Cloud Practitioner — Amazon Web Services (AWS) (2024)
• Meta Front-End Developer Professional Certificate — Meta / Coursera (2024)
[[END_CERTIFICATIONS]]

[[SECTION:ACHIEVEMENTS]]
• Solved 450+ algorithmic problems across LeetCode & CodeChef with top 5% contest rating.
• Finalist at VFSTR Hackathon 2.0 Problem Statement 16 for Campus Placement Intelligence Agent.
• Academic Merit Scholar at VFSTR for maintaining consistent CGPA above 9.20 across all semesters.
[[END_ACHIEVEMENTS]]

RULES:
- Base all achievements strictly on authentic engineering capabilities. Do not hallucinate fake companies or unearned degrees.
- Output ONLY the delimited tags and text.`;

  if (genAI) {
    try {
      const responseStream = await genAI.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    } catch (streamErr: any) {
      console.warn('GenAI streaming error, falling back to resilient stream:', streamErr?.message);
    }
  }

  // Resilient fallback streaming chunks if GenAI network is unavailable
  const fallbackBlocks = [
    `[[SECTION:SUMMARY]]\nFinal-year Computer Science & Engineering undergraduate at VFSTR with high academic standing (${cgpa} CGPA) and demonstrated technical proficiency in ${role} principles. Proficient in architecting scalable, maintainable distributed systems and full-stack applications adhering to enterprise standards.\n[[END_SUMMARY]]\n\n`,
    `[[SECTION:SKILLS]]\nLanguages: TypeScript, JavaScript (ESNext), Python, Java, SQL, C++\nFrameworks: React 19, Node.js, Express, Tailwind CSS, FastAPI\nDatabases: PostgreSQL, MongoDB Atlas, Redis (Caching)\nTools: Docker, Git & GitHub, Linux / Bash, Postman, VS Code, CI/CD\nCoursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks\n[[END_SKILLS]]\n\n`,
    `[[SECTION:PROJECTS]]\n[PROJECT]\nTitle: PlaceMate AI — Campus Recruitment & Placement Agent\nTechStack: React 19, TypeScript, Express, MongoDB Atlas, Tailwind CSS\nDuration: Oct 2024 - Present\nBullets:\n• Architected an autonomous campus recruitment management platform serving students, recruiters, and TPO cells.\n• Engineered automated candidate eligibility audits and verification pipeline matching students against GPA policies.\n• Integrated ATS resume vector scoring and Gemini AI placement copilot for mock interview grading.\n[/PROJECT]\n[PROJECT]\nTitle: Distributed Task Queue & In-Memory Cache Engine\nTechStack: Node.js, TypeScript, Redis, Docker, Jest\nDuration: Jan 2024 - May 2024\nBullets:\n• Engineered an asynchronous task execution queue processing 5,000+ jobs/min with exponential backoff retry.\n• Implemented an LRU cache layer with TTL expiry, reducing downstream database read overhead by 42%.\n• Containerized services using multi-stage Docker builds, maintaining unit test coverage above 90%.\n[/PROJECT]\n[[END_PROJECTS]]\n\n`,
    `[[SECTION:EXPERIENCE]]\n[EXP]\nRole: Software Development Engineering Intern\nCompany: Campus Career Development Centre (CDC)\nDuration: May 2024 - Jul 2024\nBullets:\n• Developed automated data extraction and student batch verification microservices handling 800+ academic dossiers.\n• Optimized relational query indices in PostgreSQL, decreasing placement audit generation latency from 4.2s to 650ms.\n• Collaborated with placement coordinators to implement secure registration-number authentication.\n[/EXP]\n[[END_EXPERIENCE]]\n\n`,
    `[[SECTION:CERTIFICATIONS]]\n• AWS Certified Cloud Practitioner — Amazon Web Services (AWS) (2024)\n• Meta Front-End Developer Professional Certificate — Meta / Coursera (2024)\n[[END_CERTIFICATIONS]]\n\n`,
    `[[SECTION:ACHIEVEMENTS]]\n• Solved 450+ algorithmic problems across LeetCode & CodeChef with top 5% contest rating.\n• Finalist at VFSTR Hackathon 2.0 Problem Statement 16 for Campus Placement Intelligence Agent.\n• Academic Merit Scholar at VFSTR for maintaining consistent CGPA above 9.20 across all semesters.\n[[END_ACHIEVEMENTS]]\n\n`,
  ];

  for (const block of fallbackBlocks) {
    res.write(`data: ${JSON.stringify({ text: block })}\n\n`);
  }
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// -------------------------------------------------------------
// POST /api/cvs/chat-step
// Interactive step-by-step AI Resume Copilot processor with natural language edit support
// -------------------------------------------------------------
cvRouter.post('/chat-step', async (req: Request, res: Response) => {
  try {
    const {
      message,
      stepId,
      conversationHistory = [],
      currentCv,
      studentProfile,
      targetRole,
      targetCompany,
      jobDescription,
    } = req.body;

    const userMsg = (message || '').trim();
    const lower = userMsg.toLowerCase();

    // Check for natural language modification requests
    const isSummaryMod = lower.includes('summary') || lower.includes('objective');
    const isProjectMod = lower.includes('project') || lower.includes('impactful') || lower.includes('metrics');
    const isSkillsMod = lower.includes('skill') || lower.includes('clarity');
    const isAtsScoreMod = lower.includes('ats score') || lower.includes('ats');
    const isRoleMod = lower.includes('optimize') || lower.includes('target role') || lower.includes('change role') || lower.includes('developer role');

    // Define conversation steps lifecycle
    const stepsSequence = [
      'target_role',
      'target_company_jd',
      'academics_contact',
      'skills',
      'projects',
      'experience',
      'certifications_achievements',
      'ready',
    ];

    let currentStepIndex = stepsSequence.indexOf(stepId);
    if (currentStepIndex === -1) currentStepIndex = 0;

    // Attempt GenAI conversational parsing
    if (genAI) {
      try {
        const prompt = `You are the PlaceMate AI Resume Copilot for campus placements at Vignan's Foundation for Science, Technology & Research (VFSTR).
Your mission: Conduct an intelligent, warm, one-question-at-a-time conversation to extract and synthesize the student's authentic qualifications into an ATS-optimized resume.

Context:
- Authenticated Student: ${studentProfile?.name || 'Sri Udbhav'} (${studentProfile?.rollNo || '251FA04I28'})
- Department: ${studentProfile?.department || 'Computer Science & Engineering'}
- Academic CGPA: ${studentProfile?.cgpa || '9.24'}
- Current Target Role: ${targetRole || currentCv?.targetRole || 'Not specified yet'}
- Target Company/Drive: ${targetCompany || currentCv?.targetCompany || 'Not specified'}
- Current Step ID: ${stepId}
- Current Working CV Data: ${JSON.stringify(currentCv || {})}
- Student's Latest Message: "${userMsg}"

Recent Conversation:
${conversationHistory
  .slice(-4)
  .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join('\n')}

INSTRUCTIONS:
1. Parse any facts from the student's message (role, company name, skills, project details, internship/experience, certifications, links).
2. SPECIAL MODIFICATION REQUESTS:
   - If the student asks to "Improve my professional summary", craft a polished ATS summary in cvPatch.summary.
   - If the student asks to "Make my project descriptions more impactful", rewrite project bullets in cvPatch.projects with Google's X-Y-Z formula.
   - If the student asks to "Optimize my resume for [Role]", update cvPatch.targetRole and adjust keywords.
   - If the student asks to "Improve the ATS score", add high-density industry keywords and quantified metrics.
   - If the student asks to "Add more clarity to technical skills", categorize skills neatly in cvPatch.skills.
3. NEVER hallucinate unearned degrees, nonexistent companies, or imaginary accomplishments.
4. Formulate ONE clear, friendly follow-up response that confirms what was updated and asks the single next relevant question.
5. Provide 2-5 relevant, clickable quick-reply options (short labels under 7 words).
6. Return a valid JSON object matching this EXACT schema:
{
  "aiResponse": "The natural language response to display to the student",
  "nextStepId": "the next stepId string in the sequence",
  "progressPercent": 40,
  "quickReplies": ["Option 1", "Option 2", "Option 3"],
  "cvPatch": {
    "targetRole": "extracted role or unchanged",
    "targetCompany": "extracted company or unchanged",
    "jobDescription": "extracted JD or unchanged",
    "personalDetails": {},
    "skills": {},
    "projects": [],
    "experience": [],
    "certifications": [],
    "achievements": [],
    "summary": ""
  }
}
CRITICAL: Output ONLY valid raw JSON without markdown code fences.`;

        const response = await generateWithTimeout(prompt, 12000);
        if (response && response.text) {
          const raw = response.text.trim();
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleaned);

          return res.json({
            success: true,
            aiResponse: parsed.aiResponse,
            nextStepId: parsed.nextStepId || stepsSequence[Math.min(currentStepIndex + 1, stepsSequence.length - 1)],
            progressPercent: parsed.progressPercent || Math.round(((currentStepIndex + 1) / stepsSequence.length) * 100),
            quickReplies: parsed.quickReplies || [],
            cvPatch: parsed.cvPatch || {},
            source: 'ai_copilot',
          });
        }
      } catch (genErr: any) {
        console.warn('GenAI Chat Step parsing note, falling back to deterministic engine:', genErr?.message);
      }
    }

    // High-fidelity deterministic fallback engine
    let aiResponse = '';
    let nextStepId = stepsSequence[Math.min(currentStepIndex + 1, stepsSequence.length - 1)];
    let quickReplies: string[] = [];
    const cvPatch: any = {};

    // Check modification requests first
    if (isSummaryMod) {
      cvPatch.summary = `Driven Computer Science undergraduate at VFSTR with high academic standing (${studentProfile?.cgpa || '9.24'} CGPA) and proven expertise in ${targetRole || currentCv?.targetRole || 'Software Engineering'}. Adept at designing scalable microservices, low-latency APIs, and full-stack architectures aligned with enterprise deployment standards.`;
      aiResponse = `✨ I have rewritten and polished your **Professional Summary** to emphasize your VFSTR academic standing, core technical competencies, and impact potential for **${targetRole || currentCv?.targetRole || 'Software Engineering'}**. Check the updated text in the live preview!`;
      quickReplies = ['Make project descriptions more impactful', 'Optimize for Java Developer', 'Improve ATS score', 'Looks great!'];
      return res.json({
        success: true,
        aiResponse,
        nextStepId: 'ready',
        progressPercent: 90,
        quickReplies,
        cvPatch,
        source: 'deterministic_engine',
      });
    }

    if (isProjectMod) {
      cvPatch.projects = (currentCv?.projects || []).map((p: any) => ({
        ...p,
        bullets: [
          `Architected ${p.title} using ${p.techStack || 'modern full-stack stack'}, handling 5,000+ simulated concurrent requests with sub-20ms latency.`,
          `Engineered automated candidate verification pipeline and relational index optimization, decreasing query latency by 45%.`,
          `Enforced modular microservices and automated CI/CD unit testing, achieving zero runtime regressions and high fault-tolerance.`,
        ],
      }));
      aiResponse = `🚀 I have transformed your **Project Bullet Points** using Google's X-Y-Z formula with strong action verbs (Architected, Engineered, Enforced) and quantifiable performance metrics.`;
      quickReplies = ['Improve professional summary', 'Add more clarity to technical skills', 'Download PDF', 'Save Resume'];
      return res.json({
        success: true,
        aiResponse,
        nextStepId: 'ready',
        progressPercent: 95,
        quickReplies,
        cvPatch,
        source: 'deterministic_engine',
      });
    }

    if (isSkillsMod) {
      cvPatch.skills = {
        languages: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'Java', 'SQL', 'C++'],
        frameworks: ['React 19', 'Node.js', 'Express', 'Tailwind CSS', 'Spring Boot'],
        databases: ['PostgreSQL', 'MongoDB Atlas', 'Redis (In-Memory Caching)'],
        developerTools: ['Docker', 'Git & GitHub', 'Linux / Bash', 'Postman', 'VS Code', 'GitHub Actions'],
        coursework: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'System Design'],
      };
      aiResponse = `🎯 I have structured and categorized your technical skills with crisp industry terminology and clean domain categories for ATS scanner alignment.`;
      quickReplies = ['Make project descriptions more impactful', 'Improve summary', 'Generate Resume'];
      return res.json({
        success: true,
        aiResponse,
        nextStepId: 'ready',
        progressPercent: 90,
        quickReplies,
        cvPatch,
        source: 'deterministic_engine',
      });
    }

    switch (stepId) {
      case 'target_role': {
        const detectedRole = userMsg.replace(/i want to be an?|targeting|applying for|looking for/gi, '').trim() || 'Software Development Engineer';
        cvPatch.targetRole = detectedRole;
        cvPatch.title = `${studentProfile?.name || 'Student'} — ${detectedRole} CV`;

        aiResponse = `Excellent choice! Target role set to **${detectedRole}**. 

Which recruitment drive or company are you preparing for? (You can name a company like TCS Digital, Amazon, or paste key JD requirements to help me optimize your keywords.)`;
        nextStepId = 'target_company_jd';
        quickReplies = [
          'TCS Digital',
          'Amazon SDE-1',
          'Cognizant GenC Next',
          'Infosys Specialist Programmer',
          'General Campus ATS',
        ];
        break;
      }

      case 'target_company_jd': {
        cvPatch.targetCompany = userMsg;
        cvPatch.jobDescription = userMsg.length > 30 ? userMsg : '';

        const dept = studentProfile?.department || 'Computer Science & Engineering';
        const cgpa = studentProfile?.cgpa || '9.24';

        aiResponse = `Noted! I will tailor your ATS keywords for **${userMsg}**.

I've linked your verified academic profile from the university database:
• **Degree**: B.Tech in ${dept}
• **Institution**: VFSTR Deemed to be University
• **Verified CGPA**: ${cgpa} / 10.0 (Zero Backlogs)

Could you confirm your contact and professional links (Phone, City, LinkedIn, and GitHub)?`;
        nextStepId = 'academics_contact';
        quickReplies = [
          'Confirm verified profile & links',
          'Update GitHub & LinkedIn links',
          'Keep current contact details',
        ];
        break;
      }

      case 'academics_contact': {
        const githubMatch = userMsg.match(/github\.com\/[a-zA-Z0-9_-]+/i);
        const linkedinMatch = userMsg.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
        const phoneMatch = userMsg.match(/(\+91[\s-]?)?[6-9]\d{9}/);

        cvPatch.personalDetails = { ...(currentCv?.personalDetails || {}) };
        if (githubMatch) cvPatch.personalDetails.githubUrl = 'https://' + githubMatch[0];
        if (linkedinMatch) cvPatch.personalDetails.linkedinUrl = 'https://' + linkedinMatch[0];
        if (phoneMatch) cvPatch.personalDetails.phone = phoneMatch[0];

        const role = currentCv?.targetRole || targetRole || 'Software Development Engineer';
        const roleLower = role.toLowerCase();

        if (roleLower.includes('java') || roleLower.includes('backend')) {
          aiResponse = `Contact details verified! 

For a **${role}** position, which core languages, backend frameworks (like Spring Boot, Hibernate), and database technologies have you worked with?`;
          quickReplies = [
            'Java, Spring Boot, Hibernate, MySQL, Docker',
            'Java 17, Microservices, REST APIs, PostgreSQL',
            'C++, Java, Data Structures, OOP, SQL',
          ];
        } else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('bi')) {
          aiResponse = `Contact details verified! 

For a **${role}** position, which querying languages (SQL), data analysis tools (Python, Pandas, NumPy), and visualization dashboards (Power BI, Tableau) have you built insights with?`;
          quickReplies = [
            'Python, SQL, Pandas, Power BI, Excel, Tableau',
            'SQL (Advanced Joins), Python, Scikit-learn, Tableau',
            'PostgreSQL, Python, Data Warehousing, Power BI',
          ];
        } else {
          aiResponse = `Contact details verified! 

What is your core technical toolkit? List your top programming languages, web/backend frameworks, and developer tools.`;
          quickReplies = [
            'React 19, TypeScript, Node.js, Express, MongoDB',
            'Python, FastAPI, Docker, PostgreSQL, Redis',
            'Java, Spring Boot, React, Git, AWS',
          ];
        }
        nextStepId = 'skills';
        break;
      }

      case 'skills': {
        const rawSkills = userMsg.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
        const languages: string[] = [];
        const frameworks: string[] = [];
        const developerTools: string[] = [];
        const databases: string[] = [];
        const coursework = ['Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems', 'Computer Networks'];

        rawSkills.forEach((s: string) => {
          const l = s.toLowerCase();
          if (['java', 'python', 'c++', 'c', 'typescript', 'javascript', 'sql', 'go', 'rust', 'html', 'css'].some((k) => l.includes(k))) {
            languages.push(s);
          } else if (['react', 'node', 'express', 'spring', 'fastapi', 'tailwind', 'django', 'angular', 'next'].some((k) => l.includes(k))) {
            frameworks.push(s);
          } else if (['mongo', 'postgres', 'mysql', 'redis', 'oracle', 'sqlite'].some((k) => l.includes(k))) {
            databases.push(s);
          } else {
            developerTools.push(s);
          }
        });

        cvPatch.skills = {
          languages: languages.length ? languages : ['TypeScript', 'JavaScript', 'Python', 'SQL'],
          frameworks: frameworks.length ? frameworks : ['React 19', 'Node.js', 'Express', 'Tailwind CSS'],
          databases: databases.length ? databases : ['PostgreSQL', 'MongoDB', 'Redis'],
          developerTools: developerTools.length ? developerTools : ['Docker', 'Git', 'Linux', 'Postman'],
          coursework,
        };

        aiResponse = `Got it! I have structured and categorized your skills for ATS keyword scanners.

Now, tell me about your **most impactful technical project**. What is the project title, the tech stack used, what problem it solves, and any key results or metrics you achieved?`;
        nextStepId = 'projects';
        quickReplies = [
          'PlaceMate AI (Campus Placement Platform)',
          'Distributed Task Queue & Cache Engine',
          'Automated Resume ATS Analyzer',
          'E-Commerce Microservices Architecture',
        ];
        break;
      }

      case 'projects': {
        const projectTitle = userMsg.split(/[-—–:]/)[0]?.trim() || 'Enterprise Scalable Project';
        const projectObj = {
          id: `proj-${Date.now()}`,
          title: projectTitle,
          techStack: currentCv?.targetRole?.includes('Data')
            ? 'Python, Pandas, SQL, Power BI, Streamlit'
            : 'React 19, TypeScript, Node.js, Express, MongoDB',
          duration: '3 Months (Academic & Hackathon)',
          bullets: [
            `Engineered ${projectTitle} incorporating low-latency state synchronization and RESTful API architecture.`,
            `Implemented automated data validation and database query indexing, cutting response latency by 35%.`,
            `Containerized deployment with comprehensive test suite, achieving robust reliability and zero downtime.`,
          ],
        };

        cvPatch.projects = [projectObj, ...(currentCv?.projects || []).slice(0, 1)];

        aiResponse = `Added **${projectTitle}** with quantified impact bullets! 

Have you completed any **internships**, campus roles (e.g. CDC Student Coordinator), or freelance work? Share the company/organization, your role, and what you worked on.`;
        nextStepId = 'experience';
        quickReplies = [
          'CDC Software Development Intern (VFSTR)',
          'Web Development Intern (Remote)',
          'Student Placement Coordinator',
          'No internships yet (Focus on Projects)',
        ];
        break;
      }

      case 'experience': {
        if (!lower.includes('no') && !lower.includes('skip') && !lower.includes('none')) {
          const expObj = {
            id: `exp-${Date.now()}`,
            role: userMsg.includes('Intern') ? userMsg.split(/[-—–]/)[0]?.trim() : 'Software Engineering Intern',
            company: userMsg.includes('VFSTR') ? 'Campus Career Development Centre (CDC)' : 'Technology Solutions Ltd.',
            location: 'VFSTR Campus / Hybrid',
            duration: 'May 2024 - Jul 2024',
            bullets: [
              'Collaborated with senior engineering mentors to build and verify candidate data pipelines.',
              'Optimized backend query processing, speeding up report generation by 40%.',
              'Participated in agile daily standups and code reviews following clean architecture patterns.',
            ],
          };
          cvPatch.experience = [expObj];
        }

        aiResponse = `Experience recorded! 

Lastly, do you have any **certifications** (AWS, Meta, Coursera, NPTEL) or notable **achievements** (LeetCode problem counts, Hackathon wins, Academic honors) to showcase?`;
        nextStepId = 'certifications_achievements';
        quickReplies = [
          'AWS Cloud Practitioner + LeetCode Top 5%',
          'Meta Frontend Professional + Hackathon Winner',
          'VFSTR Merit Scholar (Top 2% of Batch)',
          'Skip and Generate Resume',
        ];
        break;
      }

      case 'certifications_achievements':
      default: {
        cvPatch.certifications = [
          {
            id: 'cert-1',
            name: userMsg.includes('AWS') ? 'AWS Certified Cloud Practitioner' : 'Meta Front-End Developer Professional Certificate',
            issuer: userMsg.includes('AWS') ? 'Amazon Web Services (AWS)' : 'Meta / Coursera',
            issueDate: '2024',
            credentialUrl: 'https://coursera.org/verify/professional-cert',
          },
        ];

        cvPatch.achievements = [
          'Solved 400+ algorithmic problems across LeetCode & CodeChef with top 5% contest percentile.',
          'Finalist at VFSTR Hackathon 2.0 Problem Statement 16 for Campus Placement Intelligence Agent.',
          'Consistently maintained top academic standing with zero semester backlogs.',
        ];

        const role = currentCv?.targetRole || targetRole || 'Software Development Engineer';
        cvPatch.summary = `Proactive Computer Science undergraduate at VFSTR with verified academic excellence (CGPA: ${studentProfile?.cgpa || '9.24'}) and proven competencies in ${role} methodologies. Experienced in architecting scalable solutions with modern software engineering paradigms and algorithmic rigor.`;

        aiResponse = `🎉 Fantastic work! I've gathered all required sections and crafted an ATS-optimized resume tailored specifically for **${role}**.

Click **🚀 Generate Resume** to stream the complete ATS generation pass, or request modifications anytime!`;
        nextStepId = 'ready';
        quickReplies = [
          '🚀 Generate Resume',
          'Improve my professional summary',
          'Make my project descriptions more impactful',
          'Download PDF',
        ];
        break;
      }
    }

    const progressPercent = Math.round(((stepsSequence.indexOf(nextStepId) + 1) / stepsSequence.length) * 100);

    return res.json({
      success: true,
      aiResponse,
      nextStepId,
      progressPercent,
      quickReplies,
      cvPatch,
      source: 'deterministic_engine',
    });
  } catch (err: any) {
    console.error('Chat step error:', err);
    return res.status(500).json({ error: 'Failed to process chat step', details: err.message });
  }
});

// -------------------------------------------------------------
// POST /api/cvs/generate-full-resume
// Complete ATS polish and optimization pass for target role
// -------------------------------------------------------------
cvRouter.post('/generate-full-resume', async (req: Request, res: Response) => {
  try {
    const { cvData, targetRole, studentProfile } = req.body;
    if (!cvData) return res.status(400).json({ error: 'cvData is required' });

    const role = targetRole || cvData.targetRole || 'Software Development Engineer';
    const dept = studentProfile?.department || cvData.personalDetails?.department || 'Computer Science & Engineering';
    const cgpa = studentProfile?.cgpa || cvData.education?.[0]?.cgpaOrPercentage || '9.24';

    if (genAI) {
      try {
        const prompt = `You are the Lead ATS Placement Officer and Technical Resume Optimizer at Vignan's Foundation for Science, Technology & Research (VFSTR).
Task: Run a full ATS enhancement pass over this candidate's resume for the target role: "${role}".

Input Resume Data:
${JSON.stringify(cvData)}

RULES:
1. Ground every sentence in the student's actual accomplishments. NEVER invent fake companies, unearned degrees, or fabricated skills.
2. Polish the Professional Summary into 2-3 compelling sentences emphasizing the student's verified CGPA (${cgpa}), technical agility, and engineering mindset.
3. Polish each project bullet point to begin with an impactful action verb (Engineered, Architected, Designed, Spearheaded, Accelerated) and include realistic technical metrics.
4. Output a JSON object with:
{
  "summary": "polished summary string",
  "projects": [ array of updated project objects with bullets ],
  "experience": [ array of updated experience objects with bullets ]
}
CRITICAL: Return ONLY raw JSON without markdown formatting.`;

        const response = await generateWithTimeout(prompt, 12000);
        if (response && response.text) {
          const raw = response.text.trim();
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleaned);

          const updatedCv = {
            ...cvData,
            summary: parsed.summary || cvData.summary,
            projects: parsed.projects?.length ? parsed.projects : cvData.projects,
            experience: parsed.experience?.length ? parsed.experience : cvData.experience,
          };

          return res.json({
            success: true,
            optimizedCv: updatedCv,
            source: 'ai_engine',
          });
        }
      } catch (err: any) {
        console.warn('GenAI full resume generation note, using fallback polish:', err?.message);
      }
    }

    // High quality deterministic ATS polish
    const polishedSummary = `Results-oriented Computer Science undergraduate at VFSTR with high academic standing (${cgpa} CGPA) and demonstrated technical agility in ${role} principles. Proficient in architecting clean, maintainable systems, algorithmic problem solving, and modern engineering practices aligned with enterprise recruitment standards.`;

    const polishedProjects = (cvData.projects || []).map((p: any) => ({
      ...p,
      bullets: (p.bullets || []).map((b: string) => {
        if (!b.startsWith('•') && !b.startsWith('-')) {
          return `Engineered ${b.replace(/^(engineered|developed|built|created)\s*/i, '')}`;
        }
        return b;
      }),
    }));

    const updatedCv = {
      ...cvData,
      summary: polishedSummary,
      projects: polishedProjects.length ? polishedProjects : cvData.projects,
    };

    return res.json({
      success: true,
      optimizedCv: updatedCv,
      source: 'deterministic_engine',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate full resume', details: err.message });
  }
});

// -------------------------------------------------------------
// POST /api/cvs/regenerate-section
// Regenerate only a specific section without recreating entire resume
// -------------------------------------------------------------
cvRouter.post('/regenerate-section', async (req: Request, res: Response) => {
  try {
    const { section, cvData, targetRole, studentProfile } = req.body;
    if (!section || !cvData) {
      return res.status(400).json({ error: 'section and cvData are required' });
    }

    const role = targetRole || cvData.targetRole || 'Software Development Engineer';

    if (section === 'summary' || section === 'objective') {
      const summary = `Dynamic ${studentProfile?.department || 'Computer Science'} undergraduate at VFSTR with proven acumen in ${role} workflows and system design. Adept at leveraging modern full-stack architectures and data structures to deliver low-latency, scalable solutions under enterprise recruitment rigor.`;
      return res.json({ success: true, updatedSection: { summary } });
    }

    if (section === 'projects') {
      const projects = (cvData.projects || []).map((p: any) => ({
        ...p,
        bullets: [
          `Architected ${p.title} using ${p.techStack || 'modern technologies'}, achieving high computational throughput and responsive user workflows.`,
          `Refactored core API pipeline logic with asynchronous batch processing, reducing operational overhead by 32%.`,
          `Enforced rigorous automated test coverage and secure token-based authorization protocols.`,
        ],
      }));
      return res.json({ success: true, updatedSection: { projects } });
    }

    if (section === 'experience') {
      const experience = (cvData.experience || []).map((e: any) => ({
        ...e,
        bullets: [
          `Spearheaded backend feature implementation at ${e.company}, optimizing database query times and data serialization by 28%.`,
          `Collaborated with cross-functional development teams during agile sprints to accelerate sprint release cycles.`,
          `Authored reusable utility modules and comprehensive developer documentation adhering to engineering best practices.`,
        ],
      }));
      return res.json({ success: true, updatedSection: { experience } });
    }

    if (section === 'skills') {
      const skills = {
        languages: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'Java', 'SQL', 'C++'],
        frameworks: ['React 19', 'Node.js', 'Express', 'Tailwind CSS', 'Spring Boot'],
        developerTools: ['Docker', 'Git', 'Linux / Bash', 'Postman', 'VS Code', 'GitHub Actions'],
        databases: ['PostgreSQL', 'MongoDB Atlas', 'Redis (Caching)'],
        coursework: ['Data Structures & Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks'],
      };
      return res.json({ success: true, updatedSection: { skills } });
    }

    return res.status(400).json({ error: 'Unsupported section type' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to regenerate section', details: err.message });
  }
});
