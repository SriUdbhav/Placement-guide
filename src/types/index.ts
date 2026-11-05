export type UserRole = 'student' | 'tpo' | 'recruiter' | 'admin';

export type NavigationTab =
  | 'student-dashboard'
  | 'resume-analyzer'
  | 'job-recommendations'
  | 'eligibility-checker'
  | 'skill-gap'
  | 'mock-interview'
  | 'application-tracker'
  | 'tpo-dashboard'
  | 'recruiter-dashboard'
  | 'admin-dashboard';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  batch: string;
  cgpa: number;
  activeBacklogs: number;
  clearedBacklogs: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  readinessScore: number;
  atsScore: number;
  tierCategory: 'Tier 1' | 'Tier 2' | 'Tier 3';
  skills: string[];
  placed: boolean;
  offersReceived: number;
  maxCtcOfferedLpa?: number;
}

export interface JobDrive {
  id: string;
  companyName: string;
  logoUrl?: string;
  role: string;
  ctcPackageLpa: number;
  stipendPerMonth?: number;
  tier: 'Dream (18+ LPA)' | 'Super Dream (12-18 LPA)' | 'Standard (6-12 LPA)' | 'Mass (3-6 LPA)';
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  category: 'Core Tech' | 'FinTech' | 'Cloud/DevOps' | 'Data Science' | 'Consulting';
  minCgpa: number;
  maxBacklogs: number;
  eligibleDepartments: string[];
  deadline: string;
  assessmentDate: string;
  matchScore: number;
  requiredSkills: string[];
  preferredSkills: string[];
  positionsCount: number;
  description: string;
  isApplied?: boolean;
  applicationStatus?: ApplicationStatus;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'HR Interview'
  | 'Offer Received'
  | 'Rejected';

export interface ApplicationRecord {
  id: string;
  jobId: string;
  companyName: string;
  role: string;
  ctcPackageLpa: number;
  appliedDate: string;
  status: ApplicationStatus;
  nextRound?: string;
  nextRoundDate?: string;
  aiReadinessScore: number;
  feedbackNotes?: string;
}

export interface SkillItem {
  name: string;
  category: 'Core CS' | 'Languages' | 'Cloud & Systems' | 'AI / Data';
  currentLevel: number; // 0 - 100
  targetLevel: number; // 0 - 100
  gapSeverity: 'low' | 'medium' | 'high';
  curatedResource: string;
}

export interface MockInterviewSession {
  id: string;
  role: string;
  company: string;
  overallScore?: number;
  date: string;
  status: 'In Progress' | 'Completed';
  questions: Array<{
    id: number;
    question: string;
    type: 'technical' | 'behavioral' | 'system_design';
    studentAnswer?: string;
    feedback?: string;
    starScore?: number; // 1-10
  }>;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'demo_intelligence';
  suggestedActions?: string[];
}
