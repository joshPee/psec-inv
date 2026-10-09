'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { canAccessPage, type UserRole } from '@/lib/rbac';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  resourcePath: string;
}

export default function ProtectedPage({ children, requiredRole, resourcePath }: ProtectedPageProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          const role = data.role || 'Security Officer';
          setUserRole(role);
          
          const access = canAccessPage(role, resourcePath);
          setHasAccess(access);
          
          if (!access) {
            // Redirect to dashboard if no access
            router.push('/admin/dashboard');
          }
        } else {
          // Not authenticated
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [resourcePath, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg w-full text-left">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Required role:</span> {requiredRole || 'Higher privilege level'}</p>
                <p className="mt-0.5"><span className="font-medium text-slate-700 dark:text-slate-300">Your role:</span> {userRole}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}