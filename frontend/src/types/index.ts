export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'BASIC' | 'PRO';
  credits: number;
  avatar?: unknown;
}

export interface Generation {
  id: string;
  userId: string;
  type: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE' | 'IMAGE_TO_VIDEO';
  prompt: string;
  imageUrl: string | null;
  videoUrl: string | null;
  isNsfw: boolean;
  creditsCost: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
