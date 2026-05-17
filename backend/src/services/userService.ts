import { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../types';

export const userService = {
  findById: async (id: string): Promise<User> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return user;
  },

  requirePaidPlan: (user: User): void => {
    if (user.plan === 'FREE') throw new ApiError(403, 'Se requiere plan de pago');
  },

  requireNsfwAccess: (user: User): void => {
    if (user.plan === 'FREE') throw new ApiError(403, 'Plan FREE no permite contenido NSFW');
  },

  requireCredits: (user: User, cost: number): void => {
    if (user.credits < cost) throw new ApiError(402, 'Créditos insuficientes');
  },

  deductCredits: async (userId: string, cost: number): Promise<void> => {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });
  },
};
