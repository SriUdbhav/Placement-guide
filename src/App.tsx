/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AICopilotDrawer } from './components/copilot/AICopilotDrawer';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ResumeAnalyzer } from './components/student/ResumeAnalyzer';
import { JobRecommendations } from './components/student/JobRecommendations';
import { EligibilityChecker } from './components/student/EligibilityChecker';
import { SkillGapAnalysis } from './components/student/SkillGapAnalysis';
import { MockInterview } from './components/student/MockInterview';
import { ApplicationTracker } from './components/student/ApplicationTracker';
import { PlacementOfficerDashboard } from './components/tpo/PlacementOfficerDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { UserRole, NavigationTab, JobDrive, ApplicationRecord, ApplicationStatus } from './types';
import { CURRENT_STUDENT, MOCK_JOB_DRIVES, MOCK_APPLICATIONS } from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('student-dashboard');

  const [student, setStudent] = useState(CURRENT_STUDENT);
  const [drives, setDrives] = useState<JobDrive[]>(MOCK_JOB_DRIVES);
  const [applications, setApplications] = useState<ApplicationRecord[]>(MOCK_APPLICATIONS);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRealAiActive, setIsRealAiActive] = useState(false);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) {
          setIsRealAiActive(true);
        }
      })
      .catch((err) => {
        console.log('Running client in local mode:', err);
      });
  }, []);

  // Global keyboard shortcuts (Cmd+K for search, Cmd+J for AI copilot)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApplyDrive = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;

    // Update drive status
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, isApplied: true, applicationStatus: 'Applied' } : d))
    );

    // Add to applications if not already present
    if (!applications.some((a) => a.jobId === driveId)) {
      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}`,
        jobId: drive.id,
        companyName: drive.companyName,
        role: drive.role,
        ctcPackageLpa: drive.ctcPackageLpa,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        nextRound: 'Campus Profile Screening',
        aiReadinessScore: drive.matchScore,
        feedbackNotes: 'Application submitted via PlaceMate AI portal.',
      };
      setApplications((prev) => [newApp, ...prev]);
    }
  };

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  };

  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setIsCopilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 260px Fixed Sidebar Application Rail */}
      <Sidebar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        student={student}
        isRealAiActive={isRealAiActive}
        toggleAiMode={() => setIsRealAiActive((prev) => !prev)}
      />

      {/* Main Fluid Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Sticky Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isCopilotOpen={isCopilotOpen}
          setIsCopilotOpen={setIsCopilotOpen}
          onSearchClick={() => setIsSearchOpen(true)}
          isRealAiActive={isRealAiActive}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {currentTab === 'student-dashboard' && (
            <StudentDashboard
              student={student}
              drives={drives}
              applications={applications}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              onApplyDrive={handleApplyDrive}
            />
          )}

          {currentTab === 'resume-analyzer' && (
            <ResumeAnalyzer
              student={student}
              isRealAiActive={isRealAiActive}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'job-recommendations' && (
            <JobRecommendations
              drives={drives}
              student={student}
              applications={applications}
              onApply={handleApplyDrive}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'eligibility-checker' && (
            <EligibilityChecker
              student={student}
              drives={drives}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'skill-gap' && (
            <SkillGapAnalysis
              student={student}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'mock-interview' && (
            <MockInterview
              student={student}
              isRealAiActive={isRealAiActive}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'application-tracker' && (
            <ApplicationTracker
              applications={applications}
              student={student}
              onUpdateStatus={handleUpdateStatus}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {currentTab === 'tpo-dashboard' && <PlacementOfficerDashboard />}

          {currentTab === 'recruiter-dashboard' && <RecruiterDashboard />}

          {currentTab === 'admin-dashboard' && (
            <AdminDashboard
              isRealAiActive={isRealAiActive}
              toggleAiMode={() => setIsRealAiActive((prev) => !prev)}
            />
          )}
        </main>
      </div>

      {/* Floating Level-4 AI Placement Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        student={student}
        isRealAiActive={isRealAiActive}
        toggleAiMode={() => setIsRealAiActive((prev) => !prev)}
      />

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        drives={drives}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (
            ['tpo-dashboard', 'recruiter-dashboard', 'admin-dashboard'].includes(tab)
          ) {
            if (tab === 'tpo-dashboard') setCurrentRole('tpo');
            if (tab === 'recruiter-dashboard') setCurrentRole('recruiter');
            if (tab === 'admin-dashboard') setCurrentRole('admin');
          } else {
            setCurrentRole('student');
          }
        }}
        onSelectDrive={(driveId) => {
          setCurrentTab('job-recommendations');
        }}
      />
    </div>
  );
}
