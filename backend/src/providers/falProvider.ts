import { fal } from '@fal-ai/client';
import type { AvatarOptions, ProviderImageResult, ProviderVideoResult } from '../types';

fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export const falProvider = {
  textToImage: async (prompt: string): Promise<ProviderImageResult> => {
    const result = await fal.subscribe('fal-ai/qwen-image-2/pro/text-to-image', {
      input: {
        prompt,
        enable_safety_checker: true,
        num_images: 1,
        output_format: 'png',
      },
    });
    return result.data as ProviderImageResult;
  },

  imageToImage: async (
    prompt: string,
    imageUrl: string,
    isNsfw = false
  ): Promise<ProviderImageResult> => {
    const result = await fal.subscribe('fal-ai/qwen-image-2/pro/edit', {
      input: {
        prompt,
        image_urls: [imageUrl],
        enable_safety_checker: !isNsfw,
      },
    });
    return result.data as ProviderImageResult;
  },

  imageToVideo: async (prompt: string, imageUrl: string): Promise<ProviderVideoResult> => {
    const result = await fal.subscribe('fal-ai/wan/v2.7/image-to-video', {
      input: {
        prompt,
        image_url: imageUrl,
      },
    });
    return result.data as ProviderVideoResult;
  },

  generateAvatarFaces: async (options: AvatarOptions): Promise<ProviderImageResult> => {
    const genderWord =
      options.gender === 'masculine'
        ? 'man'
        : options.gender === 'androgynous'
          ? 'androgynous person'
          : 'woman';
    const bangsPart = options.hasBangs
      ? `${options.hairLength} ${options.hairStyle} ${options.hairColor} hair with bangs`
      : `${options.hairLength} ${options.hairStyle} ${options.hairColor} hair`;
    const prompt = [
      `Portrait photo of a ${options.age} year old ${options.ethnicity} ${genderWord}`,
      `${options.skinTone} skin`,
      `${options.faceShape} face shape`,
      `${options.eyeShape} ${options.eyeColor} eyes`,
      `${options.eyebrows} eyebrows`,
      `${options.noseShape} nose`,
      `${options.lips} lips`,
      bangsPart,
      `${options.bodyType} build`,
      `${options.fashionStyle} style`,
      `${options.makeupLevel} makeup`,
      `${options.lighting} lighting`,
      options.artStyle,
      'half body shot, waist up, neutral background, professional studio photo, high quality',
    ].join(', ');

    const result = await fal.subscribe('fal-ai/qwen-image-2/pro/text-to-image', {
      input: {
        prompt,
        num_images: 4,
        enable_safety_checker: false,
      },
    });
    return result.data as ProviderImageResult;
  },
};
