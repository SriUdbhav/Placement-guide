import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  interviewId: string;
  studentId: string;
  jobId?: string;
  companyName: string;
  role: string;
  roundType: 'Technical' | 'Behavioral' | 'System Design' | 'HR' | 'Mock Practice';
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string;
  interviewerName?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  score?: number; // 0 to 10
  questions: Array<{
    id: number;
    question: string;
    answer?: string;
    feedback?: string;
    score?: number;
  }>;
  summaryFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    interviewId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    jobId: { type: String },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    roundType: {
      type: String,
      enum: ['Technical', 'Behavioral', 'System Design', 'HR', 'Mock Practice'],
      default: 'Technical',
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingLink: { type: String },
    interviewerName: { type: String, default: 'Placement Technical Panel' },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    score: { type: Number, min: 0, max: 10 },
    questions: [
      {
        id: { type: Number },
        question: { type: String },
        answer: { type: String },
        feedback: { type: String },
        score: { type: Number },
      },
    ],
    summaryFeedback: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Interview =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
