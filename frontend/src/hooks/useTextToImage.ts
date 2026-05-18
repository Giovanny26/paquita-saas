import { useState } from 'react';
import { generationApi } from '../api/generation.api';
import { useAuthStore } from '../store/authStore';

interface UseTextToImageReturn {
  prompt: string;
  setPrompt: (v: string) => void;
  isNsfw: boolean;
  setIsNsfw: (v: boolean) => void;
  loading: boolean;
  imageUrl: string;
  error: string;
  generate: () => Promise<void>;
}

export function useTextToImage(): UseTextToImageReturn {
  const [prompt, setPrompt] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const fetchMe = useAuthStore((s) => s.fetchMe);

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const data = await generationApi.textToImage({ prompt, isNsfw });
      setImageUrl(data.imageUrl);
      await fetchMe();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error generando imagen';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { prompt, setPrompt, isNsfw, setIsNsfw, loading, imageUrl, error, generate };
}
