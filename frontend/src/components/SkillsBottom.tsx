'use client';

import { useState } from 'react';
import {
  ChevronUp, ChevronDown, BookOpen, Dna, ExternalLink,
  Star, Terminal, Copy, Check,
} from 'lucide-react';
import { academicResearchSkills, bioSkills } from '@/data/skills';

const CNS = {
  navy: '#1B3A5C', navyDark: '#0F2640', navyLight: '#2A5180',
  gold: '#8B6914', red: '#8C1B2E',
  paper: '#FAFAF8', cream: '#F5F3EE', sand: '#EDE8DD',
  ink: '#2C2C2C', inkLight: '#6B6B6B', inkMuted: '#99958D',
  border: '#D4CFC4',
};

export default function SkillsBottom() {
  const [open, setOpen] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const toggleSkill = (key: string) => setExpandedSkill(prev => prev === key ? null : key);
  const toggleCategory = (name: string) => setExpandedCategory(prev => prev === name ? null : name);

  const copyToClipboard = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedCmd(id); setTimeout(() => setCopiedCmd(null), 2000); } catch {}
  };

  return (
    <div className="border-t z-20" style={{ borderColor: CNS.border, backgroundColor: CNS.navyDark }}>
      {/* 折叠条 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs transition-colors hover:opacity-80"
        style={{ color: CNS.sand, backgroundColor: CNS.navyDark }}
      >
        <BookOpen size={14} style={{ color: CNS.gold }} />
        科研 SKILLs 工具箱
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 max-h-80 overflow-y-auto" style={{ backgroundColor: CNS.navyDark }}>
          <div className="flex gap-4 py-3">
            {/* ===== 仓库一: Academic Research ===== */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Dna size={14} style={{ color: CNS.gold }} />
                <span className="text-sm font-semibold" style={{ color: CNS.paper }}>
                  {academicResearchSkills.title}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: '#3c2a1a', color: CNS.gold }}>
                  <Star size={10} />22.3k
                </span>
              </div>

              <div className="rounded-md px-3 py-1.5 text-xs flex items-center gap-2 mb-2 cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: CNS.sand, fontFamily: 'monospace' }}
                onClick={() => copyToClipboard(academicResearchSkills.installCmd, 'ars')}>
                <Terminal size={12} />
                <span className="truncate">{academicResearchSkills.installCmd}</span>
                {copiedCmd === 'ars' ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
              </div>

              <div className="space-y-0.5">
                {academicResearchSkills.skills.map(s => (
                  <div key={s.name}>
                    <button onClick={() => toggleSkill(s.name)}
                      className="w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between"
                      style={{ color: expandedSkill === s.name ? CNS.paper : CNS.sand, backgroundColor: expandedSkill === s.name ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.name}</span>
                      <ChevronDown size={12} className={`transition-transform ${expandedSkill === s.name ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSkill === s.name && (
                      <div className="mx-1 mb-1 rounded-md p-2 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="m-0 mb-1.5" style={{ color: CNS.inkLight, lineHeight: 1.6 }}>{s.desc}</p>
                        <div className="text-xs font-semibold mb-1" style={{ color: CNS.gold }}>使用教程</div>
                        <div className="whitespace-pre-line mb-1.5" style={{ color: CNS.sand, lineHeight: 1.5, fontSize: 11 }}>{s.tutorial}</div>
                        <a href={s.gh} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: CNS.gold, fontSize: 11 }}>
                          <ExternalLink size={11} />GitHub
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ===== 仓库二: bioSkills ===== */}
            <div className="flex-[2] min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Dna size={14} style={{ color: CNS.gold }} />
                <span className="text-sm font-semibold" style={{ color: CNS.paper }}>
                  {bioSkills.title}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: '#3c2a1a', color: CNS.gold }}>
                  <Star size={10} />788
                </span>
              </div>

              <div className="rounded-md px-3 py-1.5 text-xs flex items-center gap-2 mb-2 cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: CNS.sand, fontFamily: 'monospace' }}
                onClick={() => copyToClipboard(bioSkills.installCmd, 'bioskills')}>
                <Terminal size={12} />
                <span className="truncate">{bioSkills.installCmd}</span>
                {copiedCmd === 'bioskills' ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {bioSkills.categories.map(cat => (
                  <div key={cat.name}>
                    <button onClick={() => toggleCategory(cat.name)}
                      className="w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between"
                      style={{ color: CNS.sand }}>
                      <span className="flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        {cat.name}
                        <span className="text-xs px-1 py-0 rounded-full" style={{ backgroundColor: CNS.navy, color: CNS.inkMuted, fontSize: 10 }}>{cat.skills.length}</span>
                      </span>
                      <ChevronDown size={12} className={`transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCategory === cat.name && (
                      <div className="ml-2 space-y-0.5 mt-0.5">
                        {cat.skills.map(s => (
                          <div key={s.name}>
                            <button onClick={() => toggleSkill(`bio-${s.name}`)}
                              className="w-full text-left px-2 py-0.5 rounded text-xs flex items-center justify-between"
                              style={{ color: expandedSkill === `bio-${s.name}` ? CNS.paper : CNS.inkMuted }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.name}</span>
                              <ChevronDown size={10} className={`transition-transform ${expandedSkill === `bio-${s.name}` ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSkill === `bio-${s.name}` && (
                              <div className="mx-1 mb-1 rounded-md p-2 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="m-0 mb-1" style={{ color: CNS.inkLight, lineHeight: 1.5 }}>{s.desc}</p>
                                <div className="whitespace-pre-line mb-1" style={{ color: CNS.sand, lineHeight: 1.4, fontSize: 10 }}>{s.tutorial}</div>
                                <a href={s.gh} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: CNS.gold, fontSize: 10 }}>
                                  <ExternalLink size={10} />GitHub
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
