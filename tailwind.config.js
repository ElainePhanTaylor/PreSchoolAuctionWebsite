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
        'midnight': '#0F172A',
        'slate': '#1E293B',
        'slate-light': '#334155',
        'silver': '#94A3B8',
        'pearl': '#F1F5F9',
        'coral': '#FF6B6B',
        'coral-dark': '#EE5A5A',
        'teal': '#2DD4BF',
        'teal-dark': '#14B8A6',
        'violet': '#8B5CF6',
        'primary-green': '#5B8C5A',
        'warm-cream': '#F5F0E8',
        'accent-gold': '#D4A853',
        'dark-text': '#2C3E2D',
      },
    },
  },
  plugins: [],
}





