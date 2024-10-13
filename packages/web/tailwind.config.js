const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    backgroundSize: {
      ...defaultTheme.backgroundSize,
      '2x': '200%',
    },
    extend: {
      animation: {
        gradient: 'gradient 3s ease infinite',
      },
      colors: {
        'chrome-1': '#01a258',
        'chrome-2': '#008cf8',
        'chrome-3': '#fe4e40',
        'edge-1': '#197bc4',
        'edge-2': '#2ec2e0',
        'edge-3': '#52dc6c',
        'firefox-1': '#fe3b45',
        'firefox-2': '#775aea',
        'firefox-3': '#fee545',
        primary: '#3dd9eb',
        secondary: '#34495e',
        tertiary: '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
};
