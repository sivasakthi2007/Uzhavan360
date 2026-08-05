'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Leaf } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return;
    }
    if (!loading && !user) {
      router.replace('/signup');
    }
  }, [user, loading, router]);

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-8 h-8 text-primary-500 animate-spin" />
          <span className="text-xs font-bold text-earth-500 tracking-wider">VERIFYING OPERATOR DECK ACCESS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
