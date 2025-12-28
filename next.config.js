/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 注意：EdgeOne Pages支持动态内容，可以移除静态导出限制
  // output: 'export', // 静态导出不适用于API路由
  trailingSlash: true, // 添加尾随斜杠以确保路由正确
  // 配置环境变量前缀，确保NEXT_PUBLIC_变量在构建时可用
  env: {
    NEXT_PUBLIC_SUBMIT_URL: process.env.NEXT_PUBLIC_SUBMIT_URL || '',
  },
}

module.exports = nextConfig