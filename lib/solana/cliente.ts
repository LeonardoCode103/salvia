import { AnchorProvider, Program, type BN, type Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, type Transaction } from '@solana/web3.js'
import type { AnchorWallet, WalletContextState } from '@solana/wallet-adapter-react'
import idl from './salvia.json'

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC ?? 'https://api.devnet.solana.com'
export const PROGRAM_ID = new PublicKey(idl.address)
export const connection = new Connection(RPC_ENDPOINT, 'confirmed')

export const TITULO_MAX_BYTES = 32
export const DESCRIPCION_MAX_BYTES = 200

const texto = new TextEncoder()
export const bytes = (s: string) => texto.encode(s).length

const walletSoloLectura: AnchorWallet = {
  publicKey: PublicKey.default,
  signTransaction: () => Promise.reject(new Error('Conecta una wallet para firmar.')),
  signAllTransactions: () => Promise.reject(new Error('Conecta una wallet para firmar.')),
}

const programa = new Program(
  idl as Idl,
  new AnchorProvider(connection, walletSoloLectura, { commitment: 'confirmed' }),
)

export function pdaReceta(autor: PublicKey, titulo: string) {
  return PublicKey.findProgramAddressSync(
    [texto.encode('receta'), autor.toBytes(), texto.encode(titulo)],
    PROGRAM_ID,
  )[0]
}

export function pdaLike(usuario: PublicKey, receta: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [texto.encode('like'), usuario.toBytes(), receta.toBytes()],
    PROGRAM_ID,
  )[0]
}

export type Resultado =
  | { ok: true; firma: string }
  | { ok: false; firma?: string; codigo?: string; mensaje: string }

type Firmante = Pick<WalletContextState, 'publicKey' | 'sendTransaction'>

function exigirWallet(wallet: Firmante): PublicKey {
  if (!wallet.publicKey) throw new Error('Conecta una wallet para firmar.')
  return wallet.publicKey
}

// Se envía sin preflight para que un rechazo del programa quede registrado en Devnet con firma consultable.
async function enviar(wallet: Firmante, tx: Transaction): Promise<Resultado> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  tx.feePayer = exigirWallet(wallet)
  tx.recentBlockhash = blockhash

  let firma: string
  try {
    firma = await wallet.sendTransaction(tx, connection, { skipPreflight: true })
  } catch (e) {
    return { ok: false, mensaje: errorDeWallet(e) }
  }

  let fallo: unknown
  try {
    const { value } = await connection.confirmTransaction(
      { signature: firma, blockhash, lastValidBlockHeight },
      'confirmed',
    )
    fallo = value.err
  } catch (e) {
    // web3.js rechaza con el TransactionError (no un Error) cuando detecta el fallo por sondeo.
    if (e instanceof Error) throw e
    fallo = e
  }
  if (!fallo) return { ok: true, firma }

  let logs: string[] = []
  for (let intento = 0; intento < 5 && logs.length === 0; intento++) {
    if (intento) await new Promise(r => setTimeout(r, 1500))
    const detalle = await connection.getTransaction(firma, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    logs = detalle?.meta?.logMessages ?? []
  }
  return { ok: false, firma, ...errorDelPrograma(logs) }
}

function errorDelPrograma(logs: string[]): { codigo?: string; mensaje: string } {
  for (const linea of logs) {
    const anchor = linea.match(/Error Code: (\w+)\. Error Number: \d+\. Error Message: (.+)$/)
    if (anchor) return { codigo: anchor[1], mensaje: `${anchor[2].replace(/\.+$/, '')}.` }
    if (linea.includes('already in use')) {
      return { codigo: 'CuentaExistente', mensaje: 'La cuenta ya existe: título repetido o like duplicado.' }
    }
  }
  return { mensaje: 'La transacción falló. Revisa los logs en el Explorer.' }
}

function errorDeWallet(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/reject|cancel/i.test(msg)) return 'Firma cancelada en la wallet.'
  if (/insufficient|debit an account/i.test(msg)) return 'Saldo insuficiente en Devnet. Pide SOL en faucet.solana.com.'
  return msg
}

export async function crearReceta(
  wallet: Firmante,
  datos: { titulo: string; descripcion: string; tiempoMinutos: number; condicionSalud: string },
) {
  const autor = exigirWallet(wallet)
  const tx = await programa.methods
    .crearReceta(datos.titulo, datos.descripcion, datos.tiempoMinutos, datos.condicionSalud)
    .accountsPartial({
      receta: pdaReceta(autor, datos.titulo),
      autor,
      systemProgram: SystemProgram.programId,
    })
    .transaction()
  return enviar(wallet, tx)
}

export async function actualizarReceta(
  wallet: Firmante,
  receta: PublicKey,
  datos: { descripcion: string; tiempoMinutos: number },
) {
  const tx = await programa.methods
    .actualizarReceta(datos.descripcion, datos.tiempoMinutos)
    .accountsPartial({ receta, autor: exigirWallet(wallet) })
    .transaction()
  return enviar(wallet, tx)
}

export async function darLike(wallet: Firmante, receta: PublicKey) {
  const usuario = exigirWallet(wallet)
  const tx = await programa.methods
    .darLike()
    .accountsPartial({
      receta,
      like: pdaLike(usuario, receta),
      usuario,
      systemProgram: SystemProgram.programId,
    })
    .transaction()
  return enviar(wallet, tx)
}

export async function quitarLike(wallet: Firmante, receta: PublicKey) {
  const usuario = exigirWallet(wallet)
  const tx = await programa.methods
    .quitarLike()
    .accountsPartial({ receta, like: pdaLike(usuario, receta), usuario })
    .transaction()
  return enviar(wallet, tx)
}

export async function cerrarReceta(wallet: Firmante, receta: PublicKey) {
  const tx = await programa.methods
    .cerrarReceta()
    .accountsPartial({ receta, autor: exigirWallet(wallet) })
    .transaction()
  return enviar(wallet, tx)
}

export type RecetaOnChain = {
  cuenta: PublicKey
  autor: PublicKey
  titulo: string
  descripcion: string
  tiempoMinutos: number
  condicionSalud: string
  likes: number
  creadaEn: number
}

type RecetaCruda = Omit<RecetaOnChain, 'cuenta' | 'creadaEn'> & { creadaEn: BN }
type LikeCrudo = { usuario: PublicKey; receta: PublicKey }

const cuentas = programa.account as unknown as {
  receta: { all(): Promise<{ publicKey: PublicKey; account: RecetaCruda }[]> }
  like: {
    all(filtros: { memcmp: { offset: number; bytes: string } }[]): Promise<{ account: LikeCrudo }[]>
  }
}

export async function listarRecetas(): Promise<RecetaOnChain[]> {
  const todas = await cuentas.receta.all()
  return todas
    .map(({ publicKey, account }) => ({ ...account, cuenta: publicKey, creadaEn: account.creadaEn.toNumber() }))
    .sort((a, b) => b.creadaEn - a.creadaEn)
}

export async function recetasConMiLike(usuario: PublicKey): Promise<Set<string>> {
  const likes = await cuentas.like.all([{ memcmp: { offset: 8, bytes: usuario.toBase58() } }])
  return new Set(likes.map(l => l.account.receta.toBase58()))
}

export const explorerTx = (firma: string) => `https://explorer.solana.com/tx/${firma}?cluster=devnet`
export const explorerCuenta = (cuenta: string) => `https://explorer.solana.com/address/${cuenta}?cluster=devnet`
