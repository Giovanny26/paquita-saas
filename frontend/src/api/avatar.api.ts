import { client } from './client';
import type { AvatarOptions, Avatar, Job } from '../types';

type OptionItem = { value: string; label: string };

export interface AvatarOptionsData {
  gender: OptionItem[];
  age: OptionItem[];
  ethnicity: OptionItem[];
  skinTone: OptionItem[];
  faceShape: OptionItem[];
  eyeShape: OptionItem[];
  eyeColor: OptionItem[];
  noseShape: OptionItem[];
  lips: OptionItem[];
  eyebrows: OptionItem[];
  hairLength: OptionItem[];
  hairStyle: OptionItem[];
  hairColor: OptionItem[];
  bodyType: OptionItem[];
  height: OptionItem[];
  fashionStyle: OptionItem[];
  makeupLevel: OptionItem[];
  lighting: OptionItem[];
  artStyle: OptionItem[];
}

export const avatarApi = {
  getOptions: async (): Promise<AvatarOptionsData> => {
    const res = await client.get('/avatar/options');
    return res.data as AvatarOptionsData;
  },

  createPack: async (options: AvatarOptions): Promise<{ jobId: string }> => {
    const res = await client.post('/avatar/create-pack', options);
    return res.data as { jobId: string };
  },

  getAvatar: async (): Promise<{ avatar: Avatar }> => {
    const res = await client.get('/avatar');
    return res.data as { avatar: Avatar };
  },

  getJob: async (jobId: string): Promise<Job> => {
    const res = await client.get(`/jobs/${jobId}`);
    return res.data as Job;
  },
};
