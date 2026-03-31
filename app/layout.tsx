import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiDocLink — Panel del Doctor',
  description: 'Panel de gestión médica para doctores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
