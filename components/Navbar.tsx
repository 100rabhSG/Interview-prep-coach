'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2 } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/practice', label: 'Practice' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-8">
          <Code2 className="h-6 w-6" />
          <span>Prep Coach</span>
        </Link>

        <nav className="flex items-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                pathname === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AuthButton />
      </div>
    </header>
  );
}
