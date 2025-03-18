/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
];
export const theme = {
  extend: {
    keyframes: {
      flicker: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.6' },
      },
      glow: {
        '0%': { boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14' },
        '100%': { boxShadow: '0 0 20px #39FF14, 0 0 50px #39FF14' },
      },
    },
    animation: {
      flicker: 'flicker 1.5s infinite alternate',
      glow: 'glow 1.5s ease-in-out infinite',
    },
  },
};
export const plugins = [];