'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { auth, setToken } from '@/lib/api';

const CNS = {
  navy: '#1B3A5C', paper: '#FAFAF8', cream: '#F5F3EE',
  ink: '#2C2C2C', inkLight: '#6B6B6B', inkMuted: '#99958D',
  border: '#D4CFC4', red: '#8C1B2E', gold: '#8B6914',
};

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const prefilledCode = params.get('code') || '';

  const [code, setCode] = useState(prefilledCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.verify(email, code);
      setToken(res.token);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: '#16a34a' }} />
        <h2 className="text-lg font-bold" style={{ color: CNS.ink }}>验证成功</h2>
        <p className="text-sm" style={{ color: CNS.inkMuted }}>正在跳转…</p>
      </div>
    );
  }

  return (
    <>
      <GraduationCap size={40} className="mx-auto mb-3" style={{ color: CNS.navy }} />
      <h2 className="text-lg font-bold mb-1" style={{ color: CNS.ink, fontFamily: '"Noto Serif SC", serif' }}>
        验证邮箱
      </h2>
      <p className="text-sm mb-6" style={{ color: CNS.inkMuted }}>
        验证码已发送至 {email}
      </p>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded text-sm" style={{ backgroundColor: '#FEF2F2', color: CNS.red, border: '1px solid #FECACA' }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <input
          type="text"
          required
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="输入 6 位验证码"
          className="w-full py-2.5 px-4 rounded-lg text-center text-lg tracking-widest outline-none mb-4"
          style={{ backgroundColor: CNS.cream, color: CNS.ink, border: `1px solid ${CNS.border}` }}
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
          style={{ backgroundColor: CNS.navy, color: CNS.paper }}
        >
          {loading ? '验证中…' : '确认验证'}
        </button>
      </form>
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: CNS.cream }}>
      <div className="w-full max-w-sm rounded-xl p-6 shadow-lg text-center" style={{ backgroundColor: CNS.paper, border: `1px solid ${CNS.border}` }}>
        <Suspense fallback={<p style={{ color: CNS.inkMuted }}>加载中…</p>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
