import { Router, Request, Response } from 'express';
import { verifySmtpConnection, sendTestEmail } from '../services/emailService';

export const emailRouter = Router();

// GET /api/email/smtp-status - Verifies SMTP connection and authentication
emailRouter.get('/smtp-status', async (_req: Request, res: Response) => {
  try {
    const status = await verifySmtpConnection();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({
      configured: false,
      verified: false,
      error: err.message || 'SMTP connection verification check encountered an error',
    });
  }
});

// POST /api/email/send-test - Sends an explicit test email to configured address without notifying students
emailRouter.post('/send-test', async (req: Request, res: Response) => {
  try {
    const { recipient } = req.body;
    const result = await sendTestEmail(recipient);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch test verification email',
    });
  }
});
