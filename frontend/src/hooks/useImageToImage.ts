import { useState } from 'react';
import { generationApi } from '../api/generation.api';
import { useAuthStore } from '../store/authStore';

interface UseImageToImageReturn {
  prompt: string;
  setPrompt: (v: string) => void;
  isNsfw: boolean;
  setIsNsfw: (v: boolean) => void;
  loading: boolean;
  imageUrl: string;
  uploadedImageUrl: string;
  clearUpload: () => void;
  error: string;
  generate: () => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useImageToImage(): UseImageToImageReturn {
  const [prompt, setPrompt] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [error, setError] = useState('');
  const fetchMe = useAuthStore((s) => s.fetchMe);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor sube una imagen válida');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 10MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!prompt.trim()) {
      setError('Ingresa un prompt');
      return;
    }
    if (!uploadedImageUrl) {
      setError('Sube una imagen primero');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const data = await generationApi.imageToImage({
        prompt,
        imageUrl: uploadedImageUrl,
        isNsfw,
      });
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

  return {
    prompt,
    setPrompt,
    isNsfw,
    setIsNsfw,
    loading,
    imageUrl,
    uploadedImageUrl,
    clearUpload: () => setUploadedImageUrl(''),
    error,
    generate,
    handleImageUpload,
  };
}
