'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === '/admin/dashboard') {
      return [{ label: 'Dashboard', href: '/admin/dashboard' }];
    }

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/admin/dashboard' }
    ];

    segments.forEach((segment, index) => {
      if (segment === 'admin') return;
      
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (pathname === '/admin/login') {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/admin/dashboard"
        className="hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.slice(1).map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground transition-colors",
                index === breadcrumbs.length - 2 && "text-foreground font-medium"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
