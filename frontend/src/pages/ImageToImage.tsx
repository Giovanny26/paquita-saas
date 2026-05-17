import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Link } from 'react-router-dom';

export default function ImageToImage() {
  const [prompt, setPrompt] = useState('');
  const [isNsfw, setIsNsfw] = useState(true); // NSFW por defecto en esta página
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [error, setError] = useState('');
  const { user, fetchMe } = useAuthStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor sube una imagen válida');
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 10MB');
      return;
    }

    setError('');

    // Convertir a base64 para preview y envío
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Ingresa un prompt');
      return;
    }
    if (!uploadedImageUrl) {
      setError('Sube una imagen primero');
      return;
    }

    // Free users can't do NSFW
    if (isNsfw && user?.plan === 'FREE') {
      setError('Plan FREE no permite contenido NSFW');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const res = await api.post('/generation/image-to-image', {
        prompt,
        imageUrl: uploadedImageUrl,
        isNsfw,
      });
      setImageUrl(res.data.imageUrl);
      await fetchMe();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error generando imagen';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm">
          ← Volver
        </Link>
        <h1 className="text-xl font-bold text-purple-400">Image to Image {isNsfw && '🔞'}</h1>
        <span className="text-zinc-400 text-sm">{user?.credits} créditos</span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left — Input */}
          <div className="md:col-span-2 space-y-4">
            {/* NSFW Toggle */}
            {user?.plan !== 'FREE' && (
              <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                <button
                  onClick={() => setIsNsfw(!isNsfw)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isNsfw ? 'bg-red-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                      isNsfw ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-zinc-400 text-sm">
                  {isNsfw ? '🔞 Contenido NSFW' : '✨ Contenido SFW'}
                </span>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Imagen de base</label>
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition cursor-pointer bg-zinc-900/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer block">
                  {uploadedImageUrl ? (
                    <div>
                      <p className="text-zinc-400 text-sm mb-2">Imagen cargada ✓</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadedImageUrl('');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-zinc-400 text-sm">📤 Arrastra una imagen aquí o haz clic</p>
                      <p className="text-zinc-600 text-xs mt-1">PNG, JPG, WebP (máx 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">
                Prompt de edición
                {isNsfw && <span className="text-red-400 ml-1">(NSFW)</span>}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-purple-500 focus:outline-none resize-none h-32"
                placeholder={
                  isNsfw
                    ? "Describe qué quieres editar o cambiar en la imagen (NSFW)..."
                    : "Describe qué quieres editar o cambiar en la imagen..."
                }
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !uploadedImageUrl}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Generando...' : `Generar imagen — 1 crédito`}
            </button>
          </div>

          {/* Right — Previews */}
          <div className="space-y-4">
            {/* Uploaded Image Preview */}
            {uploadedImageUrl && (
              <div>
                <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider">Imagen original</p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <img src={uploadedImageUrl} alt="Original" className="w-full h-auto" />
                </div>
              </div>
            )}

            {/* Result */}
            <div>
              <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider">Resultado</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center min-h-64">
                {loading && (
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Editando imagen...</p>
                  </div>
                )}
                {imageUrl && !loading && (
                  <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                )}
                {!imageUrl && !loading && (
                  <p className="text-zinc-600 text-sm text-center px-4">
                    La imagen editada aparecerá aquí
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
