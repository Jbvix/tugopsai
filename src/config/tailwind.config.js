/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Técnica TugLife
        naval: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#334e68',
          800: '#102a43', // Fundo principal
          900: '#05192d', // Deep Navy para Headers
        },
        action: {
          success: '#22c55e', // Verde Operacional
          warning: '#facc15', // Amarelo Alerta (1350h)
          danger: '#ef4444',  // Vermelho WO Crítica / Off-hire
          info: '#3b82f6',    // Azul Bunker/Insumos
        },
        slate: {
          950: '#020617',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px -3px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}