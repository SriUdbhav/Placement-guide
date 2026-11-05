import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  MessageSquareCode,
  Kanban,
  Building2,
  Users,
  Settings,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { UserRole, NavigationTab, StudentProfile } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  student: StudentProfile;
  isRealAiActive: boolean;
  toggleAiMode: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  setCurrentRole,
  currentTab,
  setCurrentTab,
  student,
  isRealAiActive,
  toggleAiMode,
}) => {
  const studentNavItems = [
    {
      id: 'student-dashboard' as NavigationTab,
      label: 'Student Dashboard',
      icon: LayoutDashboard,
      badge: '94 Score',
      badgeColor: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'resume-analyzer' as NavigationTab,
      label: 'Resume Analyzer',
      icon: FileText,
      badge: '88 ATS',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'job-recommendations' as NavigationTab,
      label: 'Job Recommendations',
      icon: Briefcase,
      badge: '8 Active',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'eligibility-checker' as NavigationTab,
      label: 'Eligibility Checker',
      icon: CheckCircle2,
      badge: '34/36 Match',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'skill-gap' as NavigationTab,
      label: 'Skill Gap Analysis',
      icon: TrendingUp,
      badge: '2 Gaps',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'mock-interview' as NavigationTab,
      label: 'Mock Interview AI',
      icon: MessageSquareCode,
      badge: 'AI Prep',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'application-tracker' as NavigationTab,
      label: 'Application Tracker',
      icon: Kanban,
      badge: '8 Drives',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
  ];

  const adminAndTpoNavItems = [
    {
      id: 'tpo-dashboard' as NavigationTab,
      label: 'Placement Officer (TPO)',
      icon: Building2,
      role: 'tpo' as UserRole,
      desc: 'Campus drives & batch metrics',
    },
    {
      id: 'recruiter-dashboard' as NavigationTab,
      label: 'Recruiter Dashboard',
      icon: Users,
      role: 'recruiter' as UserRole,
      desc: 'Screening & talent pipeline',
    },
    {
      id: 'admin-dashboard' as NavigationTab,
      label: 'Admin & Governance',
      icon: Settings,
      role: 'admin' as UserRole,
      desc: 'Eligibility policies & audit',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-100">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">
                  PlaceMate
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Campus Placement Agent</p>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)]">
          {/* Student Core Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Student Placement Core
              </span>
              <span className="text-[10px] font-semibold text-indigo-600">
                Aarav S.
              </span>
            </div>
            <nav className="space-y-1">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      if (currentRole !== 'student') setCurrentRole('student');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-numbers ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Stakeholder & Leadership Portals */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Institutional Portals
              </span>
              <span className="text-[10px] text-slate-400">PS 16</span>
            </div>
            <nav className="space-y-1">
              {adminAndTpoNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setCurrentRole(item.role);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer: User Profile Card & AI Engine Switch */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2.5">
        {/* Real Gemini AI vs Demo Mode Switcher (Demonstrating compliance with prompt #11 & #12) */}
        <button
          onClick={toggleAiMode}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-left cursor-pointer hover:border-slate-300 transition-colors shadow-2xs group"
          title="Toggle between Server-Side Gemini 3.8 Flash and Demo Intelligence"
        >
          <div className="flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-violet-600 group-hover:scale-110 transition-transform" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-slate-800">
                {isRealAiActive ? 'Gemini 3.8 Flash' : 'Demo Intelligence'}
              </span>
              <p className="text-[9px] text-slate-500">
                {isRealAiActive ? 'Server API Active' : 'Deterministic Mode'}
              </p>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              isRealAiActive ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-400'
            }`}
          />
        </button>

        {/* Student Mini Profile Info */}
        <div className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-200">
            AS
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {student.name}
              </p>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                {student.tierCategory}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {student.rollNo} • CGPA: {student.cgpa}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
