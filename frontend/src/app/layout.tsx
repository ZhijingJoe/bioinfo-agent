import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: '生信助理 — Bioinformatics Assistant',
  description: '基于 DeepSeek V4 的生物信息学 AI 助手',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
