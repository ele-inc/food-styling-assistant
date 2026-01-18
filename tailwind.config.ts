import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#f9d5d1',
          300: '#f4b5ae',
          400: '#ec8b80',
          500: '#e06456',
          600: '#cc4838',
          700: '#ab3a2c',
          800: '#8e3328',
          900: '#773027',
        },
        accent: {
          50: '#f6f5f0',
          100: '#e8e6d9',
          200: '#d3cfb5',
          300: '#bab28a',
          400: '#a59968',
          500: '#96875a',
          600: '#816e4b',
          700: '#68563e',
          800: '#584938',
          900: '#4c4032',
        },
      },
    },
  },
  plugins: [],
}
export default config
