import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-400">Paquita AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">
            {user?.credits} créditos
          </span>
          <span className="bg-purple-600/20 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/20">
            {user?.plan}
          </span>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white text-sm transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">
          Hola, {user?.name || user?.email} 👋
        </h2>
        <p className="text-zinc-400 mb-10">¿Qué quieres crear hoy?</p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => navigate('/text-to-image')} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition cursor-pointer">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-lg font-semibold mb-2">Text to Image</h3>
            <p className="text-zinc-400 text-sm">
              Genera imágenes desde texto. Describe lo que quieres ver.
            </p>
            <span className="text-purple-400 text-sm mt-4 block">1 crédito / imagen</span>
          </div>

          <div onClick={() => navigate('/image-to-image')} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition cursor-pointer">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-semibold mb-2">Image to Image</h3>
            <p className="text-zinc-400 text-sm">
              Edita y transforma imágenes existentes con IA.
            </p>
            <span className="text-purple-400 text-sm mt-4 block">1 crédito / imagen</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition cursor-pointer">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold mb-2">Image to Video</h3>
            <p className="text-zinc-400 text-sm">
              Anima tus imágenes y crea videos con IA.
            </p>
            <span className="text-purple-400 text-sm mt-4 block">10 créditos / video</span>
          </div>
        </div>

        {/* Avatar section */}
        <div className="mt-10 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎭 Avatar Digital</h3>
              <p className="text-zinc-400 text-sm">
                Crea tu avatar personalizado y genera contenido consistente.
              </p>
            </div>
            {user?.plan === 'FREE' && (
              <span className="bg-yellow-500/10 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/20">
                Plan de pago requerido
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}