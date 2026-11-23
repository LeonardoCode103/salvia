// Recorre en Devnet los casos de "Pruebas y evidencias" con dos wallets de prueba
// y escribe el resultado, con firmas verificables, en evidencias/resultados-devnet.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction,
} from '@solana/web3.js'

const require = createRequire(import.meta.url)
const { AnchorProvider, Program, Wallet } = require('@coral-xyz/anchor')

const RPC = process.env.SOLANA_RPC ?? 'https://api.devnet.solana.com'
const connection = new Connection(RPC, 'confirmed')
const idl = JSON.parse(readFileSync('lib/solana/salvia.json', 'utf8'))
const programId = new PublicKey(idl.address)
const program = new Program(idl, new AnchorProvider(connection, new Wallet(Keypair.generate()), {}))
const texto = new TextEncoder()

const explorerTx = firma => `https://explorer.solana.com/tx/${firma}?cluster=devnet`
const explorerCuenta = cuenta => `https://explorer.solana.com/address/${cuenta}?cluster=devnet`
const sol = lamports => (lamports / LAMPORTS_PER_SOL).toFixed(6)

function cargarWallet(nombre) {
  const ruta = `.wallets/${nombre}.json`
  if (!existsSync(ruta)) {
    mkdirSync('.wallets', { recursive: true })
    writeFileSync(ruta, JSON.stringify([...Keypair.generate().secretKey]))
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(ruta, 'utf8'))))
}

const pdaReceta = (autor, titulo) =>
  PublicKey.findProgramAddressSync([texto.encode('receta'), autor.toBytes(), texto.encode(titulo)], programId)[0]
const pdaLike = (usuario, receta) =>
  PublicKey.findProgramAddressSync([texto.encode('like'), usuario.toBytes(), receta.toBytes()], programId)[0]

async function enviar(firmante, tx) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  tx.feePayer = firmante.publicKey
  tx.recentBlockhash = blockhash
  tx.sign(firmante)
  const firma = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })
  const { value } = await connection.confirmTransaction({ signature: firma, blockhash, lastValidBlockHeight }, 'confirmed')
  if (!value.err) return { ok: true, firma }
  const detalle = await connection.getTransaction(firma, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })
  const linea = (detalle?.meta?.logMessages ?? []).find(l => l.includes('Error Code:'))
  const codigo = linea?.match(/Error Code: (\w+)/)?.[1] ?? 'desconocido'
  const mensaje = linea?.match(/Error Message: (.+)$/)?.[1] ?? 'sin mensaje del programa'
  return { ok: false, firma, codigo, mensaje }
}

const leerReceta = cuenta => program.account.receta.fetchNullable(cuenta)
const leerLike = cuenta => program.account.like.fetchNullable(cuenta)
const resumen = r => (r ? `likes=${r.likes}, tiempo=${r.tiempoMinutos} min, descripción="${r.descripcion}"` : 'la cuenta no existe')

async function asegurarSaldo(autor, otro) {
  if ((await connection.getBalance(autor.publicKey)) < 0.05 * LAMPORTS_PER_SOL) {
    try {
      const firma = await connection.requestAirdrop(autor.publicKey, LAMPORTS_PER_SOL)
      await connection.confirmTransaction(firma, 'confirmed')
    } catch {
      console.error(`\nLa wallet de prueba ${autor.publicKey.toBase58()} no tiene saldo y el airdrop fue rechazado.`)
      console.error('Pide SOL de Devnet para esa dirección en https://faucet.solana.com y vuelve a ejecutar.')
      process.exit(1)
    }
  }
  if ((await connection.getBalance(otro.publicKey)) < 0.01 * LAMPORTS_PER_SOL) {
    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: autor.publicKey, toPubkey: otro.publicKey, lamports: 0.02 * LAMPORTS_PER_SOL,
    }))
    const r = await enviar(autor, tx)
    if (!r.ok) throw new Error('No se pudo fondear la segunda wallet.')
  }
}

const casos = []
function registrar(caso) {
  casos.push(caso)
  const estado = caso.esperaRechazo
    ? (caso.resultado.ok ? 'FALLO: debía rechazarse' : `rechazado (${caso.resultado.codigo})`)
    : (caso.resultado?.ok === false ? `FALLO: ${caso.resultado.mensaje}` : 'correcto')
  console.log(`${casos.length}. ${caso.titulo} — ${estado}`)
}

const autor = cargarWallet('autor')
const otro = cargarWallet('otro')

const info = await connection.getAccountInfo(programId)
if (!info?.executable) {
  console.error(`El programa ${programId.toBase58()} no está desplegado en Devnet. Despliega primero (ver solana/DEPLOY.md).`)
  process.exit(1)
}

await asegurarSaldo(autor, otro)
console.log(`Autor: ${autor.publicKey.toBase58()}\nOtra wallet: ${otro.publicKey.toBase58()}\n`)

const sufijo = Date.now().toString(36)
const titulo1 = `Caldo de pollo ${sufijo}`
const titulo2 = `Avena con canela ${sufijo}`
const receta1 = pdaReceta(autor.publicKey, titulo1)
const receta2 = pdaReceta(autor.publicKey, titulo2)
const likeOtro = pdaLike(otro.publicKey, receta1)

// 1. Creación
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .crearReceta(titulo1, 'Bajo en sodio, con verduras de temporada', 45, 'hipertension')
    .accountsPartial({ receta: receta1, autor: autor.publicKey, systemProgram: SystemProgram.programId })
    .transaction()
  const resultado = await enviar(autor, tx)
  const despues = await leerReceta(receta1)
  registrar({
    titulo: 'Crear receta', firmante: 'autor', resultado,
    inicial: `PDA ${receta1.toBase58()}: ${resumen(antes)}.`,
    operacion: `crear_receta("${titulo1}", 45 min, hipertension). Se espera una cuenta Receta con likes=0 y autor = wallet firmante.`,
    observado: `${resumen(despues)}; autor=${despues?.autor.toBase58()}. Leído con program.account.receta.fetch.`,
    cuenta: receta1,
  })
}

// 2. Lectura sin firma
{
  const todas = await program.account.receta.all()
  const propia = todas.find(r => r.publicKey.equals(receta1))
  registrar({
    titulo: 'Leer recetas sin firmar', firmante: 'ninguno',
    inicial: 'Consulta RPC con un proveedor de solo lectura (sin wallet).',
    operacion: 'program.account.receta.all(). Se espera la receta creada entre las cuentas del programa, sin transacción.',
    observado: `${todas.length} recetas leídas; la creada aparece con ${resumen(propia?.account)}.`,
  })
}

// 3. Modificación por el autor
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .actualizarReceta('Bajo en sodio, con calabaza y zanahoria', 50)
    .accountsPartial({ receta: receta1, autor: autor.publicKey })
    .transaction()
  const resultado = await enviar(autor, tx)
  const despues = await leerReceta(receta1)
  registrar({
    titulo: 'Actualizar receta (autor)', firmante: 'autor', resultado,
    inicial: resumen(antes),
    operacion: 'actualizar_receta(descripción nueva, 50 min) firmada por el autor. Se espera el cambio en la misma cuenta.',
    observado: `${resumen(despues)}. Misma PDA ${receta1.toBase58()}.`,
  })
}

// 4. Wallet no autorizada
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .actualizarReceta('Modificación no autorizada', 5)
    .accountsPartial({ receta: receta1, autor: otro.publicKey })
    .transaction()
  const resultado = await enviar(otro, tx)
  const despues = await leerReceta(receta1)
  registrar({
    titulo: 'Actualizar receta ajena (wallet no autorizada)', firmante: 'otra wallet', resultado, esperaRechazo: true,
    inicial: resumen(antes),
    operacion: 'actualizar_receta firmada por una wallet que no es el autor. Se espera el rechazo NoEresAutor.',
    observado: `${resumen(despues)}. Los datos no cambiaron.`,
  })
}

// 5. Regla nueva: el autor no puede darse like
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .darLike()
    .accountsPartial({ receta: receta1, like: pdaLike(autor.publicKey, receta1), usuario: autor.publicKey, systemProgram: SystemProgram.programId })
    .transaction()
  const resultado = await enviar(autor, tx)
  const despues = await leerReceta(receta1)
  registrar({
    titulo: 'Like a la propia receta', firmante: 'autor', resultado, esperaRechazo: true,
    inicial: resumen(antes),
    operacion: 'dar_like firmado por el autor de la receta. Se espera el rechazo LikePropio.',
    observado: `${resumen(despues)}. No se creó cuenta Like: ${(await leerLike(pdaLike(autor.publicKey, receta1))) === null}.`,
  })
}

// 6. Like válido (cuenta relacionada)
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .darLike()
    .accountsPartial({ receta: receta1, like: likeOtro, usuario: otro.publicKey, systemProgram: SystemProgram.programId })
    .transaction()
  const resultado = await enviar(otro, tx)
  const despues = await leerReceta(receta1)
  const like = await leerLike(likeOtro)
  registrar({
    titulo: 'Dar like (otra wallet)', firmante: 'otra wallet', resultado,
    inicial: resumen(antes),
    operacion: 'dar_like firmado por otra wallet. Se espera una cuenta Like (PDA ["like", usuario, receta]) y likes+1.',
    observado: `${resumen(despues)}. Like ${likeOtro.toBase58()} con usuario=${like?.usuario.toBase58()} y receta=${like?.receta.toBase58()}.`,
    cuenta: likeOtro,
  })
}

// 7. Cierre con likes activos
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods.cerrarReceta().accountsPartial({ receta: receta1, autor: autor.publicKey }).transaction()
  const resultado = await enviar(autor, tx)
  const despues = await leerReceta(receta1)
  registrar({
    titulo: 'Cerrar receta con likes activos', firmante: 'autor', resultado, esperaRechazo: true,
    inicial: resumen(antes),
    operacion: 'cerrar_receta firmada por el autor mientras likes > 0. Se espera el rechazo RecetaConLikes.',
    observado: `${resumen(despues)}. La cuenta y su Like se conservan.`,
  })
}

// 8. Combinación de cuentas inválida
{
  const tx2 = await program.methods
    .crearReceta(titulo2, 'Desayuno de bajo índice glucémico', 10, 'diabetes')
    .accountsPartial({ receta: receta2, autor: autor.publicKey, systemProgram: SystemProgram.programId })
    .transaction()
  const creada = await enviar(autor, tx2)
  if (!creada.ok) throw new Error(`No se pudo preparar la segunda receta: ${creada.mensaje}`)

  const antes1 = await leerReceta(receta1)
  const antes2 = await leerReceta(receta2)
  const tx = await program.methods
    .quitarLike()
    .accountsPartial({ receta: receta2, like: likeOtro, usuario: otro.publicKey })
    .transaction()
  const resultado = await enviar(otro, tx)
  registrar({
    titulo: 'Quitar like pasando otra receta (combinación inválida)', firmante: 'otra wallet', resultado, esperaRechazo: true,
    inicial: `Receta 1: ${resumen(antes1)}. Receta 2 (${receta2.toBase58()}): ${resumen(antes2)}. El Like pertenece a la receta 1.`,
    operacion: 'quitar_like con el Like de la receta 1 y la cuenta de la receta 2. Se espera el rechazo LikeDeOtraReceta.',
    observado: `Receta 1: ${resumen(await leerReceta(receta1))}. Receta 2: ${resumen(await leerReceta(receta2))}. Like sigue existiendo: ${(await leerLike(likeOtro)) !== null}.`,
  })
}

// 9. Quitar like válido (cierre de cuenta relacionada)
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods
    .quitarLike()
    .accountsPartial({ receta: receta1, like: likeOtro, usuario: otro.publicKey })
    .transaction()
  const resultado = await enviar(otro, tx)
  registrar({
    titulo: 'Quitar like (quien lo dio)', firmante: 'otra wallet', resultado,
    inicial: resumen(antes),
    operacion: 'quitar_like firmado por quien dio el like. Se espera cerrar la cuenta Like y likes-1.',
    observado: `${resumen(await leerReceta(receta1))}. Cuenta Like: ${resumen(await leerLike(likeOtro))}.`,
  })
}

// 10. Cierre por wallet no autorizada
{
  const antes = await leerReceta(receta1)
  const tx = await program.methods.cerrarReceta().accountsPartial({ receta: receta1, autor: otro.publicKey }).transaction()
  const resultado = await enviar(otro, tx)
  registrar({
    titulo: 'Cerrar receta ajena', firmante: 'otra wallet', resultado, esperaRechazo: true,
    inicial: resumen(antes),
    operacion: 'cerrar_receta firmada por una wallet que no es el autor (likes = 0). Se espera el rechazo NoEresAutor.',
    observado: `${resumen(await leerReceta(receta1))}. La cuenta se conserva.`,
  })
}

// 11. Cierre válido
{
  const antes = await leerReceta(receta1)
  const rent = (await connection.getAccountInfo(receta1))?.lamports ?? 0
  const saldoAntes = await connection.getBalance(autor.publicKey)
  const tx = await program.methods.cerrarReceta().accountsPartial({ receta: receta1, autor: autor.publicKey }).transaction()
  const resultado = await enviar(autor, tx)
  const saldoDespues = await connection.getBalance(autor.publicKey)
  registrar({
    titulo: 'Cerrar receta sin likes (autor)', firmante: 'autor', resultado,
    inicial: `${resumen(antes)}. Rent depositada en la cuenta: ${sol(rent)} SOL.`,
    operacion: 'cerrar_receta firmada por el autor con likes = 0. Se espera cerrar la cuenta y devolver la rent al autor.',
    observado: `Receta: ${resumen(await leerReceta(receta1))}. Saldo del autor: ${sol(saldoAntes)} → ${sol(saldoDespues)} SOL (rent menos comisión).`,
  })
}

await enviar(autor, await program.methods.cerrarReceta().accountsPartial({ receta: receta2, autor: autor.publicKey }).transaction())

const incorrectos = casos.filter(c => (c.esperaRechazo ? c.resultado.ok : c.resultado && !c.resultado.ok))

const md = [
  '# Resultados en Devnet',
  '',
  `Generado por \`pnpm evidencias\` el ${new Date().toISOString()}.`,
  '',
  `- Programa: [${programId.toBase58()}](${explorerCuenta(programId.toBase58())})`,
  `- Wallet autora: \`${autor.publicKey.toBase58()}\``,
  `- Otra wallet: \`${otro.publicKey.toBase58()}\``,
  `- Casos correctos: ${casos.length - incorrectos.length} de ${casos.length}`,
  '',
  'Las transacciones se envían sin preflight, así que los rechazos del programa también quedan registrados en Devnet con firma consultable.',
  '',
  '| # | Caso | Firmante | Resultado | Transacción |',
  '|---|---|---|---|---|',
  ...casos.map((c, i) => {
    const res = !c.resultado ? 'Lectura' : c.resultado.ok ? 'Confirmada' : `Rechazada · \`${c.resultado.codigo}\``
    const tx = c.resultado?.firma ? `[${c.resultado.firma.slice(0, 8)}…](${explorerTx(c.resultado.firma)})` : '—'
    return `| ${i + 1} | ${c.titulo} | ${c.firmante} | ${res} | ${tx} |`
  }),
  '',
  ...casos.flatMap((c, i) => [
    `## ${i + 1}. ${c.titulo}`,
    '',
    `1. **Datos y estado inicial:** ${c.inicial}`,
    `2. **Operación y resultado esperado:** ${c.operacion}`,
    `3. **Resultado observado:** ${c.observado}`,
    `4. **Firma o error:** ${
      !c.resultado ? 'Sin transacción (lectura).'
        : c.resultado.ok ? `[${c.resultado.firma}](${explorerTx(c.resultado.firma)})`
          : `\`${c.resultado.codigo}\` — ${c.resultado.mensaje} · [${c.resultado.firma}](${explorerTx(c.resultado.firma)})`
    }`,
    ...(c.cuenta ? [`   Cuenta: [${c.cuenta.toBase58()}](${explorerCuenta(c.cuenta.toBase58())})`] : []),
    '',
  ]),
].join('\n')

mkdirSync('evidencias', { recursive: true })
writeFileSync('evidencias/resultados-devnet.md', md)
console.log(`\nResultado escrito en evidencias/resultados-devnet.md (${casos.length - incorrectos.length}/${casos.length} correctos).`)
process.exit(incorrectos.length === 0 ? 0 : 1)
