import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#111111',
        muted: '#1a1a1a',
        mutedForeground: '#888888',
        accent: {
          DEFAULT: '#ffffff',
          secondary: '#cccccc',
          tertiary: '#999999',
        },
        border: {
          DEFAULT: '#222222',
          bright: '#333333',
        },
        input: '#111111',
        ring: '#ffffff',
        destructive: '#ff3366',
        bg: {
          base: '#0a0a0a',
          surface: '#111111',
          elevated: '#1a1a1a',
        },
        /* backward compat for dashboard pages */
        gold: {
          DEFAULT: '#ffffff',
          dim: '#999999',
          bright: '#ffffff',
          muted: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['var(--font-anton)', 'Impact', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        sans: ['var(--font-jetbrains)', 'monospace'],
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'noise': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -5%)' },
          '20%': { transform: 'translate(-10%, 5%)' },
          '30%': { transform: 'translate(5%, -10%)' },
          '40%': { transform: 'translate(-5%, 15%)' },
          '50%': { transform: 'translate(-10%, 5%)' },
          '60%': { transform: 'translate(15%, 0)' },
          '70%': { transform: 'translate(0, 10%)' },
          '80%': { transform: 'translate(-15%, 0)' },
          '90%': { transform: 'translate(10%, 5%)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        glitch: 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'noise': 'noise 0.5s steps(10) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
