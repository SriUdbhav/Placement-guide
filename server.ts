import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import { connectDatabase, getDatabaseStatus } from './server/db';
import { studentRouter } from './server/routes/students';
import { companyRouter } from './server/routes/companies';
import { jobRouter } from './server/routes/jobs';
import { applicationRouter } from './server/routes/applications';
import { interviewRouter } from './server/routes/interviews';
import { notificationRouter } from './server/routes/notifications';
import { resumeRouter } from './server/routes/resumes';
import { authRouter } from './server/routes/auth';
import { emailRouter } from './server/routes/email';
import { cvRouter } from './server/routes/cvs';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // Connect to Database (MongoDB Atlas with graceful local fallback)
  connectDatabase().catch((err) => {
    console.log('PlaceMate DB: Startup connection handler note:', err?.message || err);
  });

  // Check if GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY;
  const hasRealKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10);

  let genAI: GoogleGenAI | null = null;
  if (hasRealKey) {
    try {
      genAI = new GoogleGenAI({
        apiKey: apiKey as string,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('PlaceMate AI: Google GenAI initialized with gemini-3.8-flash');
    } catch (err) {
      console.warn('PlaceMate AI: Failed to initialize Google GenAI', err);
    }
  }

  // General System Status check endpoint
  app.get('/api/status', async (_req: Request, res: Response) => {
    const dbStatus = await getDatabaseStatus();
    res.json({
      status: 'active',
      hasGeminiKey: Boolean(genAI),
      model: 'gemini-3.8-flash',
      engine: genAI ? 'real_gemini' : 'simulation_demo',
      database: dbStatus,
      message: genAI
        ? 'Connected to Live AI Placement Engine'
        : 'Running in high-fidelity Demo Intelligence Mode (AI key not configured or demo requested)',
    });
  });

  // Database Health & Collection Counts endpoint
  app.get('/api/db/status', async (_req: Request, res: Response) => {
    try {
      const status = await getDatabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve database status', details: err.message });
    }
  });

  // Manual Atlas Reconnect Trigger
  app.post('/api/db/reconnect', async (_req: Request, res: Response) => {
    try {
      await connectDatabase();
      const status = await getDatabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: 'Reconnect attempt failed', details: err.message });
    }
  });

  // Mount REST API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/students', studentRouter);
  app.use('/api/companies', companyRouter);
  app.use('/api/jobs', jobRouter);
  app.use('/api/applications', applicationRouter);
  app.use('/api/interviews', interviewRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/resumes', resumeRouter);
  app.use('/api/cvs', cvRouter);
  app.use('/api/email', emailRouter);

  // AI Placement Copilot Endpoint
  app.post('/api/ai/copilot', async (req: Request, res: Response) => {
    const { message, context, mode } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If real Gemini is requested and available
    if (mode !== 'demo' && genAI) {
      try {
        const systemPrompt = `You are PlaceMate Copilot, an expert AI Placement and Recruitment Management Agent for Vignan's Foundation for Science, Technology & Research (VFSTR) aligned with Hackathon 2.0 Problem Statement 16.
You assist VFSTR students, Career Development Centre (CDC) officers, and recruiting partners with:
1. VFSTR Placement Bylaws & Tier Upgrades: Explaining the institutional one-student-one-job policy, Dream (6-12 LPA) and Super Dream (12-18+ LPA) upgrade eligibility, and zero-backlog policies.
2. Campus Placement Readiness: Tailored DSA strategies, system architecture, and STAR-method behavioral preparation for VFSTR visiting recruiters (Amazon, Google, Microsoft, Darwinbox, Cisco, TCS Digital, Cognizant GenC Next).
3. Eligibility Audits: Evaluating student CGPA cutoffs, 10th/12th percentages, and department criteria across VFSTR engineering branches (CSE, IT, AI & ML, ECE, EEE, ME, BT).
4. ATS Resume Optimization: Action-verb density, quantifiable latency/scale achievements, and keyword alignment.
5. Personalized Remedial Learning Paths for identified skill gaps.

Current Student Profile in view:
- Name: ${context?.studentName || 'Sri Udbhav / Aarav Sharma'} (B.Tech CSE, VFSTR 2025 Batch)
- CGPA: ${context?.cgpa || '9.24'} / 10.0 (Clean record, 0 active backlogs)
- Key Skills: React, Node.js, TypeScript, Python, PostgreSQL, Docker, Git, Distributed Systems, DSA (LeetCode 450+)
- Target Role: Software Development Engineer (Full-Stack / Distributed Systems)

Answer concisely, authoritatively, and professionally. Use markdown bullets and bold highlights. Provide concrete actionable next steps.`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}\nContext: ${JSON.stringify(context || {})}`,
        });

        return res.json({
          reply: response.text,
          source: 'gemini-3.8-flash',
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Gemini Copilot Error:', error);
        // Fallback to demo response gracefully
      }
    }

    // High-fidelity fallback / demo mode responses
    const lower = (message || '').toLowerCase();
    let reply = '';

    if (lower.includes('google') || lower.includes('interview')) {
      reply = `**Google SDE-I Preparation Protocol**:
- **Target Topics**: Binary Search Trees, Dynamic Programming (Grid/Knapsack), Graph Traversals (Dijkstra/Topological sort), and Concurrency basics.
- **Your Fit**: Your DSA readiness is rated at **95%**. 
- **Action Item**: Review Google's specific leadership principles: "Googleyness", collaboration under ambiguity, and time complexity tradeoffs in Big-O.
- **Drive Date**: Assessment opens on Nov 12 at 10:00 AM IST.`;
    } else if (lower.includes('resume') || lower.includes('ats')) {
      reply = `**Resume ATS Audit Analysis for Aarav Sharma**:
- **Current Score**: **88/100** (High Tier).
- **Strong Areas**: Clear quantifiable metrics (e.g. "Reduced API latency by 34% using Redis").
- **Gap Identified**: Add mentions of **Kubernetes** and **Kafka** in your Microservices project section.
- **Projected Boost**: Incorporating these keywords will elevate your match score with Oracle Cloud and Amazon from 82% to 94%.`;
    } else if (lower.includes('eligibility') || lower.includes('cgpa')) {
      reply = `**Eligibility Verification**:
- **Your CGPA**: 8.92 (0 Active Backlogs).
- **Eligible Drives**: **34 out of 36** active companies in the CSE portal.
- **Restricted Drives**: Only 2 companies (DE Shaw and Citadel) currently require a minimum 9.00 CGPA cutoff.
- **Tier 1 Status**: Approved by TPO with Fast-Track Verified status.`;
    } else if (lower.includes('gap') || lower.includes('skill')) {
      reply = `**Skill Gap Diagnosis (Target: High-Throughput SDE)**:
- **Strong Competencies**: TypeScript (94%), React (92%), Python (88%), DSA (95%).
- **Moderate Gap**: System Design (78%) — needs deeper understanding of distributed caching, rate-limiting algorithms (Token Bucket/Leaky Bucket), and consensus protocols (Raft/Paxos).
- **Recommended Resource**: Review the System Design Primer and complete 2 mock system architectures before the Amazon round.`;
    } else {
      reply = `Hello Aarav! I'm your PlaceMate AI Copilot. 

Based on your profile (CGPA: 8.92, SDE track), you are currently shortlisted for **2 active drives** and have an upcoming assessment with Google on **Nov 12**.

Here are 3 ways I can assist you right now:
1. **Resume ATS Optimization**: Analyze your resume against specific Job Descriptions.
2. **Drive Eligibility Audit**: Check strict criteria and tier limits for upcoming companies.
3. **Mock Interview Simulation**: Practice technical and behavioral questions with instant feedback.

What would you like to focus on?`;
    }

    return res.json({
      reply,
      source: 'demo_intelligence',
      timestamp: new Date().toISOString(),
    });
  });

  // AI Resume Analyzer Endpoint
  app.post('/api/ai/resume-analyzer', async (req: Request, res: Response) => {
    const { resumeText, targetRole, mode } = req.body;

    if (mode !== 'demo' && genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Analyze this resume for target role "${targetRole || 'Software Development Engineer'}":
Resume text:
${resumeText || 'Aarav Sharma - B.Tech CSE, Full Stack developer with React, Node.js, Python, PostgreSQL, Docker.'}

Provide an ATS score out of 100, strong points, missing keywords, and 3 specific bullet improvements. Format as JSON with keys: atsScore (number), summary (string), strengths (array of strings), missingKeywords (array of strings), recommendations (array of strings).`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          ...parsed,
          source: 'gemini-3.8-flash',
        });
      } catch (err) {
        console.error('Gemini Resume Analyzer Error:', err);
      }
    }

    // High fidelity realistic response
    return res.json({
      atsScore: 88,
      summary: 'Strong technical profile with verifiable engineering impact. Well structured for automated parsing by Taleo, Workday, and Greenhouse.',
      strengths: [
        'High density of measurable metrics and business outcomes (latency, user scale, query efficiency)',
        'Clear technology stack alignment with modern enterprise stacks (React 19, TypeScript, PostgreSQL, Docker)',
        'Clean section hierarchy with strict reverse-chronological project order',
      ],
      missingKeywords: ['Kubernetes', 'Apache Kafka', 'GraphQL', 'CI/CD Pipeline', 'Prometheus'],
      recommendations: [
        'Quantify cloud resource savings in your Distributed Task Queue project',
        'Add architectural keywords (Event-Driven Architecture, Microservices) in project descriptions',
        'Incorporate your recent LeetCode Guardian rank or competitive programming rating in the achievements header',
      ],
      source: 'demo_intelligence',
    });
  });

  // Database offline & error handling middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (
      err?.name === 'MongooseError' ||
      err?.name === 'MongoNetworkError' ||
      (err?.message && (err.message.includes('buffering timed out') || err.message.includes('ECONNREFUSED')))
    ) {
      console.warn('[AI Studio] Database offline — returning fallback response for:', req.path);
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
      }
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlaceMate AI server running on http://localhost:${PORT}`);
  });
}

startServer();
