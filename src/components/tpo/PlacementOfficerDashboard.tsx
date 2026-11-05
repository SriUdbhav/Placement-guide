import React, { useState } from 'react';
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { MOCK_TPO_METRICS } from '../../data/mockData';

export const PlacementOfficerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(MOCK_TPO_METRICS);
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'appr-1',
      studentName: 'Aarav Sharma',
      rollNo: '21CS048',
      cgpa: 8.92,
      department: 'CSE',
      requestedDrive: 'Google SDE-I',
      status: 'Approved',
      verifiedDate: '2026-11-04',
    },
    {
      id: 'appr-2',
      studentName: 'Sneha Patel',
      rollNo: '21IT023',
      cgpa: 8.74,
      department: 'IT',
      requestedDrive: 'Microsoft Azure Core',
      status: 'Pending',
      verifiedDate: 'Pending',
    },
    {
      id: 'appr-3',
      studentName: 'Rohan Verma',
      rollNo: '21EC089',
      cgpa: 8.45,
      department: 'ECE',
      requestedDrive: 'Amazon AWS Storage',
      status: 'Pending',
      verifiedDate: 'Pending',
    },
    {
      id: 'appr-4',
      studentName: 'Kavya Nair',
      rollNo: '21CS112',
      cgpa: 9.15,
      department: 'CSE',
      requestedDrive: 'Atlassian Product Engineer',
      status: 'Pending',
      verifiedDate: 'Pending',
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Approved', verifiedDate: 'Just now' } : item
      )
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Placement & Training Cell (TPO) Intelligence
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Official Campus Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time batch analytics, recruiter drive orchestrations, and institutional accreditation compliance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Campus Placement Report exported to PDF & Excel format.')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Accreditation Report</span>
            </button>
            <button
              onClick={() => alert('New Campus Recruitment Drive form opened.')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Company Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Batch Placement Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              {metrics.placementRatePercentage}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2% YoY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            <strong>{metrics.placedStudents}</strong> placed of {metrics.totalEligibleStudents} eligible
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Package (CTC)
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-indigo-700 tabular-numbers">
              ₹{metrics.averagePackageLpa} LPA
            </span>
            <span className="text-xs font-medium text-slate-500">Median: ₹{metrics.medianPackageLpa}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Highest Package: <strong>₹{metrics.highestPackageLpa} LPA</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Enterprise Recruiters
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              {metrics.activeRecruiters}
            </span>
            <span className="text-xs font-semibold text-indigo-600">Companies</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.ongoingDrives} campus drives currently live
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Dream Offers (&gt;18 LPA)
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-violet-700 tabular-numbers">
              30.4%
            </span>
            <span className="text-xs font-semibold text-slate-700">215 Students</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Google, Microsoft, Amazon, Atlassian, GS
          </p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Department-wise Placement Performance (2025 Graduating Cohort)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Eligible Cohort</th>
                <th className="py-3 px-3">Placed Count</th>
                <th className="py-3 px-3">Placement %</th>
                <th className="py-3 px-3">Average CTC</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.departmentStats.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {dept.department}
                  </td>
                  <td className="py-3 px-3 tabular-numbers text-slate-600">
                    {dept.eligible}
                  </td>
                  <td className="py-3 px-3 tabular-numbers font-semibold text-slate-800">
                    {dept.placed}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700 tabular-numbers">
                    {dept.percentage}%
                  </td>
                  <td className="py-3 px-3 font-bold text-indigo-700 tabular-numbers">
                    ₹{dept.avgCtcLpa} LPA
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tier-1 Benchmark Met
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Student Eligibility Approvals */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Candidate Eligibility Verifications Queue
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            TPO Dean Authorization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Candidate</th>
                <th className="py-3 px-3">Dept & Roll</th>
                <th className="py-3 px-3">CGPA</th>
                <th className="py-3 px-3">Target Company Drive</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingApprovals.map((appr) => (
                <tr key={appr.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {appr.studentName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {appr.department} • {appr.rollNo}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 tabular-numbers">
                    {appr.cgpa}
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-700">
                    {appr.requestedDrive}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        appr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {appr.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(appr.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Verify & Clear
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Cleared</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
