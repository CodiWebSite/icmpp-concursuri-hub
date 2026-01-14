import { Outlet } from 'react-router-dom';

export function EmbedLayout() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <Outlet />
    </div>
  );
}
