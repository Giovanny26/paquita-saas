import { useState, useEffect, useCallback } from 'react';
import { avatarApi } from '../api/avatar.api';
import { useAuthStore } from '../store/authStore';
import type { AvatarOptions, Avatar, JobStatus } from '../types';

export const DEFAULT_OPTIONS: AvatarOptions = {
  gender: 'feminine',
  age: '23-28',
  ethnicity: 'latina',
  skinTone: 'tan',
  faceShape: 'oval',
  eyeShape: 'almond',
  eyeColor: 'brown',
  noseShape: 'straight',
  lips: 'full',
  eyebrows: 'arched',
  hairLength: 'long',
  hairStyle: 'wavy',
  hairColor: 'dark_brown',
  hasBangs: false,
  bodyType: 'curvy',
  height: 'average',
  fashionStyle: 'casual',
  makeupLevel: 'natural',
  lighting: 'natural',
  artStyle: 'photorealistic',
};

export const PERSONALITY_PRESETS = [
  {
    id: 'cute_latina',
    name: 'Cute Latina',
    emoji: '🌺',
    options: {
      ...DEFAULT_OPTIONS,
      ethnicity: 'latina',
      skinTone: 'tan',
      age: '23-28',
      faceShape: 'heart',
      eyeShape: 'almond',
      eyeColor: 'brown',
      noseShape: 'button',
      lips: 'full',
      eyebrows: 'arched',
      hairLength: 'long',
      hairStyle: 'wavy',
      hairColor: 'dark_brown',
      hasBangs: false,
      bodyType: 'curvy',
      fashionStyle: 'casual',
      makeupLevel: 'natural',
      lighting: 'natural',
      artStyle: 'photorealistic',
    },
  },
  {
    id: 'blonde_influencer',
    name: 'Blonde Influencer',
    emoji: '✨',
    options: {
      ...DEFAULT_OPTIONS,
      ethnicity: 'caucasian',
      skinTone: 'light',
      age: '18-22',
      faceShape: 'oval',
      eyeShape: 'almond',
      eyeColor: 'blue',
      noseShape: 'straight',
      lips: 'full',
      eyebrows: 'arched',
      hairLength: 'long',
      hairStyle: 'straight',
      hairColor: 'blonde',
      hasBangs: false,
      bodyType: 'slim',
      height: 'tall',
      fashionStyle: 'elegant',
      makeupLevel: 'glam',
      lighting: 'studio',
      artStyle: 'editorial',
    },
  },
  {
    id: 'gamer_girl',
    name: 'Gamer Girl',
    emoji: '🎮',
    options: {
      ...DEFAULT_OPTIONS,
      ethnicity: 'asian',
      skinTone: 'light',
      age: '18-22',
      faceShape: 'round',
      eyeShape: 'monolid',
      eyeColor: 'dark_brown',
      noseShape: 'button',
      lips: 'medium',
      eyebrows: 'straight',
      hairLength: 'long',
      hairStyle: 'straight',
      hairColor: 'black',
      hasBangs: true,
      bodyType: 'petite',
      height: 'petite',
      fashionStyle: 'streetwear',
      makeupLevel: 'natural',
      lighting: 'dramatic',
      artStyle: 'anime',
    },
  },
  {
    id: 'goth_girl',
    name: 'Goth Girl',
    emoji: '🖤',
    options: {
      ...DEFAULT_OPTIONS,
      ethnicity: 'caucasian',
      skinTone: 'very_light',
      age: '23-28',
      faceShape: 'oval',
      eyeShape: 'hooded',
      eyeColor: 'gray',
      noseShape: 'narrow',
      lips: 'full',
      eyebrows: 'thick',
      hairLength: 'long',
      hairStyle: 'straight',
      hairColor: 'black',
      hasBangs: true,
      bodyType: 'slim',
      fashionStyle: 'streetwear',
      makeupLevel: 'artistic',
      lighting: 'dramatic',
      artStyle: 'cinematic',
    },
  },
  {
    id: 'elegant_model',
    name: 'Elegant Model',
    emoji: '👑',
    options: {
      ...DEFAULT_OPTIONS,
      ethnicity: 'mixed',
      skinTone: 'medium',
      age: '29-35',
      faceShape: 'diamond',
      eyeShape: 'almond',
      eyeColor: 'hazel',
      noseShape: 'straight',
      lips: 'medium',
      eyebrows: 'arched',
      hairLength: 'shoulder',
      hairStyle: 'wavy',
      hairColor: 'auburn',
      hasBangs: false,
      bodyType: 'athletic',
      height: 'tall',
      fashionStyle: 'elegant',
      makeupLevel: 'glam',
      lighting: 'studio',
      artStyle: 'editorial',
    },
  },
];

interface UseAvatarCreatorReturn {
  step: number;
  options: AvatarOptions;
  activePreset: string | null;
  loading: boolean;
  jobId: string | null;
  jobStatus: JobStatus | null;
  avatar: Avatar | null;
  error: string;
  setStep: (step: number) => void;
  setOption: <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => void;
  applyPreset: (presetId: string) => void;
  createPack: () => Promise<void>;
  resetCreator: () => void;
}

export function useAvatarCreator(): UseAvatarCreatorReturn {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<AvatarOptions>(DEFAULT_OPTIONS);
  const [activePreset, setActivePreset] = useState<string | null>('cute_latina');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState('');
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const setOption = useCallback(
    <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
      setActivePreset(null);
    },
    []
  );

  const applyPreset = useCallback((presetId: string) => {
    const preset = PERSONALITY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setOptions(preset.options as AvatarOptions);
    setActivePreset(presetId);
  }, []);

  const createPack = useCallback(async () => {
    setLoading(true);
    setError('');
    setJobId(null);
    setJobStatus(null);
    setAvatar(null);
    try {
      const { jobId: newJobId } = await avatarApi.createPack(options);
      setJobId(newJobId);
      setJobStatus('PENDING');
      await fetchMe();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al crear el avatar pack';
      setError(msg);
      setLoading(false);
    }
  }, [options, fetchMe]);

  useEffect(() => {
    if (!jobId || jobStatus === 'COMPLETED' || jobStatus === 'FAILED') return;

    const interval = setInterval(async () => {
      try {
        const job = await avatarApi.getJob(jobId);
        setJobStatus(job.status);
        if (job.status === 'COMPLETED') {
          const { avatar: fetchedAvatar } = await avatarApi.getAvatar();
          setAvatar(fetchedAvatar);
          setLoading(false);
        } else if (job.status === 'FAILED') {
          setError(job.error ?? 'Error generando el avatar pack');
          setLoading(false);
        }
      } catch {
        // Ignore polling errors, keep retrying
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const resetCreator = useCallback(() => {
    setStep(1);
    setOptions(DEFAULT_OPTIONS);
    setActivePreset('cute_latina');
    setLoading(false);
    setJobId(null);
    setJobStatus(null);
    setAvatar(null);
    setError('');
  }, []);

  return {
    step,
    options,
    activePreset,
    loading,
    jobId,
    jobStatus,
    avatar,
    error,
    setStep,
    setOption,
    applyPreset,
    createPack,
    resetCreator,
  };
}
