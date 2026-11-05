import { JobDrive, ApplicationRecord, StudentProfile, ApplicationStatus, CVData } from '../types';

export interface DatabaseStatusResponse {
  isConnected: boolean;
  connectionState: string;
  source: 'mongodb_atlas' | 'local_memory_fallback';
  databaseName: string;
  ipWhitelistHint?: string;
  hasEnvUri?: boolean;
  sanitizedHost?: string;
  lastErrorMessage?: string;
  counts: {
    students: number;
    companies: number;
    jobs: number;
    applications: number;
    resumes: number;
    interviews: number;
    notifications: number;
    users: number;
  };
}

export const apiClient = {
  // Database status
  async getDatabaseStatus(): Promise<DatabaseStatusResponse | null> {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('apiClient: failed to fetch db status', e);
      return null;
    }
  },

  async reconnectDatabase(): Promise<DatabaseStatusResponse | null> {
    try {
      const res = await fetch('/api/db/reconnect', { method: 'POST' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('apiClient: failed to reconnect db', e);
      return null;
    }
  },

  // Students
  async getStudent(id: string = 'stu-2025-089'): Promise<StudentProfile | null> {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: data.studentId || data._id,
        name: data.name,
        email: data.email,
        rollNo: data.rollNo,
        department: data.department,
        batch: data.batch,
        cgpa: data.cgpa,
        activeBacklogs: data.activeBacklogs,
        clearedBacklogs: data.clearedBacklogs,
        tenthPercentage: data.tenthPercentage,
        twelfthPercentage: data.twelfthPercentage,
        readinessScore: data.readinessScore,
        atsScore: data.atsScore,
        tierCategory: data.tierCategory,
        skills: data.skills || [],
        placed: data.placed,
        offersReceived: data.offersReceived,
        maxCtcOfferedLpa: data.maxCtcOfferedLpa,
      };
    } catch (e) {
      console.warn('apiClient: failed to fetch student', e);
      return null;
    }
  },

  async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<boolean> {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('apiClient: failed to update student', e);
      return false;
    }
  },

  // Jobs / Placement Drives
  async getJobs(params?: { tier?: string; category?: string; search?: string }): Promise<JobDrive[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.tier) searchParams.append('tier', params.tier);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);

      const url = `/api/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();

      return data.map((d: any) => ({
        id: d.jobId || d._id,
        companyName: d.companyName,
        role: d.role,
        ctcPackageLpa: d.ctcPackageLpa,
        stipendPerMonth: d.stipendPerMonth,
        tier: d.tier,
        location: d.location,
        workMode: d.workMode,
        category: d.category,
        minCgpa: d.minCgpa,
        maxBacklogs: d.maxBacklogs,
        eligibleDepartments: d.eligibleDepartments || [],
        deadline: typeof d.deadline === 'string' ? d.deadline : new Date(d.deadline).toISOString(),
        assessmentDate: typeof d.assessmentDate === 'string' ? d.assessmentDate : new Date(d.assessmentDate).toISOString(),
        matchScore: d.matchScore,
        requiredSkills: d.requiredSkills || [],
        preferredSkills: d.preferredSkills || [],
        positionsCount: d.positionsCount,
        description: d.description,
      }));
    } catch (e) {
      console.warn('apiClient: failed to fetch jobs', e);
      return [];
    }
  },

  async createJob(jobData: Partial<JobDrive>): Promise<JobDrive | null> {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('apiClient: failed to create job', e);
      return null;
    }
  },

  async verifyEligibility(jobId: string, criteria: { cgpa: number; activeBacklogs: number; department: string }) {
    try {
      const res = await fetch(`/api/jobs/${jobId}/verify-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('apiClient: failed to verify eligibility', e);
      return null;
    }
  },

  // Applications
  async getApplications(studentId?: string): Promise<ApplicationRecord[]> {
    try {
      const url = studentId ? `/api/applications?studentId=${studentId}` : '/api/applications';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();

      return data.map((a: any) => ({
        id: a.applicationId || a._id,
        jobId: a.jobId,
        companyName: a.companyName,
        role: a.role,
        ctcPackageLpa: a.ctcPackageLpa,
        appliedDate: typeof a.appliedDate === 'string' ? a.appliedDate.split('T')[0] : new Date(a.appliedDate).toISOString().split('T')[0],
        status: a.status,
        nextRound: a.nextRound,
        nextRoundDate: a.nextRoundDate,
        aiReadinessScore: a.aiReadinessScore,
        feedbackNotes: a.feedbackNotes,
      }));
    } catch (e) {
      console.warn('apiClient: failed to fetch applications', e);
      return [];
    }
  },

  async submitApplication(applicationData: {
    studentId: string;
    studentName: string;
    jobId: string;
    companyName: string;
    role: string;
    ctcPackageLpa: number;
    aiReadinessScore: number;
  }): Promise<ApplicationRecord | null> {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });
      if (!res.ok) return null;
      const a = await res.json();
      return {
        id: a.applicationId || a._id,
        jobId: a.jobId,
        companyName: a.companyName,
        role: a.role,
        ctcPackageLpa: a.ctcPackageLpa,
        appliedDate: typeof a.appliedDate === 'string' ? a.appliedDate.split('T')[0] : new Date(a.appliedDate).toISOString().split('T')[0],
        status: a.status,
        nextRound: a.nextRound,
        nextRoundDate: a.nextRoundDate,
        aiReadinessScore: a.aiReadinessScore,
        feedbackNotes: a.feedbackNotes,
      };
    } catch (e) {
      console.warn('apiClient: failed to submit application', e);
      return null;
    }
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (e) {
      console.warn('apiClient: failed to update status', e);
      return false;
    }
  },

  // Notifications
  async getNotifications(role: string = 'student') {
    try {
      const res = await fetch(`/api/notifications?role=${role}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async markNotificationRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      // ignore
    }
  },

  // CV Generator
  async getCVs(studentId?: string): Promise<CVData[]> {
    try {
      const url = studentId ? `/api/cvs?studentId=${encodeURIComponent(studentId)}` : '/api/cvs';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((d: any) => ({
        ...d,
        id: d.cvId || d._id || d.id,
      }));
    } catch (e) {
      console.warn('apiClient: failed to fetch CVs', e);
      return [];
    }
  },

  async getCV(id: string): Promise<CVData | null> {
    try {
      const res = await fetch(`/api/cvs/${id}`);
      if (!res.ok) return null;
      const d = await res.json();
      return {
        ...d,
        id: d.cvId || d._id || d.id,
      };
    } catch (e) {
      console.warn('apiClient: failed to fetch CV', e);
      return null;
    }
  },

  async createCV(cvData: Partial<CVData>): Promise<CVData | null> {
    try {
      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData),
      });
      if (!res.ok) return null;
      const d = await res.json();
      return {
        ...d,
        id: d.cvId || d._id || d.id,
      };
    } catch (e) {
      console.warn('apiClient: failed to create CV', e);
      return null;
    }
  },

  async updateCV(id: string, updates: Partial<CVData>): Promise<CVData | null> {
    try {
      const res = await fetch(`/api/cvs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return null;
      const d = await res.json();
      return {
        ...d,
        id: d.cvId || d._id || d.id,
      };
    } catch (e) {
      console.warn('apiClient: failed to update CV', e);
      return null;
    }
  },

  async deleteCV(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/cvs/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.warn('apiClient: failed to delete CV', e);
      return false;
    }
  },

  async enhanceCVSection(params: {
    sectionType: 'objective' | 'summary' | 'project' | 'experience';
    draftText: string;
    targetRole?: string;
    studentContext?: any;
  }): Promise<string> {
    try {
      const res = await fetch('/api/cvs/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Enhancement request failed');
      const data = await res.json();
      return data.enhancedText || '';
    } catch (e) {
      console.warn('apiClient: AI enhance error', e);
      return '';
    }
  },

  async sendCVChatStep(payload: {
    message: string;
    stepId: string;
    conversationHistory?: any[];
    currentCv?: Partial<CVData>;
    studentProfile?: any;
    targetRole?: string;
    targetCompany?: string;
    jobDescription?: string;
  }): Promise<{
    success?: boolean;
    aiResponse: string;
    nextStepId: string;
    progressPercent: number;
    quickReplies: string[];
    cvPatch: Partial<CVData>;
    modelUsed?: string;
    isGeneralQuery?: boolean;
  }> {
    const res = await fetch('/api/cvs/chat-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error || errJson.details || `Server responded with status ${res.status}`;
      throw new Error(msg);
    }
    return await res.json();
  },

  async generateFullResumeWithAI(payload: {
    cvData: Partial<CVData>;
    targetRole?: string;
    studentProfile?: any;
  }): Promise<Partial<CVData> | null> {
    try {
      const res = await fetch('/api/cvs/generate-full-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.optimizedCv || null;
    } catch (e) {
      console.warn('apiClient: generateFullResumeWithAI failed', e);
      return null;
    }
  },

  async regenerateCVSection(payload: {
    section: 'summary' | 'projects' | 'experience' | 'skills';
    cvData: Partial<CVData>;
    targetRole?: string;
    studentProfile?: any;
  }): Promise<any | null> {
    try {
      const res = await fetch('/api/cvs/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.updatedSection || null;
    } catch (e) {
      console.warn('apiClient: regenerateCVSection failed', e);
      return null;
    }
  },

  async streamResumeGeneration(
    payload: {
      studentProfile?: any;
      targetRole?: string;
      targetCompany?: string;
      jobDescription?: string;
      cvData?: Partial<CVData>;
    },
    onChunk: (chunkText: string) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/cvs/stream-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const data = JSON.parse(trimmed.replace(/^data:\s*/, ''));
              if (data.text) {
                onChunk(data.text);
              }
              if (data.done) {
                onComplete();
                return;
              }
            } catch (err) {
              // Ignore malformed SSE chunk
            }
          }
        }
      }

      onComplete();
    } catch (err) {
      onError(err);
    }
  },
};
