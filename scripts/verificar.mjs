// Comprueba que el Program ID coincide en programa, Anchor.toml e IDL,
// que el IDL tiene los discriminadores correctos y que el programa está desplegado en Devnet.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'

const require = createRequire(import.meta.url)
const { AnchorProvider, Program, Wallet } = require('@coral-xyz/anchor')

const RPC = process.env.SOLANA_RPC ?? 'https://api.devnet.solana.com'
const idl = JSON.parse(readFileSync('lib/solana/salvia.json', 'utf8'))
const libRs = readFileSync('solana/programs/salvia/src/lib.rs', 'utf8')
const anchorToml = readFileSync('solana/Anchor.toml', 'utf8')

let fallos = 0
const comprobar = (ok, texto) => {
  console.log(`${ok ? '✓' : '✗'} ${texto}`)
  if (!ok) fallos++
}

const idDeclarado = libRs.match(/declare_id!\("(\w+)"\)/)?.[1]
const idToml = anchorToml.match(/\[programs\.devnet\][^[]*salvia\s*=\s*"(\w+)"/)?.[1]

comprobar(idDeclarado === idl.address, `declare_id! (${idDeclarado}) coincide con el IDL (${idl.address})`)
comprobar(idToml === idl.address, `Anchor.toml [programs.devnet] (${idToml}) coincide con el IDL`)

const disc = prefijo => [...createHash('sha256').update(prefijo).digest().subarray(0, 8)]
for (const ix of idl.instructions) {
  comprobar(
    JSON.stringify(ix.discriminator) === JSON.stringify(disc(`global:${ix.name}`)),
    `discriminador de la instrucción ${ix.name}`,
  )
}
for (const cuenta of idl.accounts) {
  comprobar(
    JSON.stringify(cuenta.discriminator) === JSON.stringify(disc(`account:${cuenta.name}`)),
    `discriminador de la cuenta ${cuenta.name}`,
  )
}

const connection = new Connection(RPC, 'confirmed')
const programId = new PublicKey(idl.address)
const info = await connection.getAccountInfo(programId)
comprobar(info?.executable === true, `el programa ${idl.address} está desplegado y es ejecutable en Devnet`)

if (info?.executable) {
  const provider = new AnchorProvider(connection, new Wallet(Keypair.generate()), {})
  const idlOnChain = await Program.fetchIdl(programId, provider).catch(() => null)
  if (idlOnChain) {
    const firma = i => i.instructions.map(ix => `${ix.name}:${ix.discriminator}`).sort().join('|')
    comprobar(firma(idlOnChain) === firma(idl), 'el IDL publicado on-chain coincide con lib/solana/salvia.json')
  } else {
    console.log('· El IDL no está publicado on-chain; se omite la comparación.')
  }
}

console.log(fallos === 0 ? '\nTodo coincide.' : `\n${fallos} comprobación(es) fallida(s).`)
process.exit(fallos === 0 ? 0 : 1)
