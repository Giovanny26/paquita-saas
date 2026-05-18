import { Request, Response } from 'express';
import { ApiError } from '../types';
import { avatarService } from '../services/avatarService';
import type { AvatarOptions } from '../types';

export const getAvatarOptions = (_req: Request, res: Response) => {
  res.json(avatarService.getOptions());
};

function validateAvatarOptions(body: Record<string, unknown>): AvatarOptions {
  const required = [
    'gender',
    'age',
    'ethnicity',
    'skinTone',
    'faceShape',
    'eyeShape',
    'eyeColor',
    'noseShape',
    'lips',
    'eyebrows',
    'hairLength',
    'hairStyle',
    'hairColor',
    'bodyType',
    'height',
    'fashionStyle',
    'makeupLevel',
    'lighting',
    'artStyle',
  ];
  for (const field of required) {
    if (!body[field]) throw new ApiError(400, `Campo requerido: ${field}`);
  }
  return {
    gender: body.gender as string,
    age: body.age as string,
    ethnicity: body.ethnicity as string,
    skinTone: body.skinTone as string,
    faceShape: body.faceShape as string,
    eyeShape: body.eyeShape as string,
    eyeColor: body.eyeColor as string,
    noseShape: body.noseShape as string,
    lips: body.lips as string,
    eyebrows: body.eyebrows as string,
    hairLength: body.hairLength as string,
    hairStyle: body.hairStyle as string,
    hairColor: body.hairColor as string,
    hasBangs: Boolean(body.hasBangs),
    bodyType: body.bodyType as string,
    height: body.height as string,
    fashionStyle: body.fashionStyle as string,
    makeupLevel: body.makeupLevel as string,
    lighting: body.lighting as string,
    artStyle: body.artStyle as string,
  };
}

export const generateAvatarPreviews = async (req: Request, res: Response) => {
  const options = validateAvatarOptions(req.body as Record<string, unknown>);
  const result = await avatarService.generatePreviews(req.userId, options);
  res.json(result);
};

export const createAvatarPack = async (req: Request, res: Response) => {
  const options = validateAvatarOptions(req.body as Record<string, unknown>);
  const result = await avatarService.createPack(req.userId, options);
  res.status(202).json(result);
};

export const saveAvatar = async (req: Request, res: Response) => {
  const { imageUrl, options } = req.body;
  if (!imageUrl || !options) throw new ApiError(400, 'imageUrl y options son requeridos');

  const avatar = await avatarService.save(req.userId, { imageUrl, options });
  res.json({ avatar });
};

export const getAvatar = async (req: Request, res: Response) => {
  const avatar = await avatarService.findByUserId(req.userId);
  res.json({ avatar });
};

export const generateWithAvatar = async (req: Request, res: Response) => {
  const { prompt, isNsfw = false } = req.body;
  if (!prompt) throw new ApiError(400, 'Prompt requerido');

  const result = await avatarService.generateWithAvatar(req.userId, { prompt, isNsfw });
  res.json(result);
};
