/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nothing-black': '#000000',
        'nothing-white': '#FFFFFF',
        'nothing-red': '#FF0000',
      },
      fontFamily: {
        'nothing': ['NothingFont', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Fluid spacing using clamp for proportional scaling
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        // Fluid spacing values
        'fluid-1': 'clamp(0.25rem, 0.5vmin, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1vmin, 1rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vmin, 1.25rem)',
        'fluid-4': 'clamp(1rem, 2vmin, 1.5rem)',
        'fluid-5': 'clamp(1.25rem, 2.5vmin, 2rem)',
        'fluid-6': 'clamp(1.5rem, 3vmin, 2.5rem)',
        'fluid-8': 'clamp(2rem, 4vmin, 3rem)',
        'fluid-10': 'clamp(2.5rem, 5vmin, 4rem)',
        'fluid-12': 'clamp(3rem, 6vmin, 5rem)',
        'fluid-16': 'clamp(4rem, 8vmin, 6rem)',
        'fluid-20': 'clamp(5rem, 10vmin, 8rem)',
        'fluid-24': 'clamp(6rem, 12vmin, 10rem)',
        'fluid-32': 'clamp(8rem, 16vmin, 12rem)',
      },
      // Fluid font sizes using clamp
      fontSize: {
        'fluid-xs': ['clamp(0.625rem, calc(0.5rem + 0.5vmin), 0.875rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.75rem, calc(0.6rem + 0.6vmin), 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(0.875rem, calc(0.7rem + 0.7vmin), 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1rem, calc(0.8rem + 0.8vmin), 1.5rem)', { lineHeight: '1.5' }],
        'fluid-xl': ['clamp(1.125rem, calc(0.9rem + 1vmin), 1.75rem)', { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.25rem, calc(1rem + 1.2vmin), 2rem)', { lineHeight: '1.4' }],
        'fluid-3xl': ['clamp(1.5rem, calc(1.2rem + 1.5vmin), 2.5rem)', { lineHeight: '1.3' }],
        'fluid-4xl': ['clamp(1.875rem, calc(1.5rem + 2vmin), 3.5rem)', { lineHeight: '1.2' }],
        'fluid-5xl': ['clamp(2.25rem, calc(1.8rem + 2.5vmin), 4rem)', { lineHeight: '1.2' }],
        'fluid-6xl': ['clamp(2.75rem, calc(2.2rem + 3vmin), 5rem)', { lineHeight: '1.1' }],
        'fluid-7xl': ['clamp(3.5rem, calc(2.8rem + 4vmin), 6rem)', { lineHeight: '1.1' }],
        'fluid-8xl': ['clamp(4rem, calc(3.2rem + 5vmin), 7.5rem)', { lineHeight: '1' }],
        'fluid-9xl': ['clamp(5rem, calc(4rem + 6vmin), 9rem)', { lineHeight: '1' }],
      },
      // Fluid max-width values
      maxWidth: {
        'fluid-sm': 'min(90vw, 640px)',
        'fluid-md': 'min(90vw, 768px)',
        'fluid-lg': 'min(90vw, 1024px)',
        'fluid-xl': 'min(90vw, 1280px)',
        'fluid-2xl': 'min(90vw, 1536px)',
        'fluid-prose': 'min(85vw, 65ch)',
      },
      // Fluid border radius
      borderRadius: {
        'fluid-sm': 'clamp(0.125rem, 0.25vmin, 0.25rem)',
        'fluid-md': 'clamp(0.25rem, 0.5vmin, 0.5rem)',
        'fluid-lg': 'clamp(0.5rem, 1vmin, 1rem)',
        'fluid-xl': 'clamp(0.75rem, 1.5vmin, 1.5rem)',
        'fluid-2xl': 'clamp(1rem, 2vmin, 2rem)',
        'fluid-full': '9999px',
      },
      // Fluid gap
      gap: {
        'fluid-1': 'clamp(0.25rem, 0.5vmin, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1vmin, 1rem)',
        'fluid-4': 'clamp(1rem, 2vmin, 1.5rem)',
        'fluid-6': 'clamp(1.5rem, 3vmin, 2rem)',
        'fluid-8': 'clamp(2rem, 4vmin, 3rem)',
        'fluid-12': 'clamp(3rem, 6vmin, 4rem)',
        'fluid-16': 'clamp(4rem, 8vmin, 6rem)',
      },
      // Fluid width/height
      width: {
        'fluid-icon-sm': 'clamp(1rem, 2vmin, 1.5rem)',
        'fluid-icon-md': 'clamp(1.5rem, 3vmin, 2.5rem)',
        'fluid-icon-lg': 'clamp(2rem, 4vmin, 3.5rem)',
        'fluid-icon-xl': 'clamp(3rem, 6vmin, 5rem)',
      },
      height: {
        'fluid-icon-sm': 'clamp(1rem, 2vmin, 1.5rem)',
        'fluid-icon-md': 'clamp(1.5rem, 3vmin, 2.5rem)',
        'fluid-icon-lg': 'clamp(2rem, 4vmin, 3.5rem)',
        'fluid-icon-xl': 'clamp(3rem, 6vmin, 5rem)',
      },
      // Fluid box shadow for glows
      boxShadow: {
        'fluid-glow-sm': '0 0 clamp(5px, 1vmin, 10px) currentColor',
        'fluid-glow-md': '0 0 clamp(10px, 2vmin, 20px) currentColor',
        'fluid-glow-lg': '0 0 clamp(20px, 4vmin, 40px) currentColor',
      },
      // Fluid drop shadow
      dropShadow: {
        'fluid-glow': [
          '0 0 clamp(3px, 0.5vmin, 6px) rgba(255,255,255,0.4)',
          '0 0 clamp(6px, 1vmin, 12px) rgba(255,255,255,0.2)',
        ],
      },
    },
  },
  plugins: [],
}
