import { Bolt, Factory, LayoutDashboard, Siren, TramFront } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/overview', label: 'Vue globale', icon: LayoutDashboard },
  { to: '/powergrid', label: 'Réseau électrique', icon: Bolt },
  { to: '/factory', label: 'Usine', icon: Factory },
  { to: '/railauto', label: 'RailAuto', icon: TramFront },
  { to: '/alerts', label: 'Alertes', icon: Siren }
];

export const Sidebar = () => (
  <aside className="sticky top-0 hidden h-screen w-[260px] flex-col border-r border-zinc-200/70 bg-white/70 px-5 py-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:flex">
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 dark:border-brand-900 dark:from-brand-900/30 dark:to-zinc-900">
      <p className="subtle-label">DataProtect MES</p>
      <div className="mt-2 rounded-xl border border-brand-200 bg-white p-2 dark:hidden">
  <img src="/dataprotect_mes_logo.png" alt="DataProtect MES" className="h-10 w-full rounded-lg object-contain" />
      </div>
      <div className="mt-2 hidden rounded-xl border border-brand-700 bg-zinc-950 p-2 dark:block">
        <img
          src="/dataprotect_mes_logo_dark.png"
          alt="DataProtect MES"
          className="h-10 w-full rounded-lg object-contain"
        />
      </div>
    </div>

    <nav className="mt-8 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="mt-auto rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
      Pont OT / DMZ / IT sécurisé
    </div>
  </aside>
);
