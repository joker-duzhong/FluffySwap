/** @type {import('tailwindcss').Config} */
module.exports = {
  // 禁用 preflight，因为这在小程序中会导致样式错乱
  corePlugins: {
    preflight: false,
  },
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8E97FD',      // Silent Moon Purple
          orange: '#FF8C42',       // 暖橘主色
          peach: '#FFAA6B',        // 蜜桃过渡
          coral: '#FF6B81',        // 珊瑚强调
          lavender: '#C4B0FF',     // 薰衣草紫
          mint: '#7FD8BE',         // 薄荷绿
          lemon: '#FFE066',        // 柠檬黄
          'soft-orange': '#FA6E5A', // Design orange card
          'soft-yellow': '#FEB754', // Design yellow card
          'soft-green': '#6CB28E',  // Design green card
          'soft-dark': '#3F414E',   // Design dark card
          'soft-pink': '#D4A5A5',   // Design pink card
        },
        surface: {
          DEFAULT: '#F9F9F9',      // Base grey
          card: '#FFFFFF',
          muted: '#8E97FD',        // Purple background
          overlay: 'rgba(255,251,245,0.85)',
        },
        ink: {
          DEFAULT: '#3F414E',      // Dark text from design
          secondary: '#A1A4B2',    // Muted text
          tertiary: '#FFECCC',     // Light/Hint text
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"SF Pro Display"', '"PingFang SC"', 'system-ui', 'sans-serif'],
        body: ['"SF Pro Text"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(45, 43, 55, 0.06)',
        'card-hover': '0 8px 40px rgba(45, 43, 55, 0.10)',
        'btn': '0 8px 24px rgba(255, 140, 66, 0.30)',
        'btn-active': '0 2px 8px rgba(255, 140, 66, 0.15)',
        'float': '0 12px 32px rgba(45, 43, 55, 0.08)',
        'glow-orange': '0 0 40px rgba(255, 140, 66, 0.20)',
        'glow-lavender': '0 0 40px rgba(196, 176, 255, 0.25)',
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-mid': 'floatMid 4s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-cute': 'bounceCute 1.8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'wiggle': 'wiggle 2.5s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatMid: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(3deg)' },
        },
        bounceCute: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
