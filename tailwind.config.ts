import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#020C28',
          50: '#0D1526',
          100: '#0a1020',
          900: '#020C28',
        },
        brand: {
          DEFAULT: '#36069A',
          purple: '#36069A',
          pink: '#DE6399',
          dark: '#020C28',
        },
        pink: '#DE6399',
        teal: {
          DEFAULT: '#4ADEDE',
          400: '#4ADEDE',
        },
        sidebar: '#020C28',
        offwhite: '#F8F9FA',
        charcoal: '#212529',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
