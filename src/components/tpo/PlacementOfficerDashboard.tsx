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
  Mail,
  Send,
  AlertCircle,
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
      studentName: 'Priya Patel',
      rollNo: '21CS099',
      cgpa: 9.15,
      department: 'CSE',
      requestedDrive: 'Uber SDE II',
      status: 'Approved',
      verifiedDate: 'Just now',
    },
    {
      id: 'appr-3',
      studentName: 'Sneha Patel',
      rollNo: '21IT023',
      cgpa: 8.74,
      department: 'IT',
      requestedDrive: 'Microsoft Azure Core',
      status: 'Pending',
      verifiedDate: 'Pending',
    },
    {
      id: 'appr-4',
      studentName: 'Rohan Verma',
      rollNo: '21EC089',
      cgpa: 8.45,
      department: 'ECE',
      requestedDrive: 'Amazon AWS Storage',
      status: 'Pending',
      verifiedDate: 'Pending',
    },
  ]);

  // Email Notification Dispatch State
  const [selectedDriveForEmail, setSelectedDriveForEmail] = useState('job-goog-01');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<string | null>(null);

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpTestResult(`✅ Test email delivered successfully to ${data.recipient}! Message ID: ${data.messageId}`);
      } else {
        setSmtpTestResult(`❌ Test email error: ${data.error || 'Failed to send'}`);
      }
    } catch (e: any) {
      setSmtpTestResult(`❌ Connection error: ${e.message}`);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Approved', verifiedDate: 'Just now' } : item
      )
    );
  };

  const handleDispatchNotification = async () => {
    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const res = await fetch(`/api/jobs/${selectedDriveForEmail}/notify-eligible`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setDispatchResult(data.message);
      } else {
        setDispatchResult(`Dispatch note: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setDispatchResult(`Error dispatching emails: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 transition-colors shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-semibold text-[var(--accent-brand)] uppercase tracking-wider">
                Official Campus Portal
              </span>
              <span className="text-xs text-[var(--text-muted)]">·</span>
              <span className="text-xs text-[var(--text-muted)]">Graduation Season 2025</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Placement & Training Cell (TPO) Intelligence
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Institutional accreditation compliance, automated candidate verification, and personalized placement notifications.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => alert('Official accreditation placement report exported.')}
              className="px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] hover:border-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)]">Batch Placement Rate</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[var(--text-main)] tabular-numbers">
              {metrics.placementRatePercentage}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2% YoY
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            <strong>{metrics.placedStudents}</strong> placed of {metrics.totalEligibleStudents} eligible
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)]">Average Package (CTC)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[var(--accent-brand)] tabular-numbers">
              ₹{metrics.averagePackageLpa} LPA
            </span>
            <span className="text-xs text-[var(--text-muted)]">Median: ₹{metrics.medianPackageLpa}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Highest Package: <strong>₹{metrics.highestPackageLpa} LPA</strong>
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)]">Active Hiring Partners</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[var(--text-main)] tabular-numbers">
              {metrics.activeRecruiters}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">Enterprises</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {metrics.ongoingDrives} campus drives currently live
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)]">Dream Offers (&gt;18 LPA)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-violet-600 tabular-numbers">
              30.4%
            </span>
            <span className="text-xs text-[var(--text-muted)]">215 Students</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Google, Microsoft, Amazon, Uber, GS
          </p>
        </div>
      </div>

      {/* Feature Section: Personalized Placement Notification Dispatcher */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[var(--border-subtle)] mb-4">
          <Mail className="w-4 h-4 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-main)]">
              Personalized Gmail Placement Notification Dispatcher
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Identify students matching strict eligibility criteria (CGPA, backlogs, branch) and send personalized opportunity emails.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">
              Select Recruitment Drive
            </label>
            <select
              value={selectedDriveForEmail}
              onChange={(e) => setSelectedDriveForEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
            >
              <option value="job-goog-01">Google — SDE I Core Systems (₹28.5 LPA · Min 8.5 CGPA)</option>
              <option value="job-msft-02">Microsoft — Azure Cloud Solutions (₹22.0 LPA · Min 8.0 CGPA)</option>
              <option value="job-amzn-03">Amazon — AWS Storage Engineer (₹26.0 LPA · Min 7.5 CGPA)</option>
              <option value="job-uber-01">Uber — Software Engineer II (₹32.0 LPA · Min 8.0 CGPA)</option>
            </select>
          </div>

          <div className="sm:pt-5 flex items-center space-x-2">
            <button
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Send a verification test email to configured Gmail address without notifying students"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isTestingSmtp ? 'Verifying...' : 'Test SMTP (Send to My Gmail)'}</span>
            </button>

            <button
              onClick={handleDispatchNotification}
              disabled={isDispatching}
              className="px-4 py-2 bg-[var(--accent-brand)] hover:opacity-90 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDispatching ? 'Auditing & Sending...' : 'Dispatch Emails to Eligible Students'}</span>
            </button>
          </div>
        </div>

        {smtpTestResult && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{smtpTestResult}</span>
          </div>
        )}

        {dispatchResult && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{dispatchResult}</span>
          </div>
        )}
      </div>

      {/* Candidate Eligibility Verifications Queue */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-[var(--text-main)]">
              Candidate Eligibility Verifications Queue
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Dean & TPO Clearance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Dept & Roll</th>
                <th className="py-2.5 px-3">CGPA</th>
                <th className="py-2.5 px-3">Target Company Drive</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {pendingApprovals.map((appr) => (
                <tr key={appr.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-main)]">
                    {appr.studentName}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                    {appr.department} • {appr.rollNo}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-main)] tabular-numbers">
                    {appr.cgpa}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[var(--accent-brand)]">
                    {appr.requestedDrive}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        appr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {appr.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(appr.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Verify & Clear
                      </button>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[11px]">Cleared</span>
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
