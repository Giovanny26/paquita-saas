import { Avatar, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { falProvider } from '../providers/falProvider';
import { userService } from './userService';
import type { AvatarOptions } from '../types';

const AVATAR_PREVIEWS_COST = 4;
const AVATAR_GENERATION_COST = 2;

interface SaveAvatarParams {
  imageUrl: string;
  options: Prisma.InputJsonValue;
}

interface AvatarPreviewsResult {
  images: string[];
  cost: number;
}

interface AvatarGenerationResult {
  imageUrl: string | null;
}

export const avatarService = {
  getOptions: () => ({
    ethnicities: ['latina', 'caucasian', 'asian', 'african', 'middle eastern', 'mixed'],
    hairColors: ['black', 'brown', 'blonde', 'red', 'platinum blonde', 'dark brown'],
    hairStyles: ['straight', 'wavy', 'curly', 'long', 'short', 'braided'],
    bodyTypes: ['slim', 'athletic', 'curvy', 'petite'],
    ages: ['18', '20', '25', '30', '35'],
  }),

  generatePreviews: async (
    userId: string,
    options: AvatarOptions
  ): Promise<AvatarPreviewsResult> => {
    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, AVATAR_PREVIEWS_COST);

    const result = await falProvider.generateAvatarFaces(options);
    const images = result.images.map((img) => img.url);

    await userService.deductCredits(userId, AVATAR_PREVIEWS_COST);
    return { images, cost: AVATAR_PREVIEWS_COST };
  },

  save: async (userId: string, params: SaveAvatarParams): Promise<Avatar> => {
    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);

    return prisma.avatar.upsert({
      where: { userId },
      update: {
        imageUrl: params.imageUrl,
        options: params.options,
        prompt: JSON.stringify(params.options),
      },
      create: {
        userId,
        imageUrl: params.imageUrl,
        options: params.options,
        prompt: JSON.stringify(params.options),
      },
    });
  },

  findByUserId: async (userId: string): Promise<Avatar> => {
    const avatar = await prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) throw new Error('No tienes un avatar configurado');
    return avatar;
  },

  generateWithAvatar: async (
    userId: string,
    params: { prompt: string; isNsfw: boolean }
  ): Promise<AvatarGenerationResult> => {
    const { prompt, isNsfw } = params;

    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, AVATAR_GENERATION_COST);

    const avatar = await prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) throw new Error('No tienes un avatar configurado');

    // Avatar siempre usa falProvider para mantener consistencia visual del personaje
    const result = await falProvider.imageToImage(prompt, avatar.imageUrl, isNsfw);
    const imageUrl = result.images[0]?.url ?? null;

    await prisma.generation.create({
      data: {
        userId,
        type: 'IMAGE_TO_IMAGE',
        prompt,
        imageUrl,
        inputImages: [avatar.imageUrl],
        isNsfw,
        creditsCost: AVATAR_GENERATION_COST,
        status: 'COMPLETED',
      },
    });

    await userService.deductCredits(userId, AVATAR_GENERATION_COST);
    return { imageUrl };
  },
};
