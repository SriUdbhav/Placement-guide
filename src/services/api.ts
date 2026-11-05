import { JobDrive, ApplicationRecord, StudentProfile, ApplicationStatus } from '../types';

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
};
