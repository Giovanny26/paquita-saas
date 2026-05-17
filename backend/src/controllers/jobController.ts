import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../types';

export const getJobById = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) throw new ApiError(400, 'ID inválido');

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new ApiError(404, 'Job no encontrado');
  if (job.userId !== req.userId) throw new ApiError(403, 'Forbidden');

  res.json(job);
};

export const listMyJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json(jobs);
};
