import { useAuthStore } from '../store/authStore';
import { useImageToImage } from '../hooks/useImageToImage';
import { PageHeader } from '../components/PageHeader';
import { NsfwToggle } from '../components/NsfwToggle';
import { ImageResult } from '../components/ImageResult';

export default function ImageToImage() {
  const user = useAuthStore((s) => s.user);
  const {
    prompt,
    setPrompt,
    isNsfw,
    setIsNsfw,
    loading,
    imageUrl,
    uploadedImageUrl,
    clearUpload,
    error,
    generate,
    handleImageUpload,
  } = useImageToImage();

  const handleGenerate = () => {
    if (isNsfw && user?.plan === 'FREE') return; // backend también lo valida, pero evitamos el round-trip
    generate();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={`Image to Image${isNsfw ? ' 🔞' : ''}`}
        credits={user?.credits}
        backTo="/dashboard"
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Input */}
          <div className="md:col-span-2 space-y-4">
            {user?.plan !== 'FREE' && <NsfwToggle value={isNsfw} onChange={setIsNsfw} />}

            {/* Upload */}
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Imagen de base</label>
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition bg-zinc-900/50">
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
                          clearUpload();
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-zinc-400 text-sm">
                        📤 Arrastra una imagen aquí o haz clic
                      </p>
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
                    ? 'Describe qué quieres editar o cambiar en la imagen (NSFW)...'
                    : 'Describe qué quieres editar o cambiar en la imagen...'
                }
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !uploadedImageUrl}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Generando...' : 'Generar imagen — 1 crédito'}
            </button>
          </div>

          {/* Previews */}
          <div className="space-y-4">
            {uploadedImageUrl && (
              <div>
                <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider">
                  Imagen original
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <img src={uploadedImageUrl} alt="Original" className="w-full h-auto" />
                </div>
              </div>
            )}

            <div>
              <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider">Resultado</p>
              <ImageResult loading={loading} imageUrl={imageUrl} loadingText="Editando imagen..." />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
