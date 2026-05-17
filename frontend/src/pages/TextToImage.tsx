import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Link } from 'react-router-dom';

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const { user, fetchMe } = useAuthStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      const res = await api.post('/generation/text-to-image', { prompt, isNsfw });
      setImageUrl(res.data.imageUrl);
      await fetchMe();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error generando imagen');
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
        <h1 className="text-xl font-bold text-purple-400">Text to Image</h1>
        <span className="text-zinc-400 text-sm">{user?.credits} créditos</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left — Input */}
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

            {user?.plan !== 'FREE' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNsfw(!isNsfw)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isNsfw ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                    isNsfw ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-zinc-400 text-sm">Contenido NSFW</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Generando...' : 'Generar imagen — 1 crédito'}
            </button>
          </div>

          {/* Right — Result */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-64">
            {loading && (
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">Generando con Qwen 2.0 Pro...</p>
              </div>
            )}
            {imageUrl && !loading && (
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-full object-cover"
              />
            )}
            {!imageUrl && !loading && (
              <p className="text-zinc-600 text-sm">La imagen aparecerá aquí</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}