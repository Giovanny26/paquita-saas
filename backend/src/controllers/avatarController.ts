import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateAvatarFaces, imageToImage } from '../services/falService';

export const getAvatarOptions = async (req: Request, res: Response) => {
  res.json({
    ethnicities: ['latina', 'caucasian', 'asian', 'african', 'middle eastern', 'mixed'],
    hairColors: ['black', 'brown', 'blonde', 'red', 'platinum blonde', 'dark brown'],
    hairStyles: ['straight', 'wavy', 'curly', 'long', 'short', 'braided'],
    bodyTypes: ['slim', 'athletic', 'curvy', 'petite'],
    ages: ['18', '20', '25', '30', '35'],
  });
};

export const generateAvatarPreviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { ethnicity, hairColor, hairStyle, bodyType, age } = req.body;

    if (!ethnicity || !hairColor || !hairStyle || !bodyType || !age) {
      return res.status(400).json({ error: 'Todas las opciones son requeridas' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.plan === 'FREE') {
      return res.status(403).json({ error: 'El avatar digital requiere plan de pago' });
    }

    // Cuesta 4 créditos (4 imágenes)
    const cost = 4;
    if (user.credits < cost) {
      return res.status(402).json({ error: 'Créditos insuficientes' });
    }

    const result = await generateAvatarFaces({
      ethnicity,
      hairColor,
      hairStyle,
      bodyType,
      age,
    }) as any;

    const images = result?.images?.map((img: any) => img.url) || [];

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });

    res.json({ images, cost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando previews del avatar' });
  }
};

export const saveAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { imageUrl, options } = req.body;

    if (!imageUrl || !options) {
      return res.status(400).json({ error: 'imageUrl y options son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.plan === 'FREE') {
      return res.status(403).json({ error: 'El avatar digital requiere plan de pago' });
    }

    // Upsert — si ya tiene avatar lo reemplaza
    const avatar = await prisma.avatar.upsert({
      where: { userId },
      update: { imageUrl, options, prompt: JSON.stringify(options) },
      create: { userId, imageUrl, options, prompt: JSON.stringify(options) },
    });

    res.json({ avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error guardando avatar' });
  }
};

export const getAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const avatar = await prisma.avatar.findUnique({ where: { userId } });

    if (!avatar) {
      return res.status(404).json({ error: 'No tienes un avatar configurado' });
    }

    res.json({ avatar });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo avatar' });
  }
};

export const generateWithAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { prompt, isNsfw = false } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.plan === 'FREE') {
      return res.status(403).json({ error: 'El avatar digital requiere plan de pago' });
    }

    const avatar = await prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) {
      return res.status(404).json({ error: 'No tienes un avatar configurado' });
    }

    const cost = 2;
    if (user.credits < cost) {
      return res.status(402).json({ error: 'Créditos insuficientes' });
    }

    // Usa la imagen base del avatar para consistencia
    const result = await imageToImage(prompt, avatar.imageUrl, isNsfw) as any;
    const imageUrl = result?.images?.[0]?.url || result?.image?.url;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: 'IMAGE_TO_IMAGE',
        prompt,
        imageUrl,
        inputImages: [avatar.imageUrl],
        isNsfw,
        creditsCost: cost,
        status: 'COMPLETED',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });

    res.json({ generation, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando con avatar' });
  }
};