import type { Config } from 'tailwindcss';

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#C41E3A',
        secondary: '#000000',
        accent: '#C41E3A',
        danger: '#C41E3A',
        warning: '#F59E0B',
        success: '#10B981',
        'hm-light': '#F5F5F5',
        'hm-dark': '#1a1a1a',
      },
      backgroundColor: {
        base: '#FFFFFF',
        muted: '#F5F5F5',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: false,
  },
} satisfies Config;

export default config;
