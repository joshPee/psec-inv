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
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Lock className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-sm text-gray-500 mb-4">
              You don't have permission to access this page.
            </p>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Required role: {requiredRole || 'Higher privilege level'}<br />
                Your role: {userRole}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}