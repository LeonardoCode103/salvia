import type { Metadata } from 'next'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'
import WalletProviderShell from './components/WalletProviderShell'

export const metadata: Metadata = {
  title: 'Salvia — Tu recetario inteligente',
  description: 'Recetas personalizadas según tu salud y lo que tienes en casa.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <WalletProviderShell>{children}</WalletProviderShell>
      </body>
    </html>
  )
}
