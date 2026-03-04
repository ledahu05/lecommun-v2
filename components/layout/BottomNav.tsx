'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, ArrowLeftRight, Clock } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/depenses', label: 'Depenses', icon: Receipt },
  { href: '/ajustements', label: 'Ajustements', icon: ArrowLeftRight },
  { href: '/historique', label: 'Historique', icon: Clock },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50">
      <div className="grid grid-cols-4 h-full">
        {links.map(({ href, label, icon: Icon }) => {
          // Exact match pour /, startsWith pour les sous-routes
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 text-xs min-h-[48px] transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
