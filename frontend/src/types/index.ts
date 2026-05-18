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

export interface AvatarOptions {
  gender: string;
  age: string;
  ethnicity: string;
  skinTone: string;
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  noseShape: string;
  lips: string;
  eyebrows: string;
  hairLength: string;
  hairStyle: string;
  hairColor: string;
  hasBangs: boolean;
  bodyType: string;
  height: string;
  fashionStyle: string;
  makeupLevel: string;
  lighting: string;
  artStyle: string;
}

export type AvatarRefKind =
  | 'PRIMARY'
  | 'FACE'
  | 'HALF_BODY'
  | 'FULL_BODY'
  | 'THREE_QUARTER'
  | 'PROFILE';

export interface AvatarRef {
  id: string;
  kind: AvatarRefKind;
  imageUrl: string;
}

export interface Avatar {
  id: string;
  userId: string;
  imageUrl: string;
  options: AvatarOptions;
  avatarRefs: AvatarRef[];
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  result: { avatarId?: string } | null;
  error: string | null;
  createdAt: string;
}
