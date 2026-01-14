import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

export function PublicHeader() {
  return (
    <header className="page-header institutional-header py-6 shadow-sm">
      <div className="container">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Award className="h-8 w-8" />
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold">
              Concursuri ICMPP
            </h1>
            <p className="text-sm opacity-90 hidden sm:block">
              Institutul de Chimie Macromoleculară „Petru Poni" Iași
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
