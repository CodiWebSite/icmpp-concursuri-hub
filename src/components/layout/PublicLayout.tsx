import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
