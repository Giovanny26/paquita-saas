import { useAuthStore } from '../store/authStore';
import { useTextToImage } from '../hooks/useTextToImage';
import { PageHeader } from '../components/PageHeader';
import { NsfwToggle } from '../components/NsfwToggle';
import { ImageResult } from '../components/ImageResult';

export default function TextToImage() {
  const user = useAuthStore((s) => s.user);
  const { prompt, setPrompt, isNsfw, setIsNsfw, loading, imageUrl, error, generate } =
    useTextToImage();

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Text to Image" credits={user?.credits} backTo="/dashboard" />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-purple-500 focus:outline-none resize-none h-40"
                placeholder="Ultra realistic portrait of a 25 year old latina woman, long dark wavy hair, cinematic lighting..."
              />
            </div>

            {user?.plan !== 'FREE' && <NsfwToggle value={isNsfw} onChange={setIsNsfw} />}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Generando...' : 'Generar imagen — 1 crédito'}
            </button>
          </div>

          {/* Result */}
          <ImageResult
            loading={loading}
            imageUrl={imageUrl}
            loadingText="Generando con Qwen 2.0 Pro..."
          />
        </div>
      </main>
    </div>
  );
}
