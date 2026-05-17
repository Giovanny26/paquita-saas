import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_API_KEY!,
});

// Text to Image
export const textToImage = async (prompt: string, isNsfw: boolean = false) => {
  console.log('falService - enable_safety_checker:', !isNsfw);
  
  try {
    const result = await fal.subscribe('fal-ai/qwen-image-2/pro/text-to-image', {
      input: {
        prompt,
        enable_safety_checker: !isNsfw,
        num_images: 1,
        output_format: 'png',
      } as any,
    });
    return result.data;
  } catch (error: any) {
    console.log('FAL ERROR DETAIL:', JSON.stringify(error.body, null, 2));
    throw error;
  }
};

export const testFluxNsfw = async () => {
  const result = await fal.subscribe('fal-ai/flux-lora', {
    input: {
      prompt: 'nude woman standing on tropical beach, full body, photorealistic, 8k, highly detailed, natural lighting, anatomically correct',
      enable_safety_checker: false,
      num_images: 1,
    } as any,
  });
  return result.data;
};

// Image to Image
export const imageToImage = async (
  prompt: string,
  imageUrl: string,
  isNsfw: boolean = false
) => {
  const result = await fal.subscribe('fal-ai/qwen-image-2/pro/edit', {
    input: {
      prompt,
      image_url: imageUrl,
      enable_safety_checker: !isNsfw,
    } as any,
  });

  return result.data;
};

// Image to Video
export const imageToVideo = async (
  prompt: string,
  imageUrl: string,
) => {
  const result = await fal.subscribe('fal-ai/wan/v2.7/image-to-video', {
    input: {
      prompt,
      image_url: imageUrl,
    } as any,
  });

  return result.data;
};

// Generate Avatar faces
export const generateAvatarFaces = async (options: {
  ethnicity: string;
  hairColor: string;
  hairStyle: string;
  bodyType: string;
  age: string;
}) => {
  const prompt = `Portrait photo of a ${options.age} year old ${options.ethnicity} woman, 
    ${options.hairColor} ${options.hairStyle} hair, ${options.bodyType} body type, 
    professional photo, high quality, realistic, neutral background, face only`;

  const result = await fal.subscribe('fal-ai/qwen-image-2/text-to-image', {
    input: {
      prompt,
      num_images: 4,
      enable_safety_checker: false,
    } as any,
  });

  return result.data;
};