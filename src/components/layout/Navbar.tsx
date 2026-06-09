'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Plane, BedDouble, Utensils } from 'lucide-react';

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: '/', label: 'World', icon: MapPin },
    { href: '/trips', label: 'Trips', icon: Plane },
    { href: '/restaurants', label: 'Restaurants', icon: Utensils },
    { href: '/hotels', label: 'Hotels', icon: BedDouble },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(251,251,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180,175,168,0.6)' }}>
      <Link href="/" className="serif text-xl font-semibold tracking-tight text-[#1A1A1A]">
        Taste<span className="text-[#C87A53]">&</span>Terrain
      </Link>
      <nav className="flex items-center gap-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active ? 'text-[#C87A53]' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'}`}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
