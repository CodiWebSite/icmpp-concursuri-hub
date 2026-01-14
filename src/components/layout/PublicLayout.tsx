import { Outlet, useSearchParams } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === '1';

  if (isEmbed) {
    return (
      <div className="embed-mode min-h-screen">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
