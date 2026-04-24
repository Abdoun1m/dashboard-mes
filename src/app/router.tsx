import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RouteErrorBoundary } from '../components/layout/RouteErrorBoundary';
import { AdminPage } from '../pages/AdminPage';
import { AlertsPage } from '../pages/AlertsPage';
import { FactoryPage } from '../pages/FactoryPage';
import { OverviewPage } from '../pages/OverviewPage';
import { PowerGridPage } from '../pages/PowerGridPage';
import { RailAutoPage } from '../pages/RailAutoPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'powergrid', element: <PowerGridPage /> },
      { path: 'factory', element: <FactoryPage /> },
      { path: 'railauto', element: <RailAutoPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'admin', element: <AdminPage /> }
    ]
  }
]);
