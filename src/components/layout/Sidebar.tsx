import {
  Activity,
  Bolt,
  Factory,
  LayoutDashboard,
  ListTree,
  Shield,
  TramFront,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  theme: 'light' | 'dark';
}

const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/powergrid', label: 'PowerGrid', icon: Bolt },
  { to: '/factory', label: 'Factory' , icon: Factory },
  { to: '/rail', label: 'Rail', icon: TramFront },
  { to: '/security', label: 'Cyber-Physical Integrity', icon: Shield },
  { to: '/pipeline', label: 'Pipeline Health', icon: Activity },
  { to: '/raw', label: 'Raw Telemetry', icon: ListTree },
  { to: '/catalog', label: 'API Catalog', icon: ListTree },
];

export const Sidebar = ({ theme }: SidebarProps) => {
  const logoSrc =
    theme === 'dark'
      ? '/dataprotect_mes_logo_dark.png'
      : '/dataprotect_mes_logo.png';

  return (
    <aside className="sticky top-0 hidden h-screen w-[270px] flex-col border-r border-zinc-200 bg-white px-5 py-6 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="subtle-label">DataProtect MES</p>

        <div className="mt-3 rounded-md border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <img
            src={logoSrc}
            alt="DataProtect MES"
            className="h-9 w-full rounded-md object-contain"
          />
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs uppercase tracking-[0.12em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        OT · DMZ · IT Secure Bridge
      </div>
    </aside>
  );
};