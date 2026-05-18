import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { PageHeader } from '../components/PageHeader';
import { useAvatarCreator, PERSONALITY_PRESETS } from '../hooks/useAvatarCreator';
import type { AvatarOptions, AvatarRef } from '../types';

const REF_LABELS: Record<string, string> = {
  PRIMARY: 'Principal',
  FACE: 'Primer plano',
  HALF_BODY: 'Medio cuerpo',
  FULL_BODY: 'Cuerpo completo',
  THREE_QUARTER: 'Tres cuartos',
  PROFILE: 'Perfil',
};

const PRESET_DESCRIPTIONS: Record<string, string> = {
  cute_latina: 'Latina, cabello ondulado oscuro, look natural',
  blonde_influencer: 'Caucásica, rubia, estilo editorial glamuroso',
  gamer_girl: 'Asiática, flequillo, estética anime',
  goth_girl: 'Piel muy clara, cabello negro, look dramático',
  elegant_model: 'Mixta, castaño cobrizo, estilo editorial elegante',
};

const STEPS = ['Identidad', 'Rasgos', 'Cabello y cuerpo', 'Estilo'];

function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              value === opt.value
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-xs text-zinc-400 uppercase tracking-wider">{label}</p>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition ${value ? 'bg-purple-600' : 'bg-zinc-700'}`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

const IDENTITY_OPTIONS = {
  gender: [
    { value: 'feminine', label: 'Femenino' },
    { value: 'masculine', label: 'Masculino' },
    { value: 'androgynous', label: 'Andrógino' },
  ],
  age: [
    { value: '18-22', label: '18-22' },
    { value: '23-28', label: '23-28' },
    { value: '29-35', label: '29-35' },
    { value: '36-45', label: '36-45' },
    { value: '46-55', label: '46-55' },
  ],
  ethnicity: [
    { value: 'latina', label: 'Latina' },
    { value: 'caucasian', label: 'Caucásica' },
    { value: 'asian', label: 'Asiática' },
    { value: 'african', label: 'Africana' },
    { value: 'middle_eastern', label: 'Medio Oriente' },
    { value: 'mixed', label: 'Mixta' },
  ],
  skinTone: [
    { value: 'very_light', label: 'Muy claro' },
    { value: 'light', label: 'Claro' },
    { value: 'medium', label: 'Medio' },
    { value: 'tan', label: 'Bronceado' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'very_dark', label: 'Muy oscuro' },
  ],
};

const FACE_OPTIONS = {
  faceShape: [
    { value: 'oval', label: 'Ovalada' },
    { value: 'round', label: 'Redonda' },
    { value: 'square', label: 'Cuadrada' },
    { value: 'heart', label: 'Corazón' },
    { value: 'diamond', label: 'Diamante' },
  ],
  eyeShape: [
    { value: 'almond', label: 'Almendra' },
    { value: 'round', label: 'Redondos' },
    { value: 'hooded', label: 'Caídos' },
    { value: 'monolid', label: 'Monopárpado' },
    { value: 'upturned', label: 'Rasgados' },
  ],
  eyeColor: [
    { value: 'dark_brown', label: 'Café oscuro' },
    { value: 'brown', label: 'Café' },
    { value: 'hazel', label: 'Avellana' },
    { value: 'green', label: 'Verde' },
    { value: 'blue', label: 'Azul' },
    { value: 'gray', label: 'Gris' },
  ],
  noseShape: [
    { value: 'straight', label: 'Recto' },
    { value: 'button', label: 'Respingado' },
    { value: 'wide', label: 'Ancho' },
    { value: 'narrow', label: 'Estrecho' },
    { value: 'upturned', label: 'Levantado' },
  ],
  lips: [
    { value: 'thin', label: 'Finos' },
    { value: 'medium', label: 'Medianos' },
    { value: 'full', label: 'Gruesos' },
    { value: 'wide', label: 'Anchos' },
  ],
  eyebrows: [
    { value: 'thin', label: 'Finas' },
    { value: 'medium', label: 'Medianas' },
    { value: 'thick', label: 'Gruesas' },
    { value: 'arched', label: 'Arqueadas' },
    { value: 'straight', label: 'Rectas' },
  ],
};

const HAIR_BODY_OPTIONS = {
  hairLength: [
    { value: 'pixie', label: 'Pixie' },
    { value: 'short', label: 'Corto' },
    { value: 'shoulder', label: 'A los hombros' },
    { value: 'long', label: 'Largo' },
    { value: 'extra_long', label: 'Muy largo' },
  ],
  hairStyle: [
    { value: 'straight', label: 'Liso' },
    { value: 'wavy', label: 'Ondulado' },
    { value: 'curly', label: 'Rizado' },
    { value: 'coily', label: 'Crespo' },
    { value: 'braided', label: 'Trenzado' },
    { value: 'bun', label: 'Moño' },
    { value: 'ponytail', label: 'Coleta' },
  ],
  hairColor: [
    { value: 'black', label: 'Negro' },
    { value: 'dark_brown', label: 'Castaño oscuro' },
    { value: 'brown', label: 'Castaño' },
    { value: 'light_brown', label: 'Castaño claro' },
    { value: 'blonde', label: 'Rubio' },
    { value: 'platinum', label: 'Platino' },
    { value: 'red', label: 'Rojo' },
    { value: 'auburn', label: 'Cobrizo' },
  ],
  bodyType: [
    { value: 'slim', label: 'Delgada' },
    { value: 'athletic', label: 'Atlética' },
    { value: 'curvy', label: 'Curvilínea' },
    { value: 'petite', label: 'Pequeña' },
    { value: 'plus_size', label: 'Plus size' },
  ],
  height: [
    { value: 'petite', label: 'Baja' },
    { value: 'average', label: 'Media' },
    { value: 'tall', label: 'Alta' },
  ],
};

const STYLE_OPTIONS = {
  fashionStyle: [
    { value: 'casual', label: 'Casual' },
    { value: 'elegant', label: 'Elegante' },
    { value: 'sporty', label: 'Deportivo' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'bohemian', label: 'Bohemio' },
    { value: 'professional', label: 'Profesional' },
  ],
  makeupLevel: [
    { value: 'none', label: 'Sin maquillaje' },
    { value: 'natural', label: 'Natural' },
    { value: 'glam', label: 'Glamuroso' },
    { value: 'artistic', label: 'Artístico' },
  ],
  lighting: [
    { value: 'natural', label: 'Natural' },
    { value: 'studio', label: 'Estudio' },
    { value: 'golden_hour', label: 'Hora dorada' },
    { value: 'dramatic', label: 'Dramático' },
    { value: 'soft', label: 'Suave' },
  ],
  artStyle: [
    { value: 'photorealistic', label: 'Fotorrealista' },
    { value: 'cinematic', label: 'Cinematográfico' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'anime', label: 'Anime' },
  ],
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                done
                  ? 'bg-purple-600 text-white'
                  : active
                    ? 'border-2 border-purple-500 text-purple-400'
                    : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {done ? '✓' : idx}
            </div>
            <span
              className={`text-sm hidden sm:block ${active ? 'text-white' : done ? 'text-purple-400' : 'text-zinc-500'}`}
            >
              {label}
            </span>
            {idx < total && <div className="w-8 h-px bg-zinc-700 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

function AvatarRefCard({ data }: { data: AvatarRef }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <img
        src={data.imageUrl}
        alt={REF_LABELS[data.kind] ?? data.kind}
        className="w-full aspect-square object-cover"
      />
      <p className="text-xs text-zinc-400 text-center py-2">{REF_LABELS[data.kind] ?? data.kind}</p>
    </div>
  );
}

function ProcessingScreen({ status }: { status: string | null }) {
  const msgs: Record<string, string> = {
    PENDING: 'Iniciando generación...',
    PROCESSING: 'Creando tu avatar y referencias visuales...',
  };
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Generando Avatar Pack</p>
        <p className="text-zinc-400 text-sm mt-1">{msgs[status ?? 'PENDING'] ?? 'Procesando...'}</p>
        <p className="text-zinc-500 text-xs mt-3">Este proceso puede tomar 2-3 minutos</p>
      </div>
    </div>
  );
}

export default function Avatar() {
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const {
    step,
    options,
    activePreset,
    loading,
    jobStatus,
    avatar,
    error,
    setStep,
    setOption,
    applyPreset,
    createPack,
    resetCreator,
  } = useAvatarCreator();

  const opt =
    <K extends keyof AvatarOptions>(key: K) =>
    (value: AvatarOptions[K]) =>
      setOption(key, value);

  if (loading || jobStatus === 'PENDING' || jobStatus === 'PROCESSING') {
    return (
      <div className="min-h-screen bg-black text-white">
        <PageHeader title="Avatar Creator" credits={user?.credits} backTo="/dashboard" />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <ProcessingScreen status={jobStatus} />
        </main>
      </div>
    );
  }

  if (avatar) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PageHeader title="Avatar Creator" credits={user?.credits} backTo="/dashboard" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎭</div>
            <h2 className="text-2xl font-bold mb-2">¡Tu Avatar Pack está listo!</h2>
            <p className="text-zinc-400">
              6 referencias visuales generadas con consistencia de identidad.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {avatar.avatarRefs.map((avatarRef) => (
              <AvatarRefCard key={avatarRef.id} data={avatarRef} />
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetCreator}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition"
            >
              Crear nuevo avatar
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition"
            >
              Usar mi avatar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Avatar Creator" credits={user?.credits} backTo="/dashboard" />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Crea tu personaje</h2>
          <p className="text-zinc-400 text-sm">
            Elige un preset para empezar rápido, o personaliza cada detalle tú mismo.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setMode('presets')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              mode === 'presets' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Presets rápidos
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              mode === 'custom' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Personalizar
          </button>
        </div>

        {mode === 'presets' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {PERSONALITY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition ${
                    activePreset === preset.id
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-4xl shrink-0">{preset.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{preset.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {PRESET_DESCRIPTIONS[preset.id]}
                    </p>
                  </div>
                  {activePreset === preset.id && (
                    <span className="ml-auto shrink-0 text-purple-400 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createPack}
              disabled={!activePreset || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition"
            >
              Generar Avatar Pack — 15 créditos
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Partir de un preset
              </p>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition ${
                      activePreset === preset.id
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <StepIndicator current={step} total={STEPS.length} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold mb-5">Identidad</h3>
                  <ChipSelector options={IDENTITY_OPTIONS.gender} value={options.gender} onChange={opt('gender')} label="Presentación de género" />
                  <ChipSelector options={IDENTITY_OPTIONS.age} value={options.age} onChange={opt('age')} label="Edad" />
                  <ChipSelector options={IDENTITY_OPTIONS.ethnicity} value={options.ethnicity} onChange={opt('ethnicity')} label="Etnicidad" />
                  <ChipSelector options={IDENTITY_OPTIONS.skinTone} value={options.skinTone} onChange={opt('skinTone')} label="Tono de piel" />
                </>
              )}
              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold mb-5">Rasgos faciales</h3>
                  <ChipSelector options={FACE_OPTIONS.faceShape} value={options.faceShape} onChange={opt('faceShape')} label="Forma de cara" />
                  <ChipSelector options={FACE_OPTIONS.eyeShape} value={options.eyeShape} onChange={opt('eyeShape')} label="Forma de ojos" />
                  <ChipSelector options={FACE_OPTIONS.eyeColor} value={options.eyeColor} onChange={opt('eyeColor')} label="Color de ojos" />
                  <ChipSelector options={FACE_OPTIONS.noseShape} value={options.noseShape} onChange={opt('noseShape')} label="Nariz" />
                  <ChipSelector options={FACE_OPTIONS.lips} value={options.lips} onChange={opt('lips')} label="Labios" />
                  <ChipSelector options={FACE_OPTIONS.eyebrows} value={options.eyebrows} onChange={opt('eyebrows')} label="Cejas" />
                </>
              )}
              {step === 3 && (
                <>
                  <h3 className="text-lg font-semibold mb-5">Cabello y cuerpo</h3>
                  <ChipSelector options={HAIR_BODY_OPTIONS.hairLength} value={options.hairLength} onChange={opt('hairLength')} label="Largo de cabello" />
                  <ChipSelector options={HAIR_BODY_OPTIONS.hairStyle} value={options.hairStyle} onChange={opt('hairStyle')} label="Estilo de cabello" />
                  <ChipSelector options={HAIR_BODY_OPTIONS.hairColor} value={options.hairColor} onChange={opt('hairColor')} label="Color de cabello" />
                  <Toggle label="Flequillo" value={options.hasBangs} onChange={opt('hasBangs')} />
                  <ChipSelector options={HAIR_BODY_OPTIONS.bodyType} value={options.bodyType} onChange={opt('bodyType')} label="Tipo de cuerpo" />
                  <ChipSelector options={HAIR_BODY_OPTIONS.height} value={options.height} onChange={opt('height')} label="Altura" />
                </>
              )}
              {step === 4 && (
                <>
                  <h3 className="text-lg font-semibold mb-5">Estilo y estética</h3>
                  <ChipSelector options={STYLE_OPTIONS.fashionStyle} value={options.fashionStyle} onChange={opt('fashionStyle')} label="Estilo de moda" />
                  <ChipSelector options={STYLE_OPTIONS.makeupLevel} value={options.makeupLevel} onChange={opt('makeupLevel')} label="Maquillaje" />
                  <ChipSelector options={STYLE_OPTIONS.lighting} value={options.lighting} onChange={opt('lighting')} label="Iluminación" />
                  <ChipSelector options={STYLE_OPTIONS.artStyle} value={options.artStyle} onChange={opt('artStyle')} label="Estilo visual" />
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition"
              >
                Anterior
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={createPack}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition"
                >
                  Generar Avatar Pack — 15 créditos
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
