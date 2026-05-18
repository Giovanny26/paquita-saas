export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ProviderImageResult {
  images: Array<{ url: string }>;
}

export interface ProviderVideoResult {
  video: { url: string };
}

export interface AvatarOptions {
  // Identity
  gender: string;
  age: string;
  ethnicity: string;
  skinTone: string;
  // Face
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  noseShape: string;
  lips: string;
  eyebrows: string;
  // Hair
  hairLength: string;
  hairStyle: string;
  hairColor: string;
  hasBangs: boolean;
  // Body
  bodyType: string;
  height: string;
  // Style
  fashionStyle: string;
  makeupLevel: string;
  // Aesthetic
  lighting: string;
  artStyle: string;
}
