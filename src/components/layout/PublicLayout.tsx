import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
