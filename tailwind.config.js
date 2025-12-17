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
        // Primary brand colors
        'primary': '#2D5A27',
        'coral': '#E85D4C',
        'gold': '#D4A853',
        'violet': '#7C3AED',
        
        // Neutrals
        'midnight': '#1a1a2e',
        'slate': '#64748b',
        'slate-light': '#94a3b8',
        'silver': '#e2e8f0',
        
        // Semantic
        'text': '#1e293b',
        'text-muted': '#64748b',
        'background': '#fafaf9',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

