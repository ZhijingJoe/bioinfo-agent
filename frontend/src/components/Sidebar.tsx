'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Dna,
  ExternalLink,
  ChevronDown,
  Star,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { academicResearchSkills, bioSkills } from '@/data/skills';

const CNS = {
  navy: '#1B3A5C',
  navyDark: '#0F2640',
  navyLight: '#2A5180',
  red: '#8C1B2E',
  gold: '#8B6914',
  paper: '#FAFAF8',
  cream: '#F5F3EE',
  sand: '#EDE8DD',
  ink: '#2C2C2C',
  inkLight: '#6B6B6B',
  inkMuted: '#99958D',
  border: '#D4CFC4',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleSkill = (key: string) =>
    setExpandedSkill(prev => (prev === key ? null : key));
  const toggleCategory = (name: string) =>
    setExpandedCategory(prev => (prev === name ? null : name));

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {}
  };

  if (collapsed) {
    return (
      <aside
        className="h-screen flex flex-col items-center py-4 border-r z-20 transition-all duration-300"
        style={{
          width: 48,
          backgroundColor: CNS.navyDark,
          borderColor: CNS.navy,
        }}
      >
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded hover:opacity-80"
          style={{ color: CNS.sand }}
          title="展开侧边栏"
        >
          <ChevronRight size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="h-screen overflow-y-auto flex-shrink-0 border-r z-20 transition-all duration-300"
      style={{
        width: 340,
        backgroundColor: CNS.navyDark,
        borderColor: CNS.navy,
      }}
    >
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: CNS.navy, backgroundColor: CNS.navyDark }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: CNS.gold }} />
          <span
            className="text-sm font-bold tracking-wide"
            style={{ color: CNS.paper }}
          >
            科研 SKILLs
          </span>
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1 rounded hover:opacity-80"
          style={{ color: CNS.sand }}
          title="收起侧边栏"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* ======== 仓库一: Academic Research Skills ======== */}
        <SectionHeader
          title={academicResearchSkills.title}
          stars={academicResearchSkills.stars}
        />

        <p className="text-xs px-1 mb-2" style={{ color: CNS.inkMuted, lineHeight: 1.6 }}>
          {academicResearchSkills.description.slice(0, 100)}…
        </p>

        {/* 安装命令 */}
        <div
          className="rounded-md px-3 py-2 text-xs flex items-center justify-between cursor-pointer"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: CNS.sand,
            fontFamily: 'monospace',
          }}
          onClick={() => copyToClipboard(academicResearchSkills.installCmd, 'ars')}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal size={12} style={{ flexShrink: 0 }} />
            <span className="truncate">{academicResearchSkills.installCmd}</span>
          </div>
          {copiedCmd === 'ars' ? (
            <Check size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
          ) : (
            <Copy size={14} style={{ flexShrink: 0 }} />
          )}
        </div>

        {/* 4 个核心技能 */}
        <div className="space-y-1">
          {academicResearchSkills.skills.map(s => (
            <SkillCard
              key={s.name}
              skill={s}
              expanded={expandedSkill === s.name}
              onToggle={() => toggleSkill(s.name)}
            />
          ))}
        </div>

        <a
          href={academicResearchSkills.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs px-1 hover:underline"
          style={{ color: CNS.gold }}
        >
          <ExternalLink size={12} />
          GitHub 仓库 (★ {academicResearchSkills.stars.toLocaleString()})
        </a>

        {/* 分隔线 */}
        <div style={{ borderTop: `1px solid ${CNS.navy}`, margin: '8px 0' }} />

        {/* ======== 仓库二: bioSkills ======== */}
        <SectionHeader title={bioSkills.title} stars={bioSkills.stars} />

        <p className="text-xs px-1 mb-2" style={{ color: CNS.inkMuted, lineHeight: 1.6 }}>
          {bioSkills.description.slice(0, 100)}…
        </p>

        {/* 安装命令 */}
        <div
          className="rounded-md px-3 py-2 text-xs flex items-center justify-between cursor-pointer"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: CNS.sand,
            fontFamily: 'monospace',
          }}
          onClick={() => copyToClipboard(bioSkills.installCmd, 'bioskills')}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal size={12} style={{ flexShrink: 0 }} />
            <span className="truncate">{bioSkills.installCmd}</span>
          </div>
          {copiedCmd === 'bioskills' ? (
            <Check size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
          ) : (
            <Copy size={14} style={{ flexShrink: 0 }} />
          )}
        </div>

        {/* 分类列表 */}
        <div className="space-y-1.5">
          {bioSkills.categories.map(cat => (
            <div key={cat.name}>
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors"
                style={{ color: CNS.sand }}
              >
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span
                    className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: CNS.navy, color: CNS.inkMuted }}
                  >
                    {cat.skills.length}
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedCategory === cat.name && (
                <div className="ml-2 space-y-0.5 mt-0.5">
                  {cat.skills.map(s => (
                    <SkillCard
                      key={s.name}
                      skill={s}
                      compact
                      expanded={expandedSkill === s.name}
                      onToggle={() => toggleSkill(s.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <a
          href={bioSkills.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs px-1 hover:underline"
          style={{ color: CNS.gold }}
        >
          <ExternalLink size={12} />
          GitHub 仓库 (★ {bioSkills.stars.toLocaleString()})
        </a>
      </div>
    </aside>
  );
}

/* ── 子组件 ── */

function SectionHeader({ title, stars }: { title: string; stars: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <Dna size={16} style={{ color: CNS.gold }} />
      <span className="text-sm font-semibold" style={{ color: CNS.paper }}>
        {title}
      </span>
      <span
        className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
        style={{ backgroundColor: '#3c2a1a', color: CNS.gold }}
      >
        <Star size={10} />
        {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
      </span>
    </div>
  );
}

function SkillCard({
  skill,
  expanded,
  compact = false,
  onToggle,
}: {
  skill: { name: string; desc: string; tutorial: string; gh: string };
  expanded: boolean;
  compact?: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
          compact ? 'text-xs' : 'text-sm'
        }`}
        style={{
          color: expanded ? CNS.paper : CNS.sand,
          backgroundColor: expanded ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="font-medium truncate"
            style={{
              fontFamily: 'monospace',
              fontSize: compact ? '11px' : '12px',
            }}
          >
            {skill.name}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            style={{ flexShrink: 0 }}
          />
        </div>
      </button>

      {expanded && (
        <div
          className="mx-1 mb-1 rounded-md p-3 text-xs space-y-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* 描述 */}
          <p className="m-0" style={{ color: CNS.inkLight, lineHeight: 1.6 }}>
            {skill.desc}
          </p>

          {/* 教程 */}
          {skill.tutorial && (
            <div>
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: CNS.gold }}
              >
                使用教程
              </div>
              <div
                className="whitespace-pre-line"
                style={{ color: CNS.sand, lineHeight: 1.6, fontSize: '11px' }}
              >
                {skill.tutorial}
              </div>
            </div>
          )}

          {/* GitHub 链接 */}
          <a
            href={skill.gh}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            style={{ color: CNS.gold, fontSize: '11px' }}
          >
            <ExternalLink size={11} />
            在 GitHub 查看
          </a>
        </div>
      )}
    </div>
  );
}
