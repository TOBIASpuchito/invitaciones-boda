import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        sand: '#f8f1ea',
        blush: '#dec3c1',
        wine: '#6d4654',
        cocoa: '#4a342f',
        sage: '#a9b19d',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(109, 70, 84, 0.14)',
      },
      fontFamily: {
        display: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
} satisfies Config
