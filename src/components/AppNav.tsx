'use client';

import { Bike, ClipboardList, Home, MapPinned, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoModePill } from './DemoModePill';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/order', label: 'Order', icon: ClipboardList },
  { href: '/fc', label: 'FC', icon: PackageCheck },
  { href: '/driver', label: 'Driver', icon: Bike },
  { href: '/track/demo-1002', label: 'Track', icon: MapPinned },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
              D5
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-slate-950">Doorin5</span>
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tunbridge Wells</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pb-1 lg:justify-center lg:pb-0">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('/demo')[0]));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                  active ? 'bg-emerald-100 text-emerald-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <DemoModePill label="Local demo" />
        </div>
      </nav>
    </header>
  );
}
