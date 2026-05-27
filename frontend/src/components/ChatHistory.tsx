'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, MessageSquare, Plus, Trash2,
  Clock, BookOpen,
} from 'lucide-react';

const CNS = {
  navy: '#1B3A5C', navyDark: '#0F2640', navyLight: '#2A5180',
  gold: '#8B6914', red: '#8C1B2E',
  paper: '#FAFAF8', cream: '#F5F3EE', sand: '#EDE8DD',
  ink: '#2C2C2C', inkLight: '#6B6B6B', inkMuted: '#99958D',
  border: '#D4CFC4',
};

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'chat_conversations';
const ACTIVE_KEY = 'chat_active_id';

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

export function getActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

interface Props {
  onNew: () => void;
  onLoad: (conv: Conversation) => void;
  activeId: string | null;
  messagesCount: number;
}

export default function ChatHistory({ onNew, onLoad, activeId, messagesCount }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  // 外部刷新时重新加载
  const refresh = useCallback(() => {
    setConversations(loadConversations());
  }, []);

  // 暴露 refresh 方法
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('chat-history-refresh', handler);
    return () => window.removeEventListener('chat-history-refresh', handler);
  }, [refresh]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    saveConversations(updated);
    setConversations(updated);
    if (activeId === id) {
      setActiveId('');
      onNew();
    }
  };

  const handleNew = () => {
    onNew();
    refresh();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (collapsed) {
    return (
      <aside className="h-screen flex flex-col items-center py-4 border-r z-20 transition-all duration-300"
        style={{ width: 48, backgroundColor: CNS.navyDark, borderColor: CNS.navy }}>
        <button onClick={() => setCollapsed(false)} className="p-1.5 rounded hover:opacity-80" style={{ color: CNS.sand }} title="展开">
          <ChevronRight size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="h-screen overflow-y-auto flex-shrink-0 border-r z-20 transition-all duration-300 flex flex-col"
      style={{ width: 260, backgroundColor: CNS.navyDark, borderColor: CNS.navy }}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: CNS.navy, backgroundColor: CNS.navyDark }}>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: CNS.gold }} />
          <span className="text-sm font-bold tracking-wide" style={{ color: CNS.paper }}>对话记录</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 rounded hover:opacity-80" style={{ color: CNS.sand }}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* 新建按钮 */}
      <div className="px-3 pt-3">
        <button onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: CNS.navy, color: CNS.paper, border: `1px solid ${CNS.navyLight}` }}>
          <Plus size={14} />新建对话
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {conversations.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: CNS.inkMuted }}>
            <Clock size={24} className="mx-auto mb-2 opacity-30" />
            暂无历史对话
          </p>
        ) : (
          conversations
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map(conv => (
              <div key={conv.id}
                onClick={() => { setActiveId(conv.id); onLoad(conv); }}
                className="group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: activeId === conv.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: activeId === conv.id ? `1px solid ${CNS.navyLight}` : '1px solid transparent',
                }}>
                <MessageSquare size={14} className="mt-0.5 flex-shrink-0"
                  style={{ color: activeId === conv.id ? CNS.gold : CNS.inkMuted }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: activeId === conv.id ? CNS.paper : CNS.sand }}>
                    {conv.title || '新对话'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: CNS.inkMuted }}>
                    {formatTime(conv.updatedAt)} · {conv.messages.filter(m => m.role !== 'system').length} 条
                  </div>
                </div>
                <button onClick={(e) => handleDelete(conv.id, e)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100 flex-shrink-0"
                  style={{ color: CNS.red }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))
        )}
      </div>

      {/* 底部信息 */}
      <div className="px-4 py-3 border-t text-xs text-center" style={{ borderColor: CNS.navy, color: CNS.inkMuted }}>
        {conversations.length} 个对话
      </div>
    </aside>
  );
}
