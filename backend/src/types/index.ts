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
  ethnicity: string;
  hairColor: string;
  hairStyle: string;
  bodyType: string;
  age: string;
}
