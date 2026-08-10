import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Comercio Lleno', description: 'Punto de venta y gestión para comercios' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<script src="/customer-guard.js" defer /><script src="/excel-tools.js" defer /><script src="/arca-tools.js" defer /><script src="/catalog-sync.js" defer /><script src="/product-edit-tools.js" defer /><script src="/cash-daily-tools.js" defer /></body></html>
}
