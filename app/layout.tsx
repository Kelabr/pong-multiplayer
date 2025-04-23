import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pong Multiplayer',
  description: 'Um jogo de Pong feito em vibe coding',
  generator: '',
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
