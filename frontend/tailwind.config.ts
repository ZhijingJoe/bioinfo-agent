import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── CNS 学术配色体系 ──
        cns: {
          // 主色 — 藏蓝 (CNS Navy Blue)
          navy:        '#1B3A5C',
          'navy-dark': '#0F2640',
          'navy-light':'#2A5180',

          // 辅色 — 暗红 (CNS Dark Red)
          red:         '#8C1B2E',
          'red-light': '#B83A4E',

          // 强调色 — 墨绿 (CNS Dark Green)
          teal:        '#2E5A5C',
          'teal-light':'#468288',

          // 暖调 — 金棕 (CNS Golden Brown)
          gold:        '#8B6914',

          // 背景系
          paper:       '#FAFAF8',
          cream:       '#F5F3EE',
          sand:        '#EDE8DD',

          // 文字系
          ink:         '#2C2C2C',
          'ink-light': '#6B6B6B',
          'ink-muted': '#99958D',

          // 边框
          border:      '#D4CFC4',
          'border-light': '#E8E4DB',
        },
      },
      fontFamily: {
        // 学术排版: 中文衬线 + 英文衬线
        scholarly: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        // 界面字体
        ui: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#2C2C2C',
            a: { color: '#1B3A5C' },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
