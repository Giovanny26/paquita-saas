import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { ApiError } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) throw new ApiError(400, 'Email y password son requeridos');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(400, 'El email ya está registrado');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, plan: true, credits: true },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, 'Email y password son requeridos');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Credenciales inválidas');

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) throw new ApiError(401, 'Credenciales inválidas');

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    },
    token,
  });
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, plan: true, credits: true, avatar: true },
  });

  if (!user) throw new ApiError(404, 'Usuario no encontrado');

  res.json({ user });
};
