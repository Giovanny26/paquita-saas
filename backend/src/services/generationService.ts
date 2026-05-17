import { Generation } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { falProvider } from '../providers/falProvider';
import { vastProvider } from '../providers/vastProvider';
import { userService } from './userService';

const CREDITS_COST = {
  TEXT_TO_IMAGE: 1,
  IMAGE_TO_IMAGE: 1,
  IMAGE_TO_VIDEO: 10,
} as const;

interface TextToImageParams {
  prompt: string;
  isNsfw: boolean;
}

interface ImageToImageParams {
  prompt: string;
  imageUrl: string;
  isNsfw: boolean;
}

interface ImageToVideoParams {
  prompt: string;
  imageUrl: string;
}

interface GenerationResult {
  generation: Generation;
  imageUrl: string | null;
}

interface VideoGenerationResult {
  generation: Generation;
  videoUrl: string | null;
}

export const generationService = {
  textToImage: async (userId: string, params: TextToImageParams): Promise<GenerationResult> => {
    const { prompt, isNsfw } = params;
    const cost = CREDITS_COST.TEXT_TO_IMAGE;

    const user = await userService.findById(userId);
    if (isNsfw) userService.requireNsfwAccess(user);
    userService.requireCredits(user, cost);

    const result = isNsfw
      ? await vastProvider.textToImage(prompt)
      : await falProvider.textToImage(prompt);

    const imageUrl = result.images[0]?.url ?? null;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: 'TEXT_TO_IMAGE',
        prompt,
        imageUrl,
        isNsfw,
        creditsCost: cost,
        status: 'COMPLETED',
      },
    });

    await userService.deductCredits(userId, cost);
    return { generation, imageUrl };
  },

  imageToImage: async (userId: string, params: ImageToImageParams): Promise<GenerationResult> => {
    const { prompt, imageUrl: inputImageUrl, isNsfw } = params;
    const cost = CREDITS_COST.IMAGE_TO_IMAGE;

    const user = await userService.findById(userId);
    if (isNsfw) userService.requireNsfwAccess(user);
    userService.requireCredits(user, cost);

    const result = isNsfw
      ? await vastProvider.imageToImage(prompt, inputImageUrl)
      : await falProvider.imageToImage(prompt, inputImageUrl);

    const imageUrl = result.images[0]?.url ?? null;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: 'IMAGE_TO_IMAGE',
        prompt,
        imageUrl,
        inputImages: [inputImageUrl],
        isNsfw,
        creditsCost: cost,
        status: 'COMPLETED',
      },
    });

    await userService.deductCredits(userId, cost);
    return { generation, imageUrl };
  },

  imageToVideo: async (
    userId: string,
    params: ImageToVideoParams
  ): Promise<VideoGenerationResult> => {
    const { prompt, imageUrl: inputImageUrl } = params;
    const cost = CREDITS_COST.IMAGE_TO_VIDEO;

    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, cost);

    const result = await falProvider.imageToVideo(prompt, inputImageUrl);
    const videoUrl = result.video?.url ?? null;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: 'IMAGE_TO_VIDEO',
        prompt,
        videoUrl,
        inputImages: [inputImageUrl],
        isNsfw: false,
        creditsCost: cost,
        status: 'COMPLETED',
      },
    });

    await userService.deductCredits(userId, cost);
    return { generation, videoUrl };
  },

  getHistory: async (userId: string): Promise<Generation[]> => {
    return prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },
};
