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
        primary: '#374151',
        secondary: '#CECECE',
        whiteColor: '#F8F8F8',
        background: '#D6D6D6',
      },
    },
  },
  plugins: [],
}
export default config
