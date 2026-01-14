import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, signOut } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Award,
  LayoutDashboard,
  Trophy,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin', label: 'Panou principal', icon: LayoutDashboard, exact: true },
  { href: '/admin/concursuri', label: 'Concursuri', icon: Trophy },
  { href: '/admin/utilizatori', label: 'Utilizatori', icon: Users },
];

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('V-ați deconectat cu succes.');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Eroare la deconectare.');
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-3">
              <Award className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h1 className="font-serif font-bold text-lg">Concursuri ICMPP</h1>
                <p className="text-xs text-sidebar-foreground/70">Administrare</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive(item.href, item.exact) && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60">Administrator</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Deconectare
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-card border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Vezi site public →
          </Link>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex bg-card border-b px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {navItems.find(item => isActive(item.href, item.exact))?.label || 'Panou'}
            </span>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Vezi site public →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
