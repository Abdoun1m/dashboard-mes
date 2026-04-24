import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useDataMode } from '../../hooks/useDataMode';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitleMap: Record<string, string> = {
  '/overview': 'Vue globale',
  '/powergrid': 'Réseau électrique',
  '/factory': 'Usine',
  '/railauto': 'RailAuto',
  '/alerts': 'Alertes',
  '/admin': 'Administration'
};

export const AppShell = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode } = useDataMode();
  const pageTitle = pageTitleMap[location.pathname] ?? 'Vue globale';

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark">
      <div className="mx-auto flex max-w-[1800px]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-4 sm:p-6">
          <Topbar theme={theme} onToggleTheme={toggleTheme} dataMode={mode} onToggleDataMode={toggleMode} />
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-5">
              <p className="subtle-label">DataProtect MES</p>
              <h1 className="mt-1 text-3xl font-semibold">{pageTitle}</h1>
            </section>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
