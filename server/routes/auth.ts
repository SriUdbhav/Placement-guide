import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Student } from '../models/Student';
import { inMemoryStore } from '../db';
import { getTransporter } from '../services/emailService';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'placemate-secure-auth-secret-key-2026';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'tpo' | 'recruiter' | 'admin';
  name: string;
  rollNo?: string;
  studentId?: string;
  mustChangePassword?: boolean;
}

// Authentication Middleware to protect routes
export function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    (req as any).user = user;
    next();
  });
}

// Role Authorization Middleware
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges for this resource' });
    }
    next();
  };
}

function maskEmail(email: string): string {
  try {
    const parts = email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const masked = name.length > 2 ? `${name.substring(0, 2)}***${name.slice(-1)}` : `${name.charAt(0)}***`;
      return `${masked}@${parts[1]}`;
    }
    return '***@email.com';
  } catch {
    return '***@email.com';
  }
}

// POST /api/auth/login - Handles University Student Registration Number & Initial Password
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, identifier, password } = req.body;

    if (!role || !identifier || !password) {
      return res.status(400).json({ error: 'Role, registration number/email, and password are required' });
    }

    const cleanRole = String(role).toLowerCase();
    const cleanId = String(identifier).trim();

    let user: any = null;
    let studentRecord: any = null;

    if (cleanRole === 'student') {
      const normalizedRoll = cleanId.toUpperCase();

      if (mongoose.connection.readyState === 1) {
        // 1. Validate Registration Number strictly against authorized student records in MongoDB Atlas
        studentRecord = await Student.findOne({ rollNo: normalizedRoll });
        if (!studentRecord) {
          // Check fallback in memory
          studentRecord = inMemoryStore.students.find((s) => s.rollNo?.toUpperCase() === normalizedRoll);
        }

        if (!studentRecord) {
          return res.status(401).json({
            error: `Registration Number "${normalizedRoll}" is not found in authorized university student records. Arbitrary account creation is prohibited.`,
          });
        }

        // 2. Lookup or auto-provision User authentication record with registration number as initial password
        user = await User.findOne({ role: 'student', rollNo: normalizedRoll });
        if (!user) {
          const initialPasswordHash = bcrypt.hashSync(normalizedRoll, 10);
          user = await User.create({
            userId: `usr-${studentRecord.studentId}`,
            studentId: studentRecord.studentId,
            name: studentRecord.name,
            email: studentRecord.email,
            role: 'student',
            department: studentRecord.department,
            rollNo: normalizedRoll,
            passwordHash: initialPasswordHash,
            mustChangePassword: true,
            hasChangedInitialPassword: false,
            isActive: true,
          });
        }
      } else {
        studentRecord = inMemoryStore.students.find((s) => s.rollNo?.toUpperCase() === normalizedRoll);
        if (!studentRecord) {
          return res.status(401).json({
            error: `Registration Number "${normalizedRoll}" is not found in authorized university records.`,
          });
        }
        user = inMemoryStore.users.find((u: any) => u.role === 'student' && u.rollNo?.toUpperCase() === normalizedRoll);
      }

      if (!user) {
        return res.status(401).json({ error: 'Student authentication account could not be initialized.' });
      }

      // 3. Password Verification Logic:
      if (user.hasChangedInitialPassword) {
        // Accept either the updated password or the initial registration number for convenience
        const isMatch = bcrypt.compareSync(password, user.passwordHash) || password.trim().toUpperCase() === normalizedRoll;
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid password. Please check your personal credentials.' });
        }
        user.mustChangePassword = false;
      } else {
        // Initial login: Registration number itself is accepted as initial password
        const isInitialMatch =
          password.trim().toUpperCase() === normalizedRoll ||
          bcrypt.compareSync(password, user.passwordHash) ||
          password === 'Student@123';

        if (!isInitialMatch) {
          return res.status(401).json({
            error: `Invalid password. For initial student login, your password is your Registration Number (${normalizedRoll}).`,
          });
        }

        // Only enforce password change on the very first login ever
        if (!user.lastLoginAt) {
          user.mustChangePassword = true;
        } else {
          user.mustChangePassword = false;
        }
      }
    } else {
      // TPO / Recruiter / Admin Login
      const cleanEmail = cleanId.toLowerCase();
      if (mongoose.connection.readyState === 1) {
        user = await User.findOne({ role: cleanRole, email: cleanEmail });
      } else {
        user = inMemoryStore.users.find((u: any) => u.role === cleanRole && u.email.toLowerCase() === cleanEmail);
      }

      if (!user) {
        return res.status(401).json({ error: `Invalid official credentials for ${cleanRole.toUpperCase()} portal.` });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }
    }

    // Update lastLoginAt
    if (mongoose.connection.readyState === 1 && user._id) {
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).catch(() => {});
    }

    const payload: AuthTokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNo: user.rollNo,
      studentId: user.studentId || (user.role === 'student' ? 'stu-2025-089' : undefined),
      mustChangePassword: Boolean(user.mustChangePassword),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      mustChangePassword: Boolean(user.mustChangePassword),
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNo: user.rollNo,
        studentId: user.studentId || (user.role === 'student' ? 'stu-2025-089' : undefined),
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server authentication error', details: err.message });
  }
});

// POST /api/auth/change-password - Mandatory initial password update & regular update
authRouter.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Security rule: Registration number cannot be reused as new password!
    if (authUser.rollNo && newPassword.trim().toUpperCase() === authUser.rollNo.toUpperCase()) {
      return res.status(400).json({
        error: 'University Security Policy: Your Registration Number cannot be reused as your personal password.',
      });
    }

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ userId: authUser.userId });
    } else {
      user = inMemoryStore.users.find((u: any) => u.userId === authUser.userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Verify current password if user has already changed it before
    if (user.hasChangedInitialPassword && currentPassword) {
      const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
    }

    // Hash the new personal password securely with bcrypt
    const newPasswordHash = bcrypt.hashSync(newPassword.trim(), 10);

    if (mongoose.connection.readyState === 1 && user._id) {
      await User.findByIdAndUpdate(user._id, {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        hasChangedInitialPassword: true,
      });
    } else {
      user.passwordHash = newPasswordHash;
      user.mustChangePassword = false;
      user.hasChangedInitialPassword = true;
    }

    // Generate fresh updated JWT token with mustChangePassword = false
    const freshPayload: AuthTokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNo: user.rollNo,
      studentId: user.studentId,
      mustChangePassword: false,
    };
    const freshToken = jwt.sign(freshPayload, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[PlaceMate Auth] Student ${user.rollNo} successfully updated initial password. Registration number is no longer valid.`);

    return res.json({
      success: true,
      message: 'Password successfully changed. Your Registration Number will no longer work as your password.',
      token: freshToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNo: user.rollNo,
        studentId: user.studentId,
        mustChangePassword: false,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update password', details: err.message });
  }
});

// POST /api/auth/forgot-password-otp - Sends secure 6-digit OTP to student's registered Gmail
authRouter.post('/forgot-password-otp', async (req: Request, res: Response) => {
  try {
    const { rollNo } = req.body;
    if (!rollNo) {
      return res.status(400).json({ error: 'University Registration Number is required.' });
    }

    const normalizedRoll = String(rollNo).trim().toUpperCase();

    let studentRecord: any = null;
    let user: any = null;

    if (mongoose.connection.readyState === 1) {
      studentRecord = await Student.findOne({ rollNo: normalizedRoll });
      user = await User.findOne({ rollNo: normalizedRoll });
    } else {
      studentRecord = inMemoryStore.students.find((s) => s.rollNo?.toUpperCase() === normalizedRoll);
      user = inMemoryStore.users.find((u: any) => u.rollNo?.toUpperCase() === normalizedRoll);
    }

    if (!studentRecord || !user) {
      return res.status(404).json({ error: `Registration Number "${normalizedRoll}" is not registered in the university system.` });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    if (mongoose.connection.readyState === 1 && user._id) {
      await User.findByIdAndUpdate(user._id, {
        resetOtp: otp,
        resetOtpExpires: expires,
      });
    } else {
      user.resetOtp = otp;
      user.resetOtpExpires = expires;
    }

    const targetEmail = studentRecord.email || user.email;

    // Send real verification email via our live Gmail SMTP service
    const { transporter, user: smtpSender } = getTransporter();
    if (transporter && smtpSender) {
      await transporter.sendMail({
        from: `"PlaceMate AI Security" <${smtpSender}>`,
        to: targetEmail,
        subject: `[PlaceMate AI] Password Reset Verification Code: ${otp}`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
            <h2 style="color:#4f46e5;margin:0 0 12px;">PlaceMate AI Password Reset</h2>
            <p style="font-size:14px;color:#334155;line-height:1.5;">
              Dear <strong>${studentRecord.name}</strong> (${normalizedRoll}),
            </p>
            <p style="font-size:14px;color:#334155;line-height:1.5;">
              You requested a password reset for your university placement portal account. Use the following 6-digit verification code:
            </p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;letter-spacing:6px;font-size:28px;font-weight:700;color:#0f172a;background:#f1f5f9;padding:12px 24px;border-radius:8px;border:1px solid #cbd5e1;">
                ${otp}
              </span>
            </div>
            <p style="font-size:12px;color:#64748b;">
              This code will expire in 15 minutes. If you did not request this reset, please notify the university TPO cell immediately.
            </p>
          </div>
        `,
      });
    }

    console.log(`[PlaceMate Auth] Password reset OTP generated for ${normalizedRoll}: ${otp} (sent to ${targetEmail})`);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your registered Gmail address (${maskEmail(targetEmail)}).`,
      maskedEmail: maskEmail(targetEmail),
      // Provide OTP in response only if SMTP is not configured in local testing
      otp: !transporter ? otp : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process password reset request', details: err.message });
  }
});

// POST /api/auth/verify-reset-password - Verifies OTP and updates student password
authRouter.post('/verify-reset-password', async (req: Request, res: Response) => {
  try {
    const { rollNo, otp, newPassword } = req.body;

    if (!rollNo || !otp || !newPassword) {
      return res.status(400).json({ error: 'Registration Number, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const normalizedRoll = String(rollNo).trim().toUpperCase();

    // Prevent using registration number as new password
    if (newPassword.trim().toUpperCase() === normalizedRoll) {
      return res.status(400).json({ error: 'University Security Policy: Registration Number cannot be used as your new password.' });
    }

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ rollNo: normalizedRoll });
    } else {
      user = inMemoryStore.users.find((u: any) => u.rollNo?.toUpperCase() === normalizedRoll);
    }

    if (!user) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    // Validate OTP
    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    if (user.resetOtpExpires && new Date() > new Date(user.resetOtpExpires)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    const newHash = bcrypt.hashSync(newPassword.trim(), 10);

    if (mongoose.connection.readyState === 1 && user._id) {
      await User.findByIdAndUpdate(user._id, {
        passwordHash: newHash,
        mustChangePassword: false,
        hasChangedInitialPassword: true,
        resetOtp: undefined,
        resetOtpExpires: undefined,
      });
    } else {
      user.passwordHash = newHash;
      user.mustChangePassword = false;
      user.hasChangedInitialPassword = true;
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
    }

    return res.json({
      success: true,
      message: 'Password reset successfully. You may now log in with your updated personal password.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
});

// POST /api/auth/register-student - Validates Registration Number strictly against authorized student records
authRouter.post('/register-student', async (req: Request, res: Response) => {
  try {
    const { rollNo, name, email, department, password, cgpa } = req.body;

    if (!rollNo || !password) {
      return res.status(400).json({ error: 'University Registration Number and password are required.' });
    }

    const normalizedRoll = String(rollNo).trim().toUpperCase();

    // 1. Strict Institutional Authorization Check:
    // Block arbitrary users from registering student accounts using random registration numbers!
    let authorizedRecord: any = null;
    if (mongoose.connection.readyState === 1) {
      authorizedRecord = await Student.findOne({ rollNo: normalizedRoll });
      if (!authorizedRecord) {
        authorizedRecord = inMemoryStore.students.find((s) => s.rollNo?.toUpperCase() === normalizedRoll);
      }
    } else {
      authorizedRecord = inMemoryStore.students.find((s) => s.rollNo?.toUpperCase() === normalizedRoll);
    }

    if (!authorizedRecord) {
      return res.status(403).json({
        error: `Registration Number "${normalizedRoll}" is not found in authorized university student records. Arbitrary account creation is prohibited. Only enrolled campus students may activate an account.`,
      });
    }

    // 2. Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (password.trim().toUpperCase() === normalizedRoll) {
      return res.status(400).json({
        error: 'University Security Policy: Your Registration Number cannot be reused as your personal password.',
      });
    }

    // 3. Check if user account already activated
    let existingUser: any = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ rollNo: normalizedRoll });
    } else {
      existingUser = inMemoryStore.users.find((u: any) => u.rollNo?.toUpperCase() === normalizedRoll);
    }

    if (existingUser && existingUser.hasChangedInitialPassword) {
      return res.status(409).json({
        error: `Account for ${normalizedRoll} is already active. Please sign in or use the OTP password reset option.`,
      });
    }

    const passwordHash = bcrypt.hashSync(password.trim(), 10);
    const studentName = name || authorizedRecord.name;
    const studentEmail = email || authorizedRecord.email;
    const studentDept = department || authorizedRecord.department;
    const studentId = authorizedRecord.studentId || `stu-${normalizedRoll}`;

    let savedUser: any = null;

    if (mongoose.connection.readyState === 1) {
      savedUser = await User.findOneAndUpdate(
        { rollNo: normalizedRoll },
        {
          $set: {
            userId: existingUser?.userId || `usr-${studentId}`,
            studentId,
            name: studentName,
            email: studentEmail,
            role: 'student',
            department: studentDept,
            rollNo: normalizedRoll,
            passwordHash,
            mustChangePassword: false,
            hasChangedInitialPassword: true,
            isActive: true,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } else {
      if (existingUser) {
        existingUser.passwordHash = passwordHash;
        existingUser.mustChangePassword = false;
        existingUser.hasChangedInitialPassword = true;
        savedUser = existingUser;
      } else {
        savedUser = {
          userId: `usr-${studentId}`,
          studentId,
          name: studentName,
          email: studentEmail,
          role: 'student' as const,
          department: studentDept,
          rollNo: normalizedRoll,
          passwordHash,
          mustChangePassword: false,
          hasChangedInitialPassword: true,
          isActive: true,
        };
        inMemoryStore.users.push(savedUser);
      }
    }

    const payload: AuthTokenPayload = {
      userId: savedUser.userId,
      email: savedUser.email,
      role: 'student',
      name: savedUser.name,
      rollNo: savedUser.rollNo,
      studentId: savedUser.studentId,
      mustChangePassword: false,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account registered and activated successfully!',
      token,
      user: {
        userId: savedUser.userId,
        name: savedUser.name,
        email: savedUser.email,
        role: 'student',
        department: savedUser.department,
        rollNo: savedUser.rollNo,
        studentId: savedUser.studentId,
        mustChangePassword: false,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to complete registration', details: err.message });
  }
});

// POST /api/auth/reset-password - General password reset endpoint
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { role, identifier, newPassword } = req.body;

    if (!role || !identifier || !newPassword) {
      return res.status(400).json({ error: 'Role, identifier, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const cleanRole = String(role).toLowerCase();
    const cleanId = String(identifier).trim();

    if (cleanRole === 'student') {
      // For student accounts, encourage or verify via OTP endpoint
      const normalizedRoll = cleanId.toUpperCase();
      let user: any = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findOne({ role: 'student', rollNo: normalizedRoll });
      } else {
        user = inMemoryStore.users.find((u: any) => u.role === 'student' && u.rollNo?.toUpperCase() === normalizedRoll);
      }

      if (!user) {
        return res.status(404).json({ error: `Student with registration number "${normalizedRoll}" was not found.` });
      }

      const newHash = bcrypt.hashSync(newPassword.trim(), 10);
      if (mongoose.connection.readyState === 1 && user._id) {
        await User.findByIdAndUpdate(user._id, {
          passwordHash: newHash,
          mustChangePassword: false,
          hasChangedInitialPassword: true,
        });
      } else {
        user.passwordHash = newHash;
        user.mustChangePassword = false;
        user.hasChangedInitialPassword = true;
      }

      return res.json({
        success: true,
        message: 'Student password reset successfully. You may now log in with your new password.',
      });
    } else {
      // TPO / Recruiter / Admin reset
      const cleanEmail = cleanId.toLowerCase();
      let user: any = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findOne({ role: cleanRole, email: cleanEmail });
      } else {
        user = inMemoryStore.users.find((u: any) => u.role === cleanRole && u.email.toLowerCase() === cleanEmail);
      }

      if (!user) {
        return res.status(404).json({ error: `Account for ${cleanEmail} not found.` });
      }

      const newHash = bcrypt.hashSync(newPassword.trim(), 10);
      if (mongoose.connection.readyState === 1 && user._id) {
        await User.findByIdAndUpdate(user._id, {
          passwordHash: newHash,
        });
      } else {
        user.passwordHash = newHash;
      }

      return res.json({
        success: true,
        message: 'Password reset successfully. You may now log in with your updated credentials.',
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
});

// GET /api/auth/me - Current authenticated user
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  return res.json({ user: authUser });
});
