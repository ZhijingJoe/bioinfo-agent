'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { auth, setToken, ApiError } from '@/lib/api';

const CNS = {
  navy: '#1B3A5C',
  navyDark: '#0F2640',
  gold: '#8B6914',
  paper: '#FAFAF8',
  cream: '#F5F3EE',
  ink: '#2C2C2C',
  inkLight: '#6B6B6B',
  inkMuted: '#99958D',
  border: '#D4CFC4',
  red: '#8C1B2E',
};

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugCode, setDebugCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      setToken(res.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register(email, password, nickname);
      if (res.debug_code) {
        setDebugCode(res.debug_code);
        // 跳转到验证页
        router.push(`/auth/verify?email=${encodeURIComponent(email)}&code=${res.debug_code}`);
      } else {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err.message || '注册失败');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: CNS.cream }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <GraduationCap size={48} className="mx-auto mb-3" style={{ color: CNS.navy }} />
          <h1 className="text-2xl font-bold m-0" style={{ color: CNS.navy, fontFamily: '"Noto Serif SC", serif' }}>
            生信助理
          </h1>
          <p className="text-sm mt-1" style={{ color: CNS.inkMuted }}>Agent 让科研更高效</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex mb-6 rounded-lg overflow-hidden" style={{ border: `1px solid ${CNS.border}` }}>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className="flex-1 py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === 'login' ? CNS.navy : CNS.paper,
              color: tab === 'login' ? CNS.paper : CNS.inkLight,
            }}
          >
            登录
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className="flex-1 py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === 'register' ? CNS.navy : CNS.paper,
              color: tab === 'register' ? CNS.paper : CNS.inkLight,
            }}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: CNS.paper, border: `1px solid ${CNS.border}` }}>
          {error && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded text-sm" style={{ backgroundColor: '#FEF2F2', color: CNS.red, border: '1px solid #FECACA' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
            {tab === 'register' && (
              <div className="mb-4">
                <label className="text-xs font-medium mb-1 block" style={{ color: CNS.inkLight }}>昵称</label>
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${CNS.border}` }}>
                  <span className="px-3" style={{ color: CNS.inkMuted }}><User size={16} /></span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="可选"
                    className="flex-1 py-2.5 px-2 outline-none text-sm"
                    style={{ backgroundColor: CNS.cream, color: CNS.ink }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-medium mb-1 block" style={{ color: CNS.inkLight }}>邮箱</label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${CNS.border}` }}>
                <span className="px-3" style={{ color: CNS.inkMuted }}><Mail size={16} /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 py-2.5 px-2 outline-none text-sm"
                  style={{ backgroundColor: CNS.cream, color: CNS.ink }}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium mb-1 block" style={{ color: CNS.inkLight }}>密码</label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${CNS.border}` }}>
                <span className="px-3" style={{ color: CNS.inkMuted }}><Lock size={16} /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className="flex-1 py-2.5 px-2 outline-none text-sm"
                  style={{ backgroundColor: CNS.cream, color: CNS.ink }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: CNS.navy, color: CNS.paper }}
            >
              {loading ? '处理中…' : (
                <>
                  {tab === 'login' ? '登录' : '注册'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: CNS.inkMuted }}>
            注册即享每日 {10} 次免费提问
          </p>
        </div>
      </div>
    </div>
  );
}
