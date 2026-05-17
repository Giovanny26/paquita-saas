import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  textToImage,
  imageToImage,
  imageToVideo,
} from "../services/falService";

const CREDITS_COST = {
  TEXT_TO_IMAGE: 1,
  IMAGE_TO_IMAGE: 1,
  IMAGE_TO_VIDEO: 10,
};

export const generateTextToImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { prompt, isNsfw = false } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt requerido" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Free users can't generate NSFW
    if (isNsfw && user.plan === "FREE") {
      return res
        .status(403)
        .json({ error: "Plan FREE no permite contenido NSFW" });
    }

    // Check credits
    const cost = CREDITS_COST.TEXT_TO_IMAGE;
    if (user.credits < cost) {
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    console.log("isNsfw:", isNsfw);
    console.log("user plan:", user.plan);

    // Generate
    const result = (await textToImage(prompt, isNsfw)) as any;
    const imageUrl = result?.images?.[0]?.url || result?.image?.url;

    // Save generation & deduct credits
    const generation = await prisma.generation.create({
      data: {
        userId,
        type: "TEXT_TO_IMAGE",
        prompt,
        imageUrl,
        isNsfw,
        creditsCost: cost,
        status: "COMPLETED",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });

    res.json({ generation, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando imagen" });
  }
};

export const generateImageToImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { prompt, imageUrl: inputImageUrl, isNsfw = false } = req.body;

    if (!prompt || !inputImageUrl) {
      return res.status(400).json({ error: "Prompt e imageUrl requeridos" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (isNsfw && user.plan === "FREE") {
      return res
        .status(403)
        .json({ error: "Plan FREE no permite contenido NSFW" });
    }

    const cost = CREDITS_COST.IMAGE_TO_IMAGE;
    if (user.credits < cost) {
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    const result = (await imageToImage(prompt, inputImageUrl, isNsfw)) as any;
    const imageUrl = result?.images?.[0]?.url || result?.image?.url;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: "IMAGE_TO_IMAGE",
        prompt,
        imageUrl,
        inputImages: [inputImageUrl],
        isNsfw,
        creditsCost: cost,
        status: "COMPLETED",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });

    res.json({ generation, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando imagen" });
  }
};

export const generateImageToVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { prompt, imageUrl: inputImageUrl } = req.body;

    if (!prompt || !inputImageUrl) {
      return res.status(400).json({ error: "Prompt e imageUrl requeridos" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.plan === "FREE") {
      return res
        .status(403)
        .json({ error: "Plan FREE no permite generación de video" });
    }

    const cost = CREDITS_COST.IMAGE_TO_VIDEO;
    if (user.credits < cost) {
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    const result = (await imageToVideo(prompt, inputImageUrl)) as any;
    const videoUrl = result?.video?.url;

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: "IMAGE_TO_VIDEO",
        prompt,
        videoUrl,
        inputImages: [inputImageUrl],
        isNsfw: true,
        creditsCost: cost,
        status: "COMPLETED",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });

    res.json({ generation, videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando video" });
  }
};

export const getGenerations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const generations = await prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ generations });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo generaciones" });
  }
};
