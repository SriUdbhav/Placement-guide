import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Building2,
  Lock,
  User,
  Mail,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  ShieldAlert,
  Eye,
  EyeOff,
  Compass,
  Target,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import graduationHeroImg from '../../assets/images/graduation_hero_1793869832534.jpg';

interface LoginPortalProps {
  onSuccess?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSuccess }) => {
  const { login, registerStudent, changePassword, requestResetOtp, verifyResetOtp, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('251FA04I28');
  const [password, setPassword] = useState('251FA04I28');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mandatory First-Time Password Change Modal State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSubmitting, setChangeSubmitting] = useState(false);

  // Student Onboarding Modal State
  const [showRegister, setShowRegister] = useState(false);

  // Forgot Password (OTP) Modal State
  const [showForgot, setShowForgot] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('251FA04I28');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMaskedEmail, setResetMaskedEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Student Register Form State
  const [regForm, setRegForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    batch: '2021 - 2025 (Final Year)',
    cgpa: '9.0',
    password: '',
  });

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Pre-populate university test credentials
    if (role === 'student') {
      setIdentifier('251FA04I28');
      setPassword('251FA04I28');
    } else if (role === 'tpo') {
      setIdentifier('tpo@campus.edu');
      setPassword('TpoAdmin@123');
    } else if (role === 'recruiter') {
      setIdentifier('recruiter@google.com');
      setPassword('Recruiter@123');
    } else if (role === 'admin') {
      setIdentifier('admin@campus.edu');
      setPassword('SystemAdmin@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(activeRole, identifier.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        const promptKey = `placemate_pwd_prompted_${identifier.trim()}`;
        const alreadyPrompted = localStorage.getItem(promptKey) === 'true';

        if (res.mustChangePassword && !alreadyPrompted) {
          // Mandatory University Policy: First login requires password change - prompt only once
          localStorage.setItem(promptKey, 'true');
          setChangeCurrentPassword(password);
          setShowChangePassword(true);
          setSuccessMsg('Initial login verified. University security policy recommends updating your password.');
        } else {
          setSuccessMsg('Authentication verified. Loading placement dashboard...');
          if (onSuccess) onSuccess();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMandatoryPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (changeNewPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long.');
      return;
    }

    if (changeNewPassword === changeCurrentPassword) {
      setChangeError('New password cannot be identical to your current initial password.');
      return;
    }

    if (identifier && changeNewPassword.trim().toUpperCase() === identifier.trim().toUpperCase()) {
      setChangeError('University Security Policy: Your Registration Number cannot be used as your personal password.');
      return;
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setChangeError('New password and confirmation password do not match.');
      return;
    }

    setChangeSubmitting(true);
    try {
      const res = await changePassword(changeCurrentPassword, changeNewPassword);
      if (!res.success) {
        setChangeError(res.error || 'Failed to update password');
      } else {
        const promptKey = `placemate_pwd_prompted_${identifier.trim()}`;
        localStorage.setItem(promptKey, 'true');
        setShowChangePassword(false);
        setSuccessMsg('Password updated successfully! Your credentials have been saved.');
        if (onSuccess) onSuccess();
      }
    } finally {
      setChangeSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await registerStudent({
        ...regForm,
        cgpa: parseFloat(regForm.cgpa) || 8.0,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      } else {
        setSuccessMsg('Account registered successfully! Redirecting...');
        setShowRegister(false);
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Request 6-digit OTP sent to registered Gmail
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setResetSubmitting(true);

    try {
      if (activeRole === 'student') {
        const res = await requestResetOtp(resetIdentifier.trim());
        if (!res.success) {
          setResetError(res.error || 'Failed to dispatch verification code');
        } else {
          setResetMaskedEmail(res.maskedEmail || 'registered Gmail');
          setResetSuccess(res.message || 'Verification code sent to your registered Gmail address.');
          setResetStep('verify');
        }
      } else {
        const res = await resetPassword(activeRole, resetIdentifier.trim(), resetNewPassword);
        if (!res.success) {
          setResetError(res.error || 'Password reset failed');
        } else {
          setSuccessMsg(res.message || 'Password reset successfully.');
          setShowForgot(false);
        }
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  // Step 2: Verify 6-digit OTP and set new password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }

    if (resetNewPassword.trim().toUpperCase() === resetIdentifier.trim().toUpperCase()) {
      setResetError('University Security Policy: Registration Number cannot be reused as your password.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await verifyResetOtp(resetIdentifier.trim(), resetOtp.trim(), resetNewPassword);
      if (!res.success) {
        setResetError(res.error || 'OTP verification failed');
      } else {
        setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your updated credentials.');
        setShowForgot(false);
        setPassword(resetNewPassword);
        setIdentifier(resetIdentifier);
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  // Theme-specific accent and banner styles
  const isCappuccino = theme === 'cappuccino';

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] font-sans transition-colors duration-200">
      {/* ========================================================= */}
      {/* LEFT COLUMN: ~55% Viewport Graduation Photograph + Text    */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-10 xl:p-14 text-white overflow-hidden select-none bg-slate-900">
        {/* Background graduation celebration photo */}
        <img
          src={graduationHeroImg}
          alt="VFSTR University Graduation Celebration"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none brightness-95"
        />

        {/* Atmospheric gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/60 via-transparent to-[#0a0f1d]/85 pointer-events-none" />

        {/* Top Header Overlay: Logo + Branding */}
        <div className="relative z-10 flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20 backdrop-blur-md ${
            isCappuccino
              ? 'bg-gradient-to-tr from-[#8b5a2b] to-[#6f4e37] shadow-[#8b5a2b]/30'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-indigo-500/30'
          }`}>
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                PlaceMate AI
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20">
                VFSTR
              </span>
            </div>
            <p className="text-sm italic text-indigo-200 font-medium drop-shadow-xs">
              Your Gateway to Career Success
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Connecting VFSTR Students with Opportunities.
            </p>
          </div>
        </div>

        {/* Center Feature Badges Overlay */}
        <div className="relative z-10 my-auto py-6">
          <div className="flex flex-wrap gap-2.5 max-w-lg">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-100 shadow-md">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Placements</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-100 shadow-md">
              <Compass className={`w-4 h-4 ${isCappuccino ? 'text-[#d7a075]' : 'text-indigo-400'}`} />
              <span>Career Guidance</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-100 shadow-md">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Skill Development</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline Overlay: "Dream. Prepare. Get Placed." */}
        <div className="relative z-10 pb-2">
          <p className={`text-xs font-semibold tracking-wider uppercase mb-1 ${
            isCappuccino ? 'text-[#e8cbb6]' : 'text-indigo-300'
          }`}>
            Empowering Campus Futures
          </p>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Dream. Prepare. Get Placed.
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-md leading-relaxed">
            Vignan's Foundation for Science, Technology & Research · Training & Placement Cell Portal
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: ~45% Viewport Executive Precision Panel     */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[45%] h-full flex flex-col justify-between overflow-y-auto px-6 sm:px-10 lg:px-12 py-7 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-200 border-l border-[var(--border-subtle)]">
        {/* Top Bar with Mobile Brand & Theme Switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 lg:hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              isCappuccino ? 'bg-[#8b5a2b]' : 'bg-indigo-600'
            }`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--text-main)]">PlaceMate AI</span>
          </div>
          <div className="hidden lg:block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            VFSTR University Placement Cell
          </div>

          {/* Theme Picker */}
          <div className="flex items-center space-x-1 p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-700 text-indigo-300 font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('cappuccino')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'cappuccino'
                  ? 'bg-[#ebd9cc] text-[#6f4e37] font-semibold shadow-xs ring-1 ring-[#8b5a2b]/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Cappuccino Theme"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-md w-full mx-auto my-auto py-2">
          {/* Header in Right Section */}
          <div className="mb-5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2.5 mb-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                isCappuccino
                  ? 'bg-gradient-to-tr from-[#8b5a2b] to-[#6f4e37] shadow-[#8b5a2b]/20'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
              }`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)] leading-tight">
                  PlaceMate AI
                </h2>
                <p className={`text-xs font-semibold ${
                  isCappuccino ? 'text-[#8b5a2b]' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  VFSTR University Placements
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Sign in to access your placement dashboard, eligibility records, and campus drives.
            </p>
          </div>

          {/* Role Selector Tabs (Horizontal 4-option bar) */}
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeRole === 'student'
                    ? isCappuccino
                      ? 'bg-gradient-to-r from-[#8b5a2b] to-[#6f4e37] text-white shadow-xs font-semibold'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <GraduationCap className={`w-4 h-4 mx-auto mb-1 ${
                  activeRole === 'student'
                    ? 'text-white'
                    : isCappuccino
                      ? 'text-[#8b5a2b]'
                      : 'text-indigo-600 dark:text-indigo-400'
                }`} />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('tpo')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeRole === 'tpo'
                    ? isCappuccino
                      ? 'bg-gradient-to-r from-[#8b5a2b] to-[#6f4e37] text-white shadow-xs font-semibold'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Building2 className={`w-4 h-4 mx-auto mb-1 ${
                  activeRole === 'tpo' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                }`} />
                TPO Cell
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('recruiter')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeRole === 'recruiter'
                    ? isCappuccino
                      ? 'bg-gradient-to-r from-[#8b5a2b] to-[#6f4e37] text-white shadow-xs font-semibold'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Briefcase className={`w-4 h-4 mx-auto mb-1 ${
                  activeRole === 'recruiter' ? 'text-white' : 'text-sky-600 dark:text-sky-400'
                }`} />
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeRole === 'admin'
                    ? isCappuccino
                      ? 'bg-gradient-to-r from-[#8b5a2b] to-[#6f4e37] text-white shadow-xs font-semibold'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 mx-auto mb-1 ${
                  activeRole === 'admin'
                    ? 'text-white'
                    : isCappuccino
                      ? 'text-[#6f4e37]'
                      : 'text-violet-600 dark:text-violet-400'
                }`} />
                Admin
              </button>
            </div>
          </div>



          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">
                {activeRole === 'student' ? 'University Registration Number' : 'Official Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  {activeRole === 'student' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </span>
                <input
                  type={activeRole === 'student' ? 'text' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(activeRole === 'student' ? e.target.value.toUpperCase() : e.target.value)}
                  required
                  placeholder={activeRole === 'student' ? 'e.g. 251FA04I28' : 'name@campus.edu'}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-brand)] focus:border-[var(--accent-brand)] transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--text-main)]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetIdentifier(identifier);
                    setResetStep('request');
                    setResetError(null);
                    setResetSuccess(null);
                    setShowForgot(true);
                  }}
                  className="text-xs text-[var(--accent-brand)] hover:underline cursor-pointer"
                >
                  Reset password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-brand)] focus:border-[var(--accent-brand)] transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Styled Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 ${
                isCappuccino
                  ? 'bg-gradient-to-r from-[#8b5a2b] via-[#7a4e25] to-[#6f4e37] hover:from-[#7a4e25] hover:to-[#5c4033] shadow-md shadow-[#8b5a2b]/25 hover:shadow-lg'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35'
              }`}
            >
              <span>{isSubmitting ? 'Authenticating...' : `Sign in as ${activeRole.toUpperCase()} →`}</span>
            </button>
          </form>

          {/* Quick Institutional Credentials Footer */}
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              1-Click Institutional Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('student');
                  setIdentifier('251FA04I28');
                  setPassword('251FA04I28');
                  setErrorMsg(null);
                }}
                className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-left hover:border-[var(--accent-brand)] transition-colors cursor-pointer shadow-2xs ${
                  isCappuccino ? 'hover:bg-[#ebd9cc]/30' : ''
                }`}
              >
                <div className={`font-semibold truncate ${
                  isCappuccino ? 'text-[#8b5a2b]' : 'text-indigo-600 dark:text-indigo-400'
                }`}>Sri Udbhav (Initial)</div>
                <div className="text-[10px] text-[var(--text-muted)]">Reg: 251FA04I28</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('student');
                  setIdentifier('21CS048');
                  setPassword('Student@123');
                  setErrorMsg(null);
                }}
                className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-left hover:border-[var(--accent-brand)] transition-colors cursor-pointer shadow-2xs ${
                  isCappuccino ? 'hover:bg-[#ebd9cc]/30' : ''
                }`}
              >
                <div className={`font-semibold truncate ${
                  isCappuccino ? 'text-[#8b5a2b]' : 'text-indigo-600 dark:text-indigo-400'
                }`}>Aarav Sharma</div>
                <div className="text-[10px] text-[var(--text-muted)]">Reg: 21CS048</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('tpo')}
                className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-left hover:border-emerald-400 transition-colors cursor-pointer shadow-2xs ${
                  isCappuccino ? 'hover:bg-[#ebd9cc]/30' : ''
                }`}
              >
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">Placement Officer</div>
                <div className="text-[10px] text-[var(--text-muted)]">tpo@campus.edu</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('recruiter')}
                className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-left hover:border-sky-400 transition-colors cursor-pointer shadow-2xs ${
                  isCappuccino ? 'hover:bg-[#ebd9cc]/30' : ''
                }`}
              >
                <div className="font-semibold text-sky-600 dark:text-sky-400 truncate">Recruiter Portal</div>
                <div className="text-[10px] text-[var(--text-muted)]">Google Campus TA</div>
              </button>
            </div>
          </div>

          {/* Student Onboarding Option */}
          {activeRole === 'student' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className={`text-xs font-medium hover:underline inline-flex items-center space-x-1 cursor-pointer ${
                  isCappuccino ? 'text-[#8b5a2b]' : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New student? Activate university account</span>
              </button>
            </div>
          )}
        </div>

        {/* Subtle Footer Note */}
        <div className="text-center pt-2 text-[11px] text-[var(--text-muted)]">
          Protected by VFSTR Campus Security · All Rights Reserved
        </div>
      </div>

      {/* Mandatory First-Time Password Change Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">Mandatory Password Update</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">First-time student login policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const promptKey = `placemate_pwd_prompted_${identifier.trim()}`;
                  localStorage.setItem(promptKey, 'true');
                  setShowChangePassword(false);
                  if (onSuccess) onSuccess();
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer p-1 rounded-lg hover:bg-[var(--bg-subtle)]"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p>
                <strong>University Policy:</strong> You signed in using your Registration Number (<code>{identifier}</code>) as your initial password.
              </p>
              <p className="mt-1">
                To protect your placement applications and confidential campus records, you must choose a new personal password now. Once updated, your registration number will <strong>never work again</strong> as your password.
              </p>
            </div>

            {changeError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{changeError}</span>
              </div>
            )}

            <form onSubmit={handleMandatoryPasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-main)]">Current Password</label>
                <input
                  type="password"
                  value={changeCurrentPassword}
                  onChange={(e) => setChangeCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-main)]">
                  New Personal Password <span className="text-[var(--text-muted)] font-normal">(min 6 chars)</span>
                </label>
                <input
                  type="password"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-main)]">Confirm New Password</label>
                <input
                  type="password"
                  value={changeConfirmPassword}
                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const promptKey = `placemate_pwd_prompted_${identifier.trim()}`;
                    localStorage.setItem(promptKey, 'true');
                    setShowChangePassword(false);
                    if (onSuccess) onSuccess();
                  }}
                  className="px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:underline cursor-pointer"
                >
                  Remind me later
                </button>
                <button
                  type="submit"
                  disabled={changeSubmitting}
                  className={`py-2 px-4 rounded-xl text-white font-semibold cursor-pointer shadow-md disabled:opacity-50 ${
                    isCappuccino
                      ? 'bg-gradient-to-r from-[#8b5a2b] to-[#6f4e37] hover:from-[#7a4e25] hover:to-[#5c4033]'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {changeSubmitting ? 'Updating...' : 'Save New Password & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Onboarding Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <h3 className="text-sm font-bold">Student Account Activation</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Authorized university records check</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">University Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 251FA04I28"
                  value={regForm.rollNo}
                  onChange={(e) => setRegForm({ ...regForm, rollNo: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Must match an official student registration number in university records.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Udbhav"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Registered Gmail / University Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create personal password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                />
              </div>
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-1.5 rounded-lg text-white font-semibold cursor-pointer ${
                    isCappuccino ? 'bg-[#8b5a2b] hover:bg-[#6f4e37]' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Verifying...' : 'Activate Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gmail OTP Password Reset Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h3 className="text-sm font-bold flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>
                  {activeRole === 'student' ? 'University Gmail OTP Reset' : 'Reset Account Password'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {resetStep === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    {activeRole === 'student' ? 'University Registration Number' : 'Registered Email Address'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeRole === 'student' ? 'e.g. 251FA04I28' : 'name@campus.edu'}
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                  />
                  {activeRole === 'student' && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      A 6-digit verification code will be sent to your registered Gmail address.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className={`px-4 py-1.5 rounded-lg text-white font-semibold cursor-pointer ${
                      isCappuccino ? 'bg-[#8b5a2b] hover:bg-[#6f4e37]' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {resetSubmitting ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Verify OTP and Set New Password */
              <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                  Code sent to registered address: <strong>{resetMaskedEmail}</strong>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full px-3 py-2 tracking-widest text-center font-mono text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">New Personal Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-xs text-[var(--text-muted)] hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className={`px-4 py-1.5 rounded-lg text-white font-semibold cursor-pointer ${
                      isCappuccino ? 'bg-[#8b5a2b] hover:bg-[#6f4e37]' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {resetSubmitting ? 'Verifying...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
