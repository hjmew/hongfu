import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '报平安 Web APP',
  description: '飞书表格数据可视化展示',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  )
}