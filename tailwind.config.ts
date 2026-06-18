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
        'bg-primary': '#0A0A0A',
        'bg-card': '#1C1C1E',
        'bg-card-hover': '#2C2C2E',
        'accent': '#F59E0B',
        'accent-glow': 'rgba(245, 158, 11, 0.3)',
        'success': '#22C55E',
        'text-primary': '#F5F5F5',
        'text-muted': '#8E8E93',
        'border': '#3A3A3C',
      },
    },
  },
  plugins: [],
}
export default config
