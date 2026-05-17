import { Request, Response } from 'express';
import { ApiError } from '../types';
import { generationService } from '../services/generationService';

export const generateTextToImage = async (req: Request, res: Response) => {
  const { prompt, isNsfw = false } = req.body;
  if (!prompt) throw new ApiError(400, 'Prompt requerido');

  const result = await generationService.textToImage(req.userId, { prompt, isNsfw });
  res.json(result);
};

export const generateImageToImage = async (req: Request, res: Response) => {
  const { prompt, imageUrl, isNsfw = false } = req.body;
  if (!prompt || !imageUrl) throw new ApiError(400, 'Prompt e imageUrl requeridos');

  const result = await generationService.imageToImage(req.userId, { prompt, imageUrl, isNsfw });
  res.json(result);
};

export const generateImageToVideo = async (req: Request, res: Response) => {
  const { prompt, imageUrl } = req.body;
  if (!prompt || !imageUrl) throw new ApiError(400, 'Prompt e imageUrl requeridos');

  const result = await generationService.imageToVideo(req.userId, { prompt, imageUrl });
  res.json(result);
};

export const getGenerations = async (req: Request, res: Response) => {
  const generations = await generationService.getHistory(req.userId);
  res.json({ generations });
};
