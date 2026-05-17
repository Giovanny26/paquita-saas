interface NsfwToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function NsfwToggle({ value, onChange }: NsfwToggleProps) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-red-600' : 'bg-zinc-700'}`}
        aria-label={value ? 'Desactivar NSFW' : 'Activar NSFW'}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-zinc-400 text-sm">
        {value ? '🔞 Contenido NSFW' : '✨ Contenido SFW'}
      </span>
    </div>
  );
}
