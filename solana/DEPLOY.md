# Compilar y desplegar el programa en Devnet

## Opción A: Solana Playground (sin instalar nada)

1. Abre <https://beta.solpg.io> y crea un proyecto nuevo con el framework **Anchor**.
2. Sustituye el contenido de `src/lib.rs` por el de [`programs/salvia/src/lib.rs`](programs/salvia/src/lib.rs).
3. En la esquina inferior izquierda, conecta la wallet de Playground (la crea si no existe).
   Comprueba que el endpoint sea **Devnet**.
4. Pide saldo en <https://faucet.solana.com> (red Devnet) para la dirección de la wallet de
   Playground; el despliegue usa unos 1.5 SOL. El airdrop desde la terminal (`solana airdrop`)
   ya no funciona en Devnet: el RPC responde que el faucet está cerrado.
5. En la pestaña **Build & Deploy**, pulsa **Build** y después **Deploy**.
6. Copia el **Program ID** que muestra la pestaña.
7. Si la pestaña ofrece exportar el IDL, guárdalo: debe coincidir con [`../lib/solana/salvia.json`](../lib/solana/salvia.json).

## Opción B: Anchor CLI (Linux, macOS o WSL)

Requisitos: Rust, Solana CLI 1.18+ y Anchor 0.30.1.

```bash
cd solana
solana config set --url devnet
anchor keys sync          # usa la keypair local del programa y actualiza declare_id! y Anchor.toml
anchor build
anchor deploy --provider.cluster devnet
cp target/idl/salvia.json ../lib/solana/salvia.json
```

## Después de desplegar

El Program ID debe ser el mismo en tres lugares:

- `solana/programs/salvia/src/lib.rs` → `declare_id!("...")`
- `solana/Anchor.toml` → `[programs.devnet]` y `[programs.localnet]`
- `lib/solana/salvia.json` → `"address"`

Luego, desde la raíz del repositorio:

```bash
pnpm verificar     # comprueba Program ID, discriminadores y despliegue
pnpm evidencias    # ejecuta los casos en Devnet y genera evidencias/resultados-devnet.md
```
