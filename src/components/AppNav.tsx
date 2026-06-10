'use client';

import { Bike, ClipboardList, Home, MapPinned, PackageCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoModePill } from './DemoModePill';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/order', label: 'Order', icon: ClipboardList },
  { href: '/fc', label: 'FC', icon: PackageCheck },
  { href: '/driver', label: 'Driver', icon: Bike },
  { href: '/quote/demo-1001', label: 'Quote', icon: Sparkles },
  { href: '/track/demo-1002', label: 'Track', icon: MapPinned },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#eadfce] bg-[#fff8ec]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241124] text-sm font-black text-[#f1c979]">
              D5
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-[#241124]">Doorin5</span>
              <span className="block text-xs font-bold uppercase tracking-wide text-[#726456]">Local errands, properly handled</span>
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
                  active ? 'bg-[#e7f3ed] text-[#0f6b4f]' : 'text-[#5f5260] hover:bg-white hover:text-[#241124]'
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
