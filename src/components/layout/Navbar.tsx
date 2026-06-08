'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, BookOpen, Compass } from 'lucide-react';

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: '/', label: 'World', icon: MapPin },
    { href: '/trips', label: 'Trips', icon: Compass },
    { href: '/journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(251,251,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(232,230,225,0.6)' }}>
      <Link href="/" className="serif text-xl font-semibold tracking-tight text-[#1A1A1A]">
        Taste<span className="text-[#C87A53]">&</span>Terrain
      </Link>
      <nav className="flex items-center gap-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active ? 'text-[#C87A53]' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'}`}>
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87A53] to-[#A85E3A] flex items-center justify-center text-white text-xs font-semibold">
          Z
        </div>
      </div>
    </header>
  );
}
