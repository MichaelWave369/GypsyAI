import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mystic: '#0f0f19',
        gold: '#d8b25a'
      }
    }
  },
  plugins: []
};

export default config;
