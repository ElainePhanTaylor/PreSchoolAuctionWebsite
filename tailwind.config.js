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
        'primary-green': '#5B8C5A',
        'warm-cream': '#F5F0E8',
        'accent-gold': '#D4A853',
        'dark-text': '#2C3E2D',
      },
    },
  },
  plugins: [],
}


