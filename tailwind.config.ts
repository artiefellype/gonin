import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'animb': "url('/imgs/cute-four-leaf.png')"
      },
      colors: {
        primary: '#2D2B26',
        secondary: '#DED4C2',
        whiteColor: '#FFFDF6',
        background: '#F1EBDD',
        accent: '#52665A',
        accentSoft: '#E4E9DD',
      },
      keyframes: {
        blink: {
          '0%, 100%': { fill: '#52665A' },
          '50%': { fill: '#8A6F45' },
        },
      },
      animation: {
        blinkAnimation: 'blink 1.5s infinite',
      },
    },
  },
  plugins: [],
}
export default config
