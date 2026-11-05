import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Interview } from '../models/Interview';
import { inMemoryStore } from '../db';

export const interviewRouter = Router();

// GET all interviews
interviewRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (studentId) query.studentId = studentId;
      const interviews = await Interview.find(query).sort({ scheduledAt: 1 });
      return res.json(interviews);
    }

    let results = [...inMemoryStore.interviews];
    if (studentId) results = results.filter((i) => i.studentId === studentId);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch interviews', details: err.message });
  }
});

// POST schedule / record interview
interviewRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.studentId || !body.companyName || !body.role) {
      return res.status(400).json({ error: 'studentId, companyName, and role are required' });
    }

    const newInterview = {
      interviewId: body.interviewId || `int-${Date.now()}`,
      studentId: body.studentId,
      jobId: body.jobId || '',
      companyName: body.companyName,
      role: body.role,
      roundType: body.roundType || 'Technical',
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
      durationMinutes: Number(body.durationMinutes) || 45,
      meetingLink: body.meetingLink || '',
      interviewerName: body.interviewerName || 'Technical Interview Panel',
      status: body.status || 'Scheduled',
      score: body.score !== undefined ? Number(body.score) : undefined,
      questions: body.questions || [],
      summaryFeedback: body.summaryFeedback || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Interview.create(newInterview);
      return res.status(201).json(created);
    }

    inMemoryStore.interviews.unshift(newInterview as any);
    return res.status(201).json(newInterview);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create interview record', details: err.message });
  }
});
