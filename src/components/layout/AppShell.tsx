import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitleMap: Record<string, string> = {
  '/overview': 'Overview',
  '/powergrid': 'PowerGrid',
  '/factory': 'Factory',
  '/rail': 'Rail',
  '/security': 'Cyber-Physical Integrity',
  '/pipeline': 'Pipeline Health',
  '/raw': 'Raw Telemetry',
  '/catalog': 'API Catalog'
};

export const AppShell = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const pageTitle = pageTitleMap[location.pathname] ?? 'Overview';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-[1880px]">
        <Sidebar />
        <main className="min-h-screen flex-1 px-4 pb-6 pt-4 sm:px-6">
          <Topbar theme={theme} onToggleTheme={toggleTheme} pageTitle={pageTitle} />
          <section className="mb-4 mt-5">
            <p className="subtle-label">DataProtect MES</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{pageTitle}</h1>
          </section>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
