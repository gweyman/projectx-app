/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Project X brand palette
        brand: {
          black:   '#0A0A0A',
          white:   '#F5F5F0',
          red:     '#D94F3D',
          red_dim: '#A33C2D',
          gray:    '#1C1C1C',
          muted:   '#6B6B6B',
          border:  '#2A2A2A',
        },
        // Soreness traffic-light colors
        soreness: {
          green:  '#3DBF6E',
          yellow: '#E8C547',
          red:    '#D94F3D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
