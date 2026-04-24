import { Menu, Moon, Sun, Wifi } from 'lucide-react';
import type { DataSourceMode } from '../../services/mesService';

interface TopbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  dataMode: DataSourceMode;
  onToggleDataMode: () => void;
}

export const Topbar = ({ theme, onToggleTheme, dataMode, onToggleDataMode }: TopbarProps) => (
  <header className="sticky top-0 z-30 mb-6 flex h-16 items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/85 px-4 shadow-soft backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-6">
    <div className="flex items-center gap-3">
      <button className="rounded-xl border border-zinc-200 p-2 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300 lg:hidden" aria-label="menu">
        <Menu size={18} />
      </button>
      {theme === 'light' ? (
  <img src="/dataprotect_mes_logo.png" alt="DataProtect MES" className="hidden h-8 w-20 rounded-md object-contain sm:block" />
      ) : (
        <img
          src="/dataprotect_mes_logo_dark.png"
          alt="DataProtect MES"
          className="hidden h-8 w-20 rounded-md object-contain sm:block"
        />
      )}
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">DataProtect MES</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Plateforme d'intelligence industrielle exécutive</p>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
      {import.meta.env.DEV ? (
        <button
          onClick={onToggleDataMode}
          className="hidden rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-200 dark:hover:bg-brand-900/45 sm:inline-flex"
        >
          DEV · {dataMode === 'live' ? 'API LIVE' : 'MOCK'}
        </button>
      ) : null}
      <span className="hidden items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:inline-flex">
        <Wifi size={13} />
        Liaison sécurisée active
      </span>
      <button
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        {theme === 'light' ? 'Sombre' : 'Clair'}
      </button>
    </div>
  </header>
);
