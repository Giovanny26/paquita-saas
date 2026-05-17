import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getJobById(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        error: 'Invalid job id',
      });
    }

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    if (job.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    return res.json(job);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to fetch job',
    });
  }
}

export async function listMyJobs(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const jobs = await prisma.job.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return res.json(jobs);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to fetch jobs',
    });
  }
}