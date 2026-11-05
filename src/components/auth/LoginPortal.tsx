import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  BrainCircuit,
  Lock,
  User,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginPortalProps {
  onSuccess?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSuccess }) => {
  const { login, registerStudent, changePassword, requestResetOtp, verifyResetOtp, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('251FA04I28');
  const [password, setPassword] = useState('251FA04I28');
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
        if (res.mustChangePassword) {
          // Mandatory University Policy: First login requires password change!
          setChangeCurrentPassword(password);
          setShowChangePassword(true);
          setSuccessMsg('Initial login verified. University security policy requires you to update your password now.');
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
        setShowChangePassword(false);
        setSuccessMsg('Password updated successfully! Your Registration Number will no longer work as password.');
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
        // Direct reset for staff roles
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Top Bar with Brand & Theme Switcher */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-brand)] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PlaceMate AI</h1>
            <p className="text-xs text-[var(--text-muted)]">Placement Management Portal</p>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center space-x-1 p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'light'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-indigo-400 font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('cappuccino')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'cappuccino'
                ? 'bg-[#ebd9cc] text-[#6f4e37] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Cappuccino Theme"
          >
            <Coffee className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xs">
        {/* User-Type Selector Tabs */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
            Select Your Role
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <GraduationCap className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('tpo')}
              className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeRole === 'tpo'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              TPO Cell
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeRole === 'recruiter'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Briefcase className="w-4 h-4 mx-auto mb-1 text-sky-600" />
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <BrainCircuit className="w-4 h-4 mx-auto mb-1 text-violet-600" />
              Admin
            </button>
          </div>
        </div>

        {/* Role Description Banner */}
        <div className="mb-5 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          {activeRole === 'student' && (
            <div>
              <div className="font-semibold text-[var(--text-main)] flex items-center space-x-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                <span>University Student Authentication</span>
              </div>
              <p className="leading-relaxed">
                Initial password is your <strong>Registration Number</strong> (e.g. <code>251FA04I28</code>).
                University policy requires setting a permanent password on first login.
              </p>
            </div>
          )}
          {activeRole === 'tpo' && (
            <span>
              <strong>TPO Login:</strong> Official university Training & Placement Officer credentials required for policy and drive administration.
            </span>
          )}
          {activeRole === 'recruiter' && (
            <span>
              <strong>Recruiter Portal:</strong> Verified enterprise partner account for candidate pipeline review and job publishing.
            </span>
          )}
          {activeRole === 'admin' && (
            <span>
              <strong>System Governance:</strong> Platform-wide security, database configurations, and institutional placement policies.
            </span>
          )}
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-brand)]"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-brand)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : `Sign in as ${activeRole.toUpperCase()}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Test Credential Chips */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
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
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-left hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <div className="font-semibold text-indigo-600 truncate">Sri Udbhav (Initial)</div>
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
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-left hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <div className="font-semibold text-indigo-600 truncate">Aarav Sharma</div>
              <div className="text-[10px] text-[var(--text-muted)]">Reg: 21CS048</div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('tpo')}
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-left hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <div className="font-semibold text-emerald-600 truncate">Placement Officer</div>
              <div className="text-[10px] text-[var(--text-muted)]">tpo@campus.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-left hover:border-sky-300 transition-colors cursor-pointer"
            >
              <div className="font-semibold text-sky-600 truncate">Recruiter Portal</div>
              <div className="text-[10px] text-[var(--text-muted)]">Google Campus TA</div>
            </button>
          </div>
        </div>

        {/* Student Onboarding Option */}
        {activeRole === 'student' && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-xs font-medium text-[var(--accent-brand)] hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New student? Activate university account</span>
            </button>
          </div>
        )}
      </div>

      {/* Mandatory First-Time Password Change Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">Mandatory Password Update</h3>
                <p className="text-[11px] text-[var(--text-muted)]">First-time student login policy</p>
              </div>
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

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="submit"
                  disabled={changeSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {changeSubmitting ? 'Updating Security Credentials...' : 'Save New Password & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Onboarding Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <h3 className="text-sm font-bold">Student Account Activation</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Authorized university records check</p>
              </div>
              <button
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-brand)] text-white font-semibold cursor-pointer"
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
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h3 className="text-sm font-bold flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>
                  {activeRole === 'student' ? 'University Gmail OTP Reset' : 'Reset Account Password'}
                </span>
              </h3>
              <button
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
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent-brand)] text-white font-semibold cursor-pointer"
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
                    className="w-full px-3 py-2 tracking-widest text-center font-mono text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]"
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
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent-brand)] text-white font-semibold cursor-pointer"
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
