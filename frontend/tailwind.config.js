/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vigil-dark': '#0f172a',
        'vigil-navy': '#1e293b',
        'vigil-slate': '#334155',
        'vigil-accent': '#0ea5e9',
        'vigil-accent-dark': '#0284c7',
        'vigil-success': '#22c55e',
        'vigil-warning': '#f59e0b',
        'vigil-error': '#ef4444',
        'vigil-border': '#475569',
        'vigil-text-primary': '#f1f5f9',
        'vigil-text-secondary': '#cbd5e1',
        'vigil-text-muted': '#94a3b8',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

