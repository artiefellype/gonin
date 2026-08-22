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
        'animb': "url('/imgs/cute-four-leaf.png')"
      },
      colors: {
        primary: '#EEF7F5',
        secondary: '#1A2931',
        whiteColor: '#121D23',
        background: '#080D10',
        accent: '#82ABFF',
        accentSoft: '#111B3E',
        mutedText: '#9EB2B1',
        panel: '#10191F',
        borderDark: '#263943',
        coral: '#FF947D',
        coralSoft: '#3D2420',
        blueAccent: '#82ABFF',
        blueSoft: '#111B3E',
        goldAccent: '#F2C96D',
      },
      keyframes: {
        blink: {
          '0%, 100%': { fill: '#82ABFF' },
          '50%': { fill: '#A9BDFF' },
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
