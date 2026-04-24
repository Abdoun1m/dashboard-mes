import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

const getErrorMessage = (error: unknown): string => {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erreur applicative inattendue.';
};

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const message = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-mesh-light p-4 dark:bg-mesh-dark sm:p-6">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <section className="glass-card w-full rounded-3xl p-8 sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            <AlertTriangle size={26} />
          </div>

          <p className="subtle-label text-center">DataProtect MES</p>
          <h1 className="mt-2 text-center text-2xl font-semibold sm:text-3xl">Une erreur est survenue</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-300">{message}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <RotateCw size={15} />
              Recharger
            </button>

            <Link
              to="/overview"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Home size={15} />
              Retour à la vue globale
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
