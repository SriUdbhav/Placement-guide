import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronDown,
  BrainCircuit,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { UserRole, NavigationTab } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  onSearchClick: () => void;
  isRealAiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  currentTab,
  setCurrentTab,
  isCopilotOpen,
  setIsCopilotOpen,
  onSearchClick,
  isRealAiActive,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'student-dashboard':
        return 'Student Portal / Overview & Placement Readiness';
      case 'resume-analyzer':
        return 'Student Portal / AI Resume ATS Analyzer';
      case 'job-recommendations':
        return 'Student Portal / AI-Matched Campus Drives';
      case 'eligibility-checker':
        return 'Student Portal / Placement Eligibility Audit';
      case 'skill-gap':
        return 'Student Portal / Target SDE Skill Gap Analysis';
      case 'mock-interview':
        return 'Student Portal / AI Mock Interview Simulator';
      case 'application-tracker':
        return 'Student Portal / Drive Application Kanban';
      case 'tpo-dashboard':
        return 'Placement Cell (TPO) / Executive Placement Intelligence';
      case 'recruiter-dashboard':
        return 'Recruiter Portal / Candidate Pipeline & Talent Screening';
      case 'admin-dashboard':
        return 'System Admin / Placement Policy & Governance';
      default:
        return 'PlaceMate AI';
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Google SDE-I Assessment Scheduled',
      time: '15 mins ago',
      desc: 'Online test link dispatched for Nov 12, 10:00 AM IST.',
      unread: true,
    },
    {
      id: 2,
      title: 'TPO Verified: Tier-1 Fast Track',
      time: '2 hours ago',
      desc: 'Your 8.92 CGPA and clean backlog record verified.',
      unread: true,
    },
    {
      id: 3,
      title: 'AI Copilot Recommendation',
      time: '5 hours ago',
      desc: 'Adding Kubernetes to your profile unlocks 3 additional cloud roles.',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wide uppercase text-slate-500">
          <span className="flex items-center text-indigo-600 font-bold">
            <GraduationCap className="w-4 h-4 mr-1 inline" />
            PlaceMate AI
          </span>
          <span>/</span>
          <span className="text-slate-800 font-medium normal-case text-sm">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Center: Search Trigger & Live Academic Status Chip */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={onSearchClick}
          className="flex items-center space-x-3 px-3.5 py-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search drives, roles, skills...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>2025 Drive Season: <strong className="tabular-numbers">84.1%</strong> Placed • 14 Drives Live</span>
        </div>
      </div>

      {/* Right: AI Copilot Toggle, Notifications, Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Real AI Mode / Demo status pill */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600">
          <span className={`w-2 h-2 rounded-full ${isRealAiActive ? 'bg-indigo-600 animate-ping' : 'bg-violet-600'}`} />
          <span className="font-medium text-[11px]">
            {isRealAiActive ? 'Gemini 3.8 Flash' : 'Demo Intelligence'}
          </span>
        </div>

        {/* AI Copilot Button (Stitch design specification: gradient fill 135deg indigo to violet) */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer shadow-sm ${
            isCopilotOpen
              ? 'bg-slate-900 ring-2 ring-violet-500'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 shadow-indigo-500/20 hover:shadow-violet-500/30'
          }`}
          title="Toggle AI Placement Copilot"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>AI Copilot</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">
            ⌘J
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-sm font-semibold text-slate-900">Placement Alerts</h4>
                <span className="text-[11px] font-medium text-indigo-600 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg text-xs transition-colors ${
                      n.unread ? 'bg-indigo-50/60 border border-indigo-100' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] font-normal text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="capitalize">{currentRole} View</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Perspective
              </div>
              <button
                onClick={() => {
                  setCurrentRole('student');
                  setCurrentTab('student-dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  currentRole === 'student' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <div>
                  <p>Student Perspective</p>
                  <p className="text-[10px] text-slate-500">Aarav Sharma (B.Tech CSE)</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setCurrentRole('tpo');
                  setCurrentTab('tpo-dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  currentRole === 'tpo' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <p>Placement Officer (TPO)</p>
                  <p className="text-[10px] text-slate-500">Campus Placement Cell</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setCurrentRole('recruiter');
                  setCurrentTab('recruiter-dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  currentRole === 'recruiter' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-sky-600" />
                <div>
                  <p>Recruiter Portal</p>
                  <p className="text-[10px] text-slate-500">Google / Enterprise HR</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setCurrentTab('admin-dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  currentRole === 'admin' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-violet-600" />
                <div>
                  <p>Admin & Policies</p>
                  <p className="text-[10px] text-slate-500">University System Admin</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
