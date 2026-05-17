import type { Generation } from '../types';
import client from './client';

interface TextToImageParams {
  prompt: string;
  isNsfw: boolean;
}

interface ImageToImageParams {
  prompt: string;
  imageUrl: string;
  isNsfw: boolean;
}

interface GenerationResult {
  generation: Generation;
  imageUrl: string;
}

export const generationApi = {
  textToImage: async (params: TextToImageParams): Promise<GenerationResult> => {
    const res = await client.post('/generation/text-to-image', params);
    return res.data;
  },

  imageToImage: async (params: ImageToImageParams): Promise<GenerationResult> => {
    const res = await client.post('/generation/image-to-image', params);
    return res.data;
  },
};
