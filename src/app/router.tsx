import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RouteErrorBoundary } from '../components/layout/RouteErrorBoundary';
import { ApiCatalogPage } from '../pages/ApiCatalog';
import { FactoryPage } from '../pages/Factory';
import { OverviewPage } from '../pages/Overview';
import { PipelinePage } from '../pages/Pipeline';
import { PowerGridPage } from '../pages/PowerGrid';
import { RailPage } from '../pages/Rail';
import { RawSnapshotPage } from '../pages/RawSnapshot';
import { SecurityPage } from '../pages/Security';

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
      { path: 'rail', element: <RailPage /> },
      { path: 'security', element: <SecurityPage /> },
      { path: 'pipeline', element: <PipelinePage /> },
      { path: 'raw', element: <RawSnapshotPage /> },
      { path: 'catalog', element: <ApiCatalogPage /> }
    ]
  }
]);
