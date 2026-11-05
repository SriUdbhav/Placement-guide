import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
  Target,
  BarChart3,
  Check,
} from 'lucide-react';
import { StudentProfile, JobDrive, ApplicationRecord, NavigationTab } from '../../types';

interface StudentDashboardProps {
  student: StudentProfile;
  drives: JobDrive[];
  applications: ApplicationRecord[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
  onApplyDrive: (driveId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  drives,
  applications,
  onNavigate,
  onOpenCopilotWithPrompt,
  onApplyDrive,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Dream' | 'Core Tech' | 'Cloud' | 'FinTech'>('All');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const filteredDrives = drives.filter((drive) => {
    if (selectedFilter === 'Dream') return drive.tier.includes('Dream (18+');
    if (selectedFilter === 'Core Tech') return drive.category === 'Core Tech';
    if (selectedFilter === 'Cloud') return drive.category === 'Cloud/DevOps';
    if (selectedFilter === 'FinTech') return drive.category === 'FinTech';
    return true;
  });

  const handleApply = (drive: JobDrive) => {
    onApplyDrive(drive.id);
    setAppliedNotice(`Application submitted for ${drive.companyName} (${drive.role})! Added to Application Tracker.`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {appliedNotice && (
        <div className="fixed top-20 right-8 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg animate-in slide-in-from-top-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Hero Welcome Greeting & Placement Readiness Score Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tier-1 Fast-Track Verified</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-200 border border-violet-400/30">
                CSE 2025 Batch
              </span>
              <span className="text-xs text-slate-400">
                Roll No: {student.rollNo}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {student.name}!
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Your autonomous AI placement model has evaluated 36 campus recruitment drives. You qualify for <strong>34 active drives</strong> with an outstanding placement readiness index of <strong>94/100</strong> (Top 5% cohort ranking).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('resume-analyzer')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1-Click ATS Resume Audit</span>
              </button>

              <button
                onClick={() => onNavigate('job-recommendations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Explore 8 AI-Matched Drives</span>
              </button>

              <button
                onClick={() => onOpenCopilotWithPrompt('Analyze my profile readiness for the Google SDE-1 OA scheduled on Nov 12.')}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-violet-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Ask AI Copilot</span>
              </button>
            </div>
          </div>

          {/* Placement Readiness Circular Score Display */}
          <div className="flex items-center space-x-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md shrink-0 lg:w-72 justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                AI Readiness Index
              </p>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-4xl font-extrabold text-white tabular-numbers">
                  {student.readinessScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+6% vs cohort baseline</span>
              </p>
            </div>

            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-violet-400"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span className="text-[9px] font-bold text-violet-200">Top 5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive Metric Cards (Stitch design system: level 1 cards with 16px radius, tabular numbers, sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Placement Readiness
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
              Tier-1 Ready
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              {student.readinessScore}%
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +6%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Predicted offer conversion probability: <strong>92.4%</strong>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Applications
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {applications.length} Drives
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              {applications.length}
            </span>
            <span className="text-xs text-slate-500">In Pipeline</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            2 Shortlisted • 1 Interview • 1 Assessment
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Drive Eligibility
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              0 Backlogs
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              34 <span className="text-lg font-medium text-slate-400">/ 36</span>
            </span>
            <span className="text-xs text-emerald-600 font-semibold">94.4%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            CGPA: <strong>{student.cgpa}</strong> • Fast-Track approved
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resume ATS Score
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              High Tier
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-numbers">
              {student.atsScore} <span className="text-lg font-medium text-slate-400">/ 100</span>
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+14 pts</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Passes 24/25 ATS criteria • 3 suggestions
          </p>
        </div>
      </div>

      {/* 12-Column Asymmetric Grid (8 cols main + 4 cols side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recommended Drives, Assessment Timeline, Skill Alignment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: AI Recommended Campus Drives */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Top AI-Matched Campus Drives
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-violet-100 text-violet-700">
                    Autonomous Matching
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by your profile alignment, CGPA eligibility, and verified skill overlap.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto overflow-x-auto max-w-full">
                {(['All', 'Dream', 'Core Tech', 'Cloud', 'FinTech'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                      selectedFilter === tab
                        ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Drive Cards List */}
            <div className="divide-y divide-slate-100 mt-2">
              {filteredDrives.slice(0, 4).map((drive) => {
                const isAlreadyApplied = drive.isApplied || applications.some((a) => a.jobId === drive.id);
                return (
                  <div
                    key={drive.id}
                    className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors group"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {drive.companyName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{drive.matchScore}% Match</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {drive.workMode}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-700">
                        {drive.role}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-bold text-indigo-600 tabular-numbers">
                          ₹{drive.ctcPackageLpa} LPA
                        </span>
                        <span>•</span>
                        <span>Min CGPA: {drive.minCgpa}</span>
                        <span>•</span>
                        <span>{drive.location}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">
                          Deadline: {new Date(drive.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {drive.requiredSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      {isAlreadyApplied ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(drive)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer hover:shadow-indigo-500/20"
                        >
                          Quick Apply
                        </button>
                      )}

                      <button
                        onClick={() => onOpenCopilotWithPrompt(`What are the key preparation tips and technical interview questions for ${drive.companyName} ${drive.role}?`)}
                        className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer font-medium"
                      >
                        <span>Prep with AI</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Showing 4 of {drives.length} active campus drives
              </span>
              <button
                onClick={() => onNavigate('job-recommendations')}
                className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>View All Drives & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 2: Upcoming Drive Assessments & Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Upcoming Assessments & Interviews
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                November 2026 Schedule
              </span>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span className="text-[10px] font-bold uppercase">Nov</span>
                    <span className="text-sm font-extrabold leading-tight">12</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Google SDE-I — Online Coding Assessment
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                        10:00 AM IST
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Platform: HackerRank • 2 Coding questions (DP/Graphs) + 1 System MCQs • 90 mins.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  Start Google Mock
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">Nov</span>
                    <span className="text-sm font-extrabold leading-tight">16</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Microsoft Azure Core — Technical Screen Round 1
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        02:30 PM IST
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Platform: Microsoft Teams & CodeSignal • Live coding on distributed algorithms.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenCopilotWithPrompt('Simulate a 15-minute live technical interview for Microsoft Azure Cloud Systems.')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  Practice Interview
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">Nov</span>
                    <span className="text-sm font-extrabold leading-tight">20</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Amazon AWS Storage — OA Part 1 (Code Debugging)
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        11:00 AM IST
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Amazon Internal Assessment portal • 7 Debugging + 2 Coding + Work Simulation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  Amazon Prep
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Skill Alignment & Target SDE Competencies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Core SDE Competencies vs Campus Target
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmark aligned with Tier-1 recruitment rubrics (Amazon, Google, Microsoft).
                </p>
              </div>
              <button
                onClick={() => onNavigate('skill-gap')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Full Gap Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">Data Structures & Algorithms</span>
                  <span className="text-emerald-700 font-bold">95% (Target: 90%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  450+ LeetCode solved • LeetCode Knight rank verified
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">TypeScript & Modern React</span>
                  <span className="text-emerald-700 font-bold">92% (Target: 85%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Full-stack production projects with server state & typed APIs
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">Distributed Systems & Concurrency</span>
                  <span className="text-amber-800 font-bold">78% (Target: 90%)</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  Gap identified: Study Raft consensus, rate limiting, and distributed caching
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">Kubernetes & Orchestration</span>
                  <span className="text-amber-800 font-bold">62% (Target: 80%)</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '62%' }} />
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  Recommended for Oracle & Microsoft: Add CKA hands-on deployment project
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Autonomous Copilot Insights, Resume ATS Quick Snapshot, TPO Notices */}
        <div className="lg:col-span-4 space-y-6">
          {/* Autonomous Copilot Insights Card */}
          <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-violet-800/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/30 border border-violet-400/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  AI Copilot Proactive Insights
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-violet-200">
                LIVE
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                  <span>High-Value Optimization</span>
                  <span>+12% Match</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  The upcoming Oracle OCI drive weights <strong>Kubernetes</strong> and <strong>Kafka</strong> heavily. Adding your containerized task queue project boosts your profile score from 82% to 94%.
                </p>
                <button
                  onClick={() => onOpenCopilotWithPrompt('Draft the resume project bullet points for a Kubernetes & Kafka containerized task queue project to match Oracle OCI.')}
                  className="text-[11px] font-semibold text-violet-300 hover:text-white flex items-center space-x-1 pt-1 cursor-pointer"
                >
                  <span>Generate bullet points</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                  <span>Interview Readiness</span>
                  <span>Nov 12</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Google SDE-I OA is in 8 days. We detected 4 high-probability dynamic programming questions typical for Tier-1 colleges.
                </p>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="text-[11px] font-semibold text-violet-300 hover:text-white flex items-center space-x-1 pt-1 cursor-pointer"
                >
                  <span>Launch tailored interview simulation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Resume ATS Health Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Resume ATS Health Audit
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 tabular-numbers">
                88/100
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 font-medium mb-1 text-[11px]">
                  <span>Keyword Density & Relevance</span>
                  <span className="text-emerald-600 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 font-medium mb-1 text-[11px]">
                  <span>Quantified Business Impact</span>
                  <span className="text-indigo-600 font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 font-medium mb-1 text-[11px]">
                  <span>Formatting & Parser Compatibility</span>
                  <span className="text-emerald-600 font-bold">100% (Pass)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                  Top Missing ATS Keywords:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Kubernetes', 'Apache Kafka', 'GraphQL', 'CI/CD'].map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('resume-analyzer')}
                className="w-full mt-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Full ATS Resume Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Placement Cell (TPO) Notice Board */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Placement Cell (TPO) Notices
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Official
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                  <span>Mandatory Resume Lock</span>
                  <span className="text-rose-600">Nov 10</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Final freeze for Tier-1 companies (CTC &gt; 18 LPA). Changes will not be permitted post Nov 10 midnight.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                  <span>No-Backlog Verification</span>
                  <span className="text-emerald-600">Verified</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Your academic records show 0 active backlogs and 8.92 CGPA. Cleared for all campus interviews.
                </p>
              </div>

              <button
                onClick={() => onNavigate('eligibility-checker')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Check All Company Criteria</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
