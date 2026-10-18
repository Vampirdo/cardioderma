import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-brand-900/10 bg-white/80 py-2.5 pl-5 pr-2.5 shadow-sm backdrop-blur-md">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-900/75 md:flex">
          <a href="/#espaces" className="transition hover:text-brand-700">Espaces</a>
          <a href="/#etapes" className="transition hover:text-brand-700">Comment ça marche</a>
          <a href="/#fonctionnalites" className="transition hover:text-brand-700">Fonctionnalités</a>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-brand-900 transition hover:bg-brand-900/5"
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}