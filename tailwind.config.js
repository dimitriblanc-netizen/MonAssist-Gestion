/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs de marque principales DRYOS
        navy: {
          DEFAULT: '#00434A',
          50: '#F0F7F7',
          100: '#D5EBED',
          200: '#AEDBDF',
          300: '#79C1C9',
          400: '#439EA8',
          500: '#1F7E88',
          600: '#005E68',
          700: '#00434A', // Brand primary
          800: '#00343A', // Brand dark
          900: '#00252A',
          950: '#00161A',
        },
        emerald: {
          brand: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        cream: {
          DEFAULT: '#FBF7EE',
          50: '#FDFBF7',
          100: '#FBF7EE',
          200: '#F4ECE0',
        },
        // 3 seules couleurs de statut autorisées
        status: {
          ok: {
            DEFAULT: '#16A34A',
            bg: '#F0FDF4',
            border: '#BBF7D0',
            text: '#15803D',
          },
          warning: {
            DEFAULT: '#F59E0B',
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          urgent: {
            DEFAULT: '#DC2626',
            bg: '#FEF2F2',
            border: '#FECACA',
            text: '#B91C1C',
          },
        },
      },
    },
  },
  plugins: [],
};
