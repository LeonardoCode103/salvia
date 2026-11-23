'use client'

import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui'

const textos = {
  'change-wallet': 'Cambiar wallet',
  connecting: 'Conectando…',
  'copy-address': 'Copiar dirección',
  copied: 'Copiada',
  disconnect: 'Desconectar',
  'has-wallet': 'Conectar',
  'no-wallet': 'Conectar wallet',
} as const

export default function BotonWallet() {
  return <BaseWalletMultiButton labels={textos} />
}
