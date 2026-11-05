import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Calendar,
  Building2,
  Star,
  FileText,
  X,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState([
    {
      id: 'cand-01',
      name: 'Aarav Sharma',
      rollNo: '21CS048',
      cgpa: 8.92,
      department: 'Computer Science',
      roleApplied: 'Software Development Engineer I (Core Systems)',
      aiMatchScore: 96,
      atsScore: 88,
      status: 'Online Assessment Scheduled',
      skills: ['TypeScript', 'Node.js', 'React 19', 'PostgreSQL', 'Docker', 'DSA (450+)'],
      flag: 'Top 1% Algorithmic Candidate',
    },
    {
      id: 'cand-02',
      name: 'Kavya Nair',
      rollNo: '21CS112',
      cgpa: 9.15,
      department: 'Computer Science',
      roleApplied: 'Software Development Engineer I (Core Systems)',
      aiMatchScore: 94,
      atsScore: 91,
      status: 'Shortlisted for Assessment',
      skills: ['C++', 'Python', 'Distributed Algorithms', 'Linux Kernel', 'System Design'],
      flag: 'High CGPA & Research Paper',
    },
    {
      id: 'cand-03',
      name: 'Vikram Malhotra',
      rollNo: '21IT054',
      cgpa: 8.68,
      department: 'Information Technology',
      roleApplied: 'Cloud Solutions Engineer',
      aiMatchScore: 89,
      atsScore: 84,
      status: 'Under Review',
      skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'Docker'],
      flag: 'AWS Certified Solutions Architect',
    },
    {
      id: 'cand-04',
      name: 'Pooja Reddy',
      rollNo: '21CS091',
      cgpa: 8.85,
      department: 'Computer Science',
      roleApplied: 'Software Development Engineer I (Core Systems)',
      aiMatchScore: 91,
      atsScore: 86,
      status: 'Technical Screen Round 1',
      skills: ['Python', 'PyTorch', 'REST APIs', 'FastAPI', 'Redis'],
      flag: 'Open Source Contributor',
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setStatusMessage(`Candidate status updated to "${newStatus}"!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {statusMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Recruiter Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Recruiter Talent Portal & Candidate Dossier
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                Google Campus TA Lead
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Screening final-year engineering applicants ranked by AI readiness score, verified CGPA cutoffs, and code submissions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Exporting candidate shortlist CSV...')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Shortlist CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screening Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Campus Applicant Pool (Ranked by AI Match %)
            </h2>
            <p className="text-xs text-slate-500">
              Target Opening: Software Development Engineer I (Core Systems)
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            {candidates.length} Qualified Applicants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Candidate</th>
                <th className="py-3 px-3">CGPA & Dept</th>
                <th className="py-3 px-3">AI Match Score</th>
                <th className="py-3 px-3">ATS Score</th>
                <th className="py-3 px-3">Hiring Pipeline Stage</th>
                <th className="py-3 px-3">Key Highlight</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900 block">
                      {cand.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Roll: {cand.rollNo}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 tabular-numbers">
                      {cand.cgpa}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {cand.department}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 flex items-center space-x-1 w-max">
                      <Sparkles className="w-3 h-3" />
                      <span>{cand.aiMatchScore}% Match</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-700 tabular-numbers">
                    {cand.atsScore} / 100
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={cand.status}
                      onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-indigo-600"
                    >
                      <option>Under Review</option>
                      <option>Shortlisted for Assessment</option>
                      <option>Online Assessment Scheduled</option>
                      <option>Technical Screen Round 1</option>
                      <option>Final Interview</option>
                      <option>Offer Extended</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {cand.flag}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Dossier Popup */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-lg font-extrabold text-slate-900 block">
                  {selectedCandidate.name} — Full Candidate Dossier
                </span>
                <span className="text-xs text-slate-500">
                  {selectedCandidate.department} • CGPA: {selectedCandidate.cgpa}
                </span>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800">Verified Technical Stack:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCandidate.skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Match Index</span>
                  <span className="text-xl font-extrabold text-violet-700">{selectedCandidate.aiMatchScore}%</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">ATS Resume Index</span>
                  <span className="text-xl font-extrabold text-indigo-700">{selectedCandidate.atsScore} / 100</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed italic bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                "AI Synthesis: Candidate demonstrates exemplary algorithm design and asynchronous architecture skills. Verified no active backlogs. Highly recommended for technical screen."
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleStatusChange(selectedCandidate.id, 'Technical Screen Round 1');
                  setSelectedCandidate(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Advance to Technical Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
