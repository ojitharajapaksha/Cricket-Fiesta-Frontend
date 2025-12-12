'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirectIfNotAuthenticated, redirectIfNotRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'USER'>;
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated
    if (redirectIfNotAuthenticated()) {
      return;
    }

    // Check if has required role
    if (requiredRoles && redirectIfNotRole(...requiredRoles)) {
      return;
    }
  }, [requiredRoles, router]);

  return <>{children}</>;
}
