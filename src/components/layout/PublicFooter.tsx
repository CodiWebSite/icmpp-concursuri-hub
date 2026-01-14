import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="page-footer bg-primary text-primary-foreground py-8 mt-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-serif font-semibold">
              Institutul de Chimie Macromoleculară „Petru Poni"
            </p>
            <p className="text-sm opacity-80">
              Aleea Grigore Ghica Vodă 41A, 700487 Iași, România
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="https://www.icmpp.ro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline opacity-80 hover:opacity-100 transition-opacity"
            >
              www.icmpp.ro
            </a>
            <Link 
              to="/admin" 
              className="hover:underline opacity-60 hover:opacity-100 transition-opacity"
            >
              Admin
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-primary-foreground/20 text-center text-sm opacity-60">
          © {new Date().getFullYear()} ICMPP. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
