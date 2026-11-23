'use client'

import type { ReactNode } from 'react'
import { Buffer } from 'buffer'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { RPC_ENDPOINT } from '@/lib/solana/cliente'

// Anchor serializa con Buffer; el navegador no lo trae de forma global.
if (typeof window !== 'undefined' && !('Buffer' in window)) {
  Object.assign(window, { Buffer })
}

export default function WalletProviderShell({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
