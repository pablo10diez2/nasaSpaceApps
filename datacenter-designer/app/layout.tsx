import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NASA Datacenter Designer',
  description: 'Created with at spaceapps2025!'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
