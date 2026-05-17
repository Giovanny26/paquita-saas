import { Request, Response } from 'express';
import { ApiError } from '../types';
import { avatarService } from '../services/avatarService';

export const getAvatarOptions = (_req: Request, res: Response) => {
  res.json(avatarService.getOptions());
};

export const generateAvatarPreviews = async (req: Request, res: Response) => {
  const { ethnicity, hairColor, hairStyle, bodyType, age } = req.body;
  if (!ethnicity || !hairColor || !hairStyle || !bodyType || !age) {
    throw new ApiError(400, 'Todas las opciones son requeridas');
  }

  const result = await avatarService.generatePreviews(req.userId, {
    ethnicity,
    hairColor,
    hairStyle,
    bodyType,
    age,
  });
  res.json(result);
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
