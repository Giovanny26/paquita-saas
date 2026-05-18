import { Avatar, AvatarRefKind, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { falProvider } from '../providers/falProvider';
import { userService } from './userService';
import type { AvatarOptions } from '../types';

const AVATAR_PREVIEWS_COST = 4;
const AVATAR_GENERATION_COST = 2;
const AVATAR_PACK_COST = 15;

interface SaveAvatarParams {
  imageUrl: string;
  options: Prisma.InputJsonValue;
}

interface AvatarPreviewsResult {
  images: string[];
  cost: number;
}

interface AvatarGenerationResult {
  imageUrl: string | null;
}

interface CreatePackResult {
  jobId: string;
}

type OptionItem = { value: string; label: string };

const DERIVED_VIEWS: Array<{ kind: AvatarRefKind; prompt: string }> = [
  {
    kind: 'FACE',
    prompt: 'extreme close-up portrait, face only, same person, professional photo, high quality',
  },
  {
    kind: 'HALF_BODY',
    prompt: 'half body portrait, waist up, same person, professional photo, high quality',
  },
  {
    kind: 'FULL_BODY',
    prompt: 'full body standing portrait, same person, professional photo, high quality',
  },
  {
    kind: 'THREE_QUARTER',
    prompt:
      'three quarter view portrait, slightly turned, same person, professional photo, high quality',
  },
  {
    kind: 'PROFILE',
    prompt: 'side profile portrait, same person, professional photo, high quality',
  },
];

function o(value: string, label: string): OptionItem {
  return { value, label };
}

export const avatarService = {
  getOptions: () => ({
    gender: [
      o('feminine', 'Feminine'),
      o('masculine', 'Masculine'),
      o('androgynous', 'Androgynous'),
    ],
    age: [
      o('18-22', '18-22'),
      o('23-28', '23-28'),
      o('29-35', '29-35'),
      o('36-45', '36-45'),
      o('46-55', '46-55'),
    ],
    ethnicity: [
      o('latina', 'Latina'),
      o('caucasian', 'Caucasian'),
      o('asian', 'Asian'),
      o('african', 'African'),
      o('middle_eastern', 'Middle Eastern'),
      o('mixed', 'Mixed'),
    ],
    skinTone: [
      o('very_light', 'Very Light'),
      o('light', 'Light'),
      o('medium', 'Medium'),
      o('tan', 'Tan'),
      o('dark', 'Dark'),
      o('very_dark', 'Very Dark'),
    ],
    faceShape: [
      o('oval', 'Oval'),
      o('round', 'Round'),
      o('square', 'Square'),
      o('heart', 'Heart'),
      o('diamond', 'Diamond'),
    ],
    eyeShape: [
      o('almond', 'Almond'),
      o('round', 'Round'),
      o('hooded', 'Hooded'),
      o('monolid', 'Monolid'),
      o('upturned', 'Upturned'),
    ],
    eyeColor: [
      o('dark_brown', 'Dark Brown'),
      o('brown', 'Brown'),
      o('hazel', 'Hazel'),
      o('green', 'Green'),
      o('blue', 'Blue'),
      o('gray', 'Gray'),
    ],
    noseShape: [
      o('straight', 'Straight'),
      o('button', 'Button'),
      o('wide', 'Wide'),
      o('narrow', 'Narrow'),
      o('upturned', 'Upturned'),
    ],
    lips: [o('thin', 'Thin'), o('medium', 'Medium'), o('full', 'Full'), o('wide', 'Wide')],
    eyebrows: [
      o('thin', 'Thin'),
      o('medium', 'Medium'),
      o('thick', 'Thick'),
      o('arched', 'Arched'),
      o('straight', 'Straight'),
    ],
    hairLength: [
      o('pixie', 'Pixie'),
      o('short', 'Short'),
      o('shoulder', 'Shoulder'),
      o('long', 'Long'),
      o('extra_long', 'Extra Long'),
    ],
    hairStyle: [
      o('straight', 'Straight'),
      o('wavy', 'Wavy'),
      o('curly', 'Curly'),
      o('coily', 'Coily'),
      o('braided', 'Braided'),
      o('bun', 'Bun'),
      o('ponytail', 'Ponytail'),
    ],
    hairColor: [
      o('black', 'Black'),
      o('dark_brown', 'Dark Brown'),
      o('brown', 'Brown'),
      o('light_brown', 'Light Brown'),
      o('blonde', 'Blonde'),
      o('platinum', 'Platinum'),
      o('red', 'Red'),
      o('auburn', 'Auburn'),
    ],
    bodyType: [
      o('slim', 'Slim'),
      o('athletic', 'Athletic'),
      o('curvy', 'Curvy'),
      o('petite', 'Petite'),
      o('plus_size', 'Plus Size'),
    ],
    height: [o('petite', 'Petite'), o('average', 'Average'), o('tall', 'Tall')],
    fashionStyle: [
      o('casual', 'Casual'),
      o('elegant', 'Elegant'),
      o('sporty', 'Sporty'),
      o('streetwear', 'Streetwear'),
      o('bohemian', 'Bohemian'),
      o('professional', 'Professional'),
    ],
    makeupLevel: [
      o('none', 'No Makeup'),
      o('natural', 'Natural'),
      o('glam', 'Glam'),
      o('artistic', 'Artistic'),
    ],
    lighting: [
      o('natural', 'Natural'),
      o('studio', 'Studio'),
      o('golden_hour', 'Golden Hour'),
      o('dramatic', 'Dramatic'),
      o('soft', 'Soft'),
    ],
    artStyle: [
      o('photorealistic', 'Photorealistic'),
      o('cinematic', 'Cinematic'),
      o('editorial', 'Editorial'),
      o('anime', 'Anime'),
    ],
  }),

  generatePreviews: async (
    userId: string,
    options: AvatarOptions
  ): Promise<AvatarPreviewsResult> => {
    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, AVATAR_PREVIEWS_COST);

    const result = await falProvider.generateAvatarFaces(options);
    const images = result.images.map((img) => img.url);

    await userService.deductCredits(userId, AVATAR_PREVIEWS_COST);
    return { images, cost: AVATAR_PREVIEWS_COST };
  },

  createPack: async (userId: string, options: AvatarOptions): Promise<CreatePackResult> => {
    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, AVATAR_PACK_COST);

    await userService.deductCredits(userId, AVATAR_PACK_COST);

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'AVATAR_PACK',
        status: 'PENDING',
        payload: options as Prisma.InputJsonValue,
      },
    });

    void avatarService._processAvatarPack(job.id, userId, options);

    return { jobId: job.id };
  },

  _processAvatarPack: async (jobId: string, userId: string, options: AvatarOptions) => {
    try {
      await prisma.job.update({ where: { id: jobId }, data: { status: 'PROCESSING' } });

      const baseResult = await falProvider.generateAvatarFaces(options);
      const primaryUrl = baseResult.images[0]?.url;
      if (!primaryUrl) throw new Error('No se pudo generar la imagen base del avatar');

      const avatar = await prisma.avatar.upsert({
        where: { userId },
        update: {
          imageUrl: primaryUrl,
          options: options as Prisma.InputJsonValue,
          prompt: JSON.stringify(options),
        },
        create: {
          userId,
          imageUrl: primaryUrl,
          options: options as Prisma.InputJsonValue,
          prompt: JSON.stringify(options),
        },
      });

      await prisma.avatarRef.deleteMany({ where: { avatarId: avatar.id } });

      await prisma.avatarRef.create({
        data: { avatarId: avatar.id, kind: 'PRIMARY', imageUrl: primaryUrl },
      });

      for (const view of DERIVED_VIEWS) {
        try {
          const viewResult = await falProvider.imageToImage(view.prompt, primaryUrl, false);
          const viewUrl = viewResult.images[0]?.url;
          if (viewUrl) {
            await prisma.avatarRef.create({
              data: { avatarId: avatar.id, kind: view.kind, imageUrl: viewUrl },
            });
          }
        } catch {
          // Continue generating other views if one fails
        }
      }

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          result: { avatarId: avatar.id } as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  },

  save: async (userId: string, params: SaveAvatarParams): Promise<Avatar> => {
    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);

    return prisma.avatar.upsert({
      where: { userId },
      update: {
        imageUrl: params.imageUrl,
        options: params.options,
        prompt: JSON.stringify(params.options),
      },
      create: {
        userId,
        imageUrl: params.imageUrl,
        options: params.options,
        prompt: JSON.stringify(params.options),
      },
    });
  },

  findByUserId: async (userId: string) => {
    const avatar = await prisma.avatar.findUnique({
      where: { userId },
      include: { avatarRefs: { orderBy: { createdAt: 'asc' } } },
    });
    if (!avatar) throw new Error('No tienes un avatar configurado');
    return avatar;
  },

  generateWithAvatar: async (
    userId: string,
    params: { prompt: string; isNsfw: boolean }
  ): Promise<AvatarGenerationResult> => {
    const { prompt, isNsfw } = params;

    const user = await userService.findById(userId);
    userService.requirePaidPlan(user);
    userService.requireCredits(user, AVATAR_GENERATION_COST);

    const avatar = await prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) throw new Error('No tienes un avatar configurado');

    // Avatar always uses falProvider to maintain visual character consistency
    const result = await falProvider.imageToImage(prompt, avatar.imageUrl, isNsfw);
    const imageUrl = result.images[0]?.url ?? null;

    await prisma.generation.create({
      data: {
        userId,
        type: 'IMAGE_TO_IMAGE',
        prompt,
        imageUrl,
        inputImages: [avatar.imageUrl],
        isNsfw,
        creditsCost: AVATAR_GENERATION_COST,
        status: 'COMPLETED',
      },
    });

    await userService.deductCredits(userId, AVATAR_GENERATION_COST);
    return { imageUrl };
  },
};
