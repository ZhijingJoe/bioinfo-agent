'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { hasToken, auth, clearToken } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 认证页不需要守卫
    if (pathname.startsWith('/auth')) {
      setReady(true);
      return;
    }

    if (!hasToken()) {
      router.push('/auth');
      return;
    }

    // 验证 token 有效性
    auth.me()
      .then(() => setReady(true))
      .catch(() => {
        clearToken();
        router.push('/auth');
      });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3EE' }}>
        <p style={{ color: '#99958D' }}>加载中…</p>
      </div>
    );
  }

  return <>{children}</>;
}
