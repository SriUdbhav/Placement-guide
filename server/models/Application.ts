import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatusType =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'HR Interview'
  | 'Offer Received'
  | 'Rejected';

export interface IApplication extends Document {
  applicationId: string;
  studentId: string;
  studentName?: string;
  jobId: string;
  companyName: string;
  role: string;
  ctcPackageLpa: number;
  appliedDate: Date;
  status: ApplicationStatusType;
  nextRound?: string;
  nextRoundDate?: string;
  aiReadinessScore: number;
  feedbackNotes?: string;
  interviewFeedback?: string;
  verifiedByTpo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String },
    jobId: { type: String, required: true, index: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    ctcPackageLpa: { type: Number, required: true },
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Online Assessment',
        'Technical Interview',
        'HR Interview',
        'Offer Received',
        'Rejected',
      ],
      default: 'Applied',
    },
    nextRound: { type: String },
    nextRoundDate: { type: String },
    aiReadinessScore: { type: Number, default: 85 },
    feedbackNotes: { type: String },
    interviewFeedback: { type: String },
    verifiedByTpo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Application =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
