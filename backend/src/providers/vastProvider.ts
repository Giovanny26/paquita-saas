import axios from 'axios';
import type { ProviderImageResult } from '../types';

const VAST_API_URL = process.env.VAST_API_URL;

interface VastResponse {
  image_base64: string;
}

function toImageResult(base64: string): ProviderImageResult {
  return { images: [{ url: `data:image/png;base64,${base64}` }] };
}

export const vastProvider = {
  textToImage: async (prompt: string): Promise<ProviderImageResult> => {
    const res = await axios.post<VastResponse>(`${VAST_API_URL}/text-to-image`, {
      prompt,
      num_inference_steps: 28,
    });
    return toImageResult(res.data.image_base64);
  },

  imageToImage: async (prompt: string, imageUrl: string): Promise<ProviderImageResult> => {
    const res = await axios.post<VastResponse>(`${VAST_API_URL}/image-to-image`, {
      prompt,
      image_url: imageUrl,
    });
    return toImageResult(res.data.image_base64);
  },
};
