import { useAuthStore } from '../store/authStore';
import { PageHeader } from '../components/PageHeader';
import { useAvatarCreator, PERSONALITY_PRESETS } from '../hooks/useAvatarCreator';
import type { AvatarOptions, AvatarRef } from '../types';

const REF_LABELS: Record<string, string> = {
  PRIMARY: 'Primary',
  FACE: 'Close-up',
  HALF_BODY: 'Half Body',
  FULL_BODY: 'Full Body',
  THREE_QUARTER: 'Three Quarter',
  PROFILE: 'Profile',
};

const STEPS = ['Identity', 'Face', 'Hair & Body', 'Style'];

// Generic chip selector
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
    { value: 'feminine', label: 'Feminine' },
    { value: 'masculine', label: 'Masculine' },
    { value: 'androgynous', label: 'Androgynous' },
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
    { value: 'caucasian', label: 'Caucasian' },
    { value: 'asian', label: 'Asian' },
    { value: 'african', label: 'African' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'mixed', label: 'Mixed' },
  ],
  skinTone: [
    { value: 'very_light', label: 'Very Light' },
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'tan', label: 'Tan' },
    { value: 'dark', label: 'Dark' },
    { value: 'very_dark', label: 'Very Dark' },
  ],
};

const FACE_OPTIONS = {
  faceShape: [
    { value: 'oval', label: 'Oval' },
    { value: 'round', label: 'Round' },
    { value: 'square', label: 'Square' },
    { value: 'heart', label: 'Heart' },
    { value: 'diamond', label: 'Diamond' },
  ],
  eyeShape: [
    { value: 'almond', label: 'Almond' },
    { value: 'round', label: 'Round' },
    { value: 'hooded', label: 'Hooded' },
    { value: 'monolid', label: 'Monolid' },
    { value: 'upturned', label: 'Upturned' },
  ],
  eyeColor: [
    { value: 'dark_brown', label: 'Dark Brown' },
    { value: 'brown', label: 'Brown' },
    { value: 'hazel', label: 'Hazel' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'gray', label: 'Gray' },
  ],
  noseShape: [
    { value: 'straight', label: 'Straight' },
    { value: 'button', label: 'Button' },
    { value: 'wide', label: 'Wide' },
    { value: 'narrow', label: 'Narrow' },
    { value: 'upturned', label: 'Upturned' },
  ],
  lips: [
    { value: 'thin', label: 'Thin' },
    { value: 'medium', label: 'Medium' },
    { value: 'full', label: 'Full' },
    { value: 'wide', label: 'Wide' },
  ],
  eyebrows: [
    { value: 'thin', label: 'Thin' },
    { value: 'medium', label: 'Medium' },
    { value: 'thick', label: 'Thick' },
    { value: 'arched', label: 'Arched' },
    { value: 'straight', label: 'Straight' },
  ],
};

const HAIR_BODY_OPTIONS = {
  hairLength: [
    { value: 'pixie', label: 'Pixie' },
    { value: 'short', label: 'Short' },
    { value: 'shoulder', label: 'Shoulder' },
    { value: 'long', label: 'Long' },
    { value: 'extra_long', label: 'Extra Long' },
  ],
  hairStyle: [
    { value: 'straight', label: 'Straight' },
    { value: 'wavy', label: 'Wavy' },
    { value: 'curly', label: 'Curly' },
    { value: 'coily', label: 'Coily' },
    { value: 'braided', label: 'Braided' },
    { value: 'bun', label: 'Bun' },
    { value: 'ponytail', label: 'Ponytail' },
  ],
  hairColor: [
    { value: 'black', label: 'Black' },
    { value: 'dark_brown', label: 'Dark Brown' },
    { value: 'brown', label: 'Brown' },
    { value: 'light_brown', label: 'Light Brown' },
    { value: 'blonde', label: 'Blonde' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'red', label: 'Red' },
    { value: 'auburn', label: 'Auburn' },
  ],
  bodyType: [
    { value: 'slim', label: 'Slim' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'curvy', label: 'Curvy' },
    { value: 'petite', label: 'Petite' },
    { value: 'plus_size', label: 'Plus Size' },
  ],
  height: [
    { value: 'petite', label: 'Petite' },
    { value: 'average', label: 'Average' },
    { value: 'tall', label: 'Tall' },
  ],
};

const STYLE_OPTIONS = {
  fashionStyle: [
    { value: 'casual', label: 'Casual' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'sporty', label: 'Sporty' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'bohemian', label: 'Bohemian' },
    { value: 'professional', label: 'Professional' },
  ],
  makeupLevel: [
    { value: 'none', label: 'No Makeup' },
    { value: 'natural', label: 'Natural' },
    { value: 'glam', label: 'Glam' },
    { value: 'artistic', label: 'Artistic' },
  ],
  lighting: [
    { value: 'natural', label: 'Natural' },
    { value: 'studio', label: 'Studio' },
    { value: 'golden_hour', label: 'Golden Hour' },
    { value: 'dramatic', label: 'Dramatic' },
    { value: 'soft', label: 'Soft' },
  ],
  artStyle: [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'cinematic', label: 'Cinematic' },
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
      <p className="text-xs text-zinc-400 text-center py-2">
        {REF_LABELS[data.kind] ?? data.kind}
      </p>
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
        {/* Presets */}
        <div className="mb-8">
          <p className="text-sm text-zinc-400 mb-3">
            Quick start — choose a preset or customize below
          </p>
          <div className="flex flex-wrap gap-3">
            {PERSONALITY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition ${
                  activePreset === preset.id
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
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
              <h3 className="text-lg font-semibold mb-5">Identity</h3>
              <ChipSelector
                options={IDENTITY_OPTIONS.gender}
                value={options.gender}
                onChange={opt('gender')}
                label="Gender Presentation"
              />
              <ChipSelector
                options={IDENTITY_OPTIONS.age}
                value={options.age}
                onChange={opt('age')}
                label="Age"
              />
              <ChipSelector
                options={IDENTITY_OPTIONS.ethnicity}
                value={options.ethnicity}
                onChange={opt('ethnicity')}
                label="Ethnicity"
              />
              <ChipSelector
                options={IDENTITY_OPTIONS.skinTone}
                value={options.skinTone}
                onChange={opt('skinTone')}
                label="Skin Tone"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-lg font-semibold mb-5">Facial Features</h3>
              <ChipSelector
                options={FACE_OPTIONS.faceShape}
                value={options.faceShape}
                onChange={opt('faceShape')}
                label="Face Shape"
              />
              <ChipSelector
                options={FACE_OPTIONS.eyeShape}
                value={options.eyeShape}
                onChange={opt('eyeShape')}
                label="Eye Shape"
              />
              <ChipSelector
                options={FACE_OPTIONS.eyeColor}
                value={options.eyeColor}
                onChange={opt('eyeColor')}
                label="Eye Color"
              />
              <ChipSelector
                options={FACE_OPTIONS.noseShape}
                value={options.noseShape}
                onChange={opt('noseShape')}
                label="Nose"
              />
              <ChipSelector
                options={FACE_OPTIONS.lips}
                value={options.lips}
                onChange={opt('lips')}
                label="Lips"
              />
              <ChipSelector
                options={FACE_OPTIONS.eyebrows}
                value={options.eyebrows}
                onChange={opt('eyebrows')}
                label="Eyebrows"
              />
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-lg font-semibold mb-5">Hair & Body</h3>
              <ChipSelector
                options={HAIR_BODY_OPTIONS.hairLength}
                value={options.hairLength}
                onChange={opt('hairLength')}
                label="Hair Length"
              />
              <ChipSelector
                options={HAIR_BODY_OPTIONS.hairStyle}
                value={options.hairStyle}
                onChange={opt('hairStyle')}
                label="Hair Style"
              />
              <ChipSelector
                options={HAIR_BODY_OPTIONS.hairColor}
                value={options.hairColor}
                onChange={opt('hairColor')}
                label="Hair Color"
              />
              <Toggle label="Bangs" value={options.hasBangs} onChange={opt('hasBangs')} />
              <ChipSelector
                options={HAIR_BODY_OPTIONS.bodyType}
                value={options.bodyType}
                onChange={opt('bodyType')}
                label="Body Type"
              />
              <ChipSelector
                options={HAIR_BODY_OPTIONS.height}
                value={options.height}
                onChange={opt('height')}
                label="Height"
              />
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-lg font-semibold mb-5">Style & Aesthetic</h3>
              <ChipSelector
                options={STYLE_OPTIONS.fashionStyle}
                value={options.fashionStyle}
                onChange={opt('fashionStyle')}
                label="Fashion Style"
              />
              <ChipSelector
                options={STYLE_OPTIONS.makeupLevel}
                value={options.makeupLevel}
                onChange={opt('makeupLevel')}
                label="Makeup"
              />
              <ChipSelector
                options={STYLE_OPTIONS.lighting}
                value={options.lighting}
                onChange={opt('lighting')}
                label="Lighting"
              />
              <ChipSelector
                options={STYLE_OPTIONS.artStyle}
                value={options.artStyle}
                onChange={opt('artStyle')}
                label="Art Style"
              />
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
      </main>
    </div>
  );
}
