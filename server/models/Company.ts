import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  companyId: string;
  name: string;
  industry: string;
  website?: string;
  tier: 'Dream' | 'Super Dream' | 'Standard' | 'Mass';
  logoUrl?: string;
  contactEmail: string;
  description: string;
  headquarters: string;
  hiringStatus: 'Active' | 'Upcoming' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    companyId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true },
    industry: { type: String, required: true },
    website: { type: String },
    tier: {
      type: String,
      enum: ['Dream', 'Super Dream', 'Standard', 'Mass'],
      default: 'Dream',
    },
    logoUrl: { type: String },
    contactEmail: { type: String, required: true },
    description: { type: String, required: true },
    headquarters: { type: String, default: 'Bengaluru, India' },
    hiringStatus: {
      type: String,
      enum: ['Active', 'Upcoming', 'Closed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Company =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
