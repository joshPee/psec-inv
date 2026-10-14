'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) {
      return items;
    }

    const isAdmin = pathname.startsWith('/admin');
    const homeHref = isAdmin ? '/admin/dashboard' : '/dashboard';

    if (pathname === homeHref) {
      return [{ label: 'Dashboard', href: homeHref }];
    }

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: homeHref }
    ];

    segments.forEach((segment, index) => {
      if (segment === 'admin' && isAdmin) return;
      
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

  if (pathname === '/admin/login' || pathname === '/login') {
    return null;
  }

  const rootHref = pathname.startsWith('/admin') ? '/admin/dashboard' : '/dashboard';

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4", className)}>
      <Link
        href={rootHref}
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Dashboard"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={item.href || item.label + index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-200 py-1 px-1.5 truncate max-w-[240px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

