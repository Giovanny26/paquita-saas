import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  credits?: number;
  backTo?: string;
}

export function PageHeader({ title, credits, backTo }: PageHeaderProps) {
  return (
    <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      {backTo ? (
        <Link to={backTo} className="text-purple-400 hover:text-purple-300 text-sm transition">
          ← Volver
        </Link>
      ) : (
        <div />
      )}
      <h1 className="text-xl font-bold text-purple-400">{title}</h1>
      {credits !== undefined ? (
        <span className="text-zinc-400 text-sm">{credits} créditos</span>
      ) : (
        <div />
      )}
    </header>
  );
}
