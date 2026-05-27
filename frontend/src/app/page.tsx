'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Trash2, GraduationCap, Sparkles, LogOut, CreditCard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clearToken, auth, payment, QuotaExceededError } from '@/lib/api';
import ChatHistory, { Conversation, getActiveId, setActiveId } from '@/components/ChatHistory';
import SkillsBottom from '@/components/SkillsBottom';

/* ── 类型 ── */
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface UsageInfo {
  count: number;
  free_quota: number;
  remaining: number;
  paid: boolean;
}

const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: '你是一位专业的生物信息学助理，擅长基因组学、转录组学、蛋白质组学、序列分析、NGS数据处理等生信领域。回答风格严谨、准确、有条理。使用中文回答，必要时引用学术来源和常用生信工具。',
  timestamp: 0,
};

const CNS = {
  navy: '#1B3A5C', navyDark: '#0F2640', navyLight: '#2A5180',
  red: '#8C1B2E', teal: '#2E5A5C', gold: '#8B6914',
  paper: '#FAFAF8', cream: '#F5F3EE', sand: '#EDE8DD',
  ink: '#2C2C2C', inkLight: '#6B6B6B', inkMuted: '#99958D',
  border: '#D4CFC4',
};

const STORAGE_KEY = 'chat_conversations';

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

/** 保存当前对话 */
function saveCurrent(id: string, messages: Message[]) {
  const convs = loadConversations();
  const idx = convs.findIndex(c => c.id === id);
  const userMsgs = messages.filter(m => m.role === 'user');
  const title = userMsgs.length > 0 ? userMsgs[0].content.slice(0, 40) : '新对话';

  const entry: Conversation = {
    id,
    title: title || '新对话',
    messages: messages
      .filter(m => m.role !== 'system')  // 不存 system prompt
      .map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
    createdAt: idx >= 0 ? convs[idx].createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  if (idx >= 0) convs[idx] = entry;
  else convs.unshift(entry);

  saveConversations(convs);
  window.dispatchEvent(new Event('chat-history-refresh'));
}

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [convId, setConvId] = useState<string>(getActiveId() || '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | null>(null);
  const [payOrderId, setPayOrderId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── 初始化 ──
  useEffect(() => {
    loadUsage();
    // 恢复上次对话
    const activeId = getActiveId();
    if (activeId) {
      const convs = loadConversations();
      const conv = convs.find(c => c.id === activeId);
      if (conv) {
        setConvId(conv.id);
        setMessages(conv.messages.map(m => ({ ...m, role: m.role as Message['role'] })));
      }
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const loadUsage = async () => {
    try { const res = await auth.me(); setUsage(res.usage); } catch {}
  };

  // ── 对话持久化 ──
  const persist = useCallback((msgs: Message[]) => {
    if (!convId || msgs.length === 0) return;
    saveCurrent(convId, msgs);
  }, [convId]);

  // ── 新建对话 ──
  const handleNew = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setConvId(id);
    setActiveId(id);
    setMessages([]);
    setStreaming('');
    inputRef.current?.focus();
  };

  // ── 加载对话 ──
  const handleLoad = (conv: Conversation) => {
    setConvId(conv.id);
    setActiveId(conv.id);
    setMessages(conv.messages.map(m => ({ ...m, role: m.role as Message['role'] })));
    setStreaming('');
  };

  // ── 发送消息 ──
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 确保有 convId
    let cid = convId;
    if (!cid) {
      cid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      setConvId(cid);
      setActiveId(cid);
    }

    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreaming('');

    // 立即保存用户消息
    saveCurrent(cid, newMessages);

    const apiMessages = [SYSTEM_PROMPT, ...newMessages].map(m => ({
      role: m.role, content: m.content,
    }));

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: apiMessages, temperature: 0.7, max_tokens: 4096 }),
      });

      if (res.status === 402) {
        const err = await res.json();
        throw new QuotaExceededError(err.detail || '额度已用完');
      }
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try { full += JSON.parse(data).content || ''; setStreaming(full); } catch {}
          }
        }
      }

      if (full) {
        const final = [...newMessages, { role: 'assistant' as const, content: full, timestamp: Date.now() }];
        setMessages(final);
        saveCurrent(cid, final);
      }
      loadUsage();
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        const warn: Message = { role: 'assistant', content: `⚠️ **今日免费额度已用完（${usage?.free_quota || 10} 条）**\n\n点击右上角「付费」继续无限量使用。`, timestamp: Date.now() };
        const withWarn = [...newMessages, warn];
        setMessages(withWarn);
        saveCurrent(cid, withWarn);
        loadUsage();
      } else {
        const errMsg: Message = { role: 'assistant', content: `❌ 错误: ${err.message}`, timestamp: Date.now() };
        const withErr = [...newMessages, errMsg];
        setMessages(withErr);
        saveCurrent(cid, withErr);
      }
    } finally {
      setLoading(false);
      setStreaming('');
    }
  }, [input, loading, messages, convId, usage]);

  const handlePay = async () => { try { const res = await payment.create(); setPayAmount(res.amount); setPayOrderId(res.order_id); } catch (err: any) { alert(err.message); } };
  const handleConfirmPay = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/payment/confirm?order_id=${payOrderId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setShowPayModal(false); setPayAmount(null); setPayOrderId(null); loadUsage();
    } catch (err: any) { alert('支付确认失败: ' + err.message); }
  };
  const handleLogout = () => { clearToken(); router.push('/auth'); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const clearChat = () => { setMessages([]); setStreaming(''); inputRef.current?.focus(); };

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ backgroundColor: CNS.cream }}>
      {/* 主区域: 侧边栏 + 对话框 */}
      <div className="flex flex-1 overflow-hidden">
        <ChatHistory
          onNew={handleNew}
          onLoad={handleLoad}
          activeId={convId}
          messagesCount={messages.length}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* 顶部导航栏 */}
          <header className="flex items-center justify-between px-6 py-3 shadow-sm border-b z-10"
            style={{ backgroundColor: CNS.navyDark, borderColor: CNS.navy }}>
            <div className="flex items-center gap-3">
              <GraduationCap size={28} style={{ color: CNS.gold }} />
              <div>
                <h1 className="text-lg font-bold tracking-wide m-0" style={{ color: CNS.paper, fontFamily: '"Noto Serif SC", serif' }}>生信助理</h1>
                <span className="text-xs" style={{ color: CNS.inkMuted }}>Agent 让科研更高效</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {usage && (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: usage.remaining > 0 ? CNS.navy : CNS.red, color: CNS.sand }}>
                  <Sparkles size={12} />
                  {usage.paid ? '已付费 · 无限量' : `剩余 ${usage.remaining} / ${usage.free_quota} 次`}
                </span>
              )}
              {usage && !usage.paid && (
                <button onClick={() => { setShowPayModal(true); handlePay(); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-opacity hover:opacity-80"
                  style={{ backgroundColor: CNS.gold, color: CNS.paper }}>
                  <CreditCard size={12} />付费
                </button>
              )}
              <button onClick={clearChat} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-opacity hover:opacity-80"
                style={{ backgroundColor: CNS.red, color: CNS.paper }}><Trash2 size={12} />清空</button>
              <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs"
                style={{ backgroundColor: 'transparent', color: CNS.sand, border: `1px solid ${CNS.sand}` }}><LogOut size={12} />退出</button>
            </div>
          </header>

          {/* 居中对话框 */}
          <div className="flex-1 flex items-center justify-center px-4 py-4">
            <div className="w-full max-w-3xl rounded-xl shadow-lg flex flex-col overflow-hidden"
              style={{ backgroundColor: CNS.paper, border: `1px solid ${CNS.border}`, maxHeight: 'calc(100vh - 200px)' }}>
              <div className="flex-1 overflow-y-auto px-5 py-5" style={{ minHeight: '250px' }}>
                <div className="space-y-5">
                  {messages.length === 0 && !streaming && (
                    <div className="text-center py-12">
                      <GraduationCap size={48} className="mx-auto mb-4 opacity-20" style={{ color: CNS.navy }} />
                      <h2 className="text-xl mb-2" style={{ color: CNS.navy, fontFamily: '"Noto Serif SC", serif' }}>生信助理</h2>
                      <p className="text-xs m-0" style={{ color: CNS.inkMuted }}>Agent 让科研更高效</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[85%] rounded-lg px-5 py-3.5 shadow-sm"
                        style={msg.role === 'user' ? { backgroundColor: CNS.navy, color: CNS.paper } : { backgroundColor: CNS.cream, color: CNS.ink, border: `1px solid ${CNS.border}` }}>
                        {msg.role === 'assistant' ? <div className="prose-academic text-sm leading-relaxed"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : <p className="text-sm whitespace-pre-wrap m-0">{msg.content}</p>}
                      </div>
                    </div>
                  ))}
                  {streaming && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg px-5 py-3.5 shadow-sm typing-cursor" style={{ backgroundColor: CNS.cream, color: CNS.ink, border: `1px solid ${CNS.border}` }}>
                        <div className="prose-academic text-sm leading-relaxed"><ReactMarkdown>{streaming}</ReactMarkdown></div>
                      </div>
                    </div>
                  )}
                  {loading && !streaming && (
                    <div className="flex justify-start"><div className="rounded-lg px-5 py-3.5" style={{ backgroundColor: CNS.cream, border: `1px solid ${CNS.border}` }}>
                      <div className="flex gap-1.5">{[0, 1, 2].map(i => (<div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: CNS.navy, animationDelay: `${i * 0.15}s` }} />))}</div>
                    </div></div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div className="px-4 py-3 border-t" style={{ borderColor: CNS.border }}>
                <div className="flex gap-3 items-end">
                  <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={usage?.remaining === 0 && !usage?.paid ? '今日免费额度已用完，请付费继续…' : '输入你的问题… (Enter 发送)'}
                    rows={1} disabled={loading}
                    className="flex-1 resize-none rounded-lg px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: CNS.cream, color: CNS.ink, border: `1px solid ${CNS.border}`, fontFamily: 'inherit', maxHeight: '120px' }} />
                  <button onClick={sendMessage} disabled={loading || !input.trim()}
                    className="flex-shrink-0 rounded-lg p-3 transition-all disabled:opacity-40" style={{ backgroundColor: CNS.navy, color: CNS.paper }}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 SKILLs */}
      <SkillsBottom />

      {/* 付费弹窗 */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: CNS.paper }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: CNS.ink }}>升级无限量</h3>
            <p className="text-sm mb-4" style={{ color: CNS.inkLight }}>一次性付费，永久解锁每日无限提问</p>
            <div className="text-center py-4 mb-4 rounded-lg" style={{ backgroundColor: CNS.cream, border: `1px solid ${CNS.border}` }}>
              <div className="text-3xl font-bold mb-1" style={{ color: CNS.navy }}>¥{payAmount || '9.9'}</div>
              <div className="text-xs" style={{ color: CNS.inkMuted }}>一次付费 · 永久无限量</div>
            </div>
            <div className="text-xs mb-4 p-3 rounded" style={{ backgroundColor: '#FFF8E1', color: CNS.gold, border: '1px solid #FFE082' }}>
              支付方式：微信扫码 / 支付宝（请联系管理员）
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ border: `1px solid ${CNS.border}`, color: CNS.inkLight }}>取消</button>
              <button onClick={handleConfirmPay} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: CNS.navy, color: CNS.paper }}>确认已支付</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
