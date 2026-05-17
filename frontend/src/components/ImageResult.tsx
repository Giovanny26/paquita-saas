interface ImageResultProps {
  loading: boolean;
  imageUrl: string;
  loadingText?: string;
  emptyText?: string;
  className?: string;
}

export function ImageResult({
  loading,
  imageUrl,
  loadingText = 'Generando...',
  emptyText = 'La imagen aparecerá aquí',
  className = '',
}: ImageResultProps) {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-64 ${className}`}
    >
      {loading && (
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">{loadingText}</p>
        </div>
      )}
      {imageUrl && !loading && (
        <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
      )}
      {!imageUrl && !loading && (
        <p className="text-zinc-600 text-sm text-center px-4">{emptyText}</p>
      )}
    </div>
  );
}
