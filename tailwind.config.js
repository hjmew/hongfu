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
        'status-safe': '#10b981', // 绿色 - 安全
        'status-danger': '#f59e0b', // 橙色 - 危险
        'status-emergency': '#ef4444', // 红色 - 生命危险
      },
    },
  },
  plugins: [],
}