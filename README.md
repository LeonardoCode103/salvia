# Salvia

Aplicación de recetas adaptadas a condiciones de salud (diabetes, hipertensión, colesterol alto,
celiaquía) con un **registro público de recetas en Solana**. Proyecto final del Solana Engineering
Track: Advanced.

- **Ruta elegida:** proyecto propio.
- **Program ID (Devnet):** [`43HQ86bvTfr6n5FLt2RiMBPzzCwAuPtyJSRCrrMcpmjY`](https://explorer.solana.com/address/43HQ86bvTfr6n5FLt2RiMBPzzCwAuPtyJSRCrrMcpmjY?cluster=devnet)
- **Evidencias:** [`evidencias/resultados-devnet.md`](evidencias/resultados-devnet.md)

## Propósito

Salvia genera recetas con IA según la condición de salud de cada persona y permite guardarlas,
planificar la semana y compartirlas con la comunidad. La parte on-chain resuelve un problema
concreto de esa comunidad: saber **quién publicó una receta y cuánta gente la respalda**, sin
depender de la base de datos de la app.

Cada receta publicada en Solana es una cuenta firmada por su autor; cada like es otra cuenta
ligada a esa receta. El programa decide quién puede modificar o cerrar cada cuenta, y una receta
con respaldo de la comunidad no puede borrarse.

## Arquitectura

```
app/onchain/page.tsx          Frontend de la parte Solana (wallet, publicar, like, editar, cerrar)
app/components/
  WalletProviderShell.tsx     Conexión a Devnet y wallets (Wallet Standard: Phantom, Solflare)
  BotonWallet.tsx             Botón de conexión
lib/solana/
  salvia.json                 IDL del programa
  cliente.ts                  Cliente: PDAs, envío de transacciones, lectura de cuentas, errores
solana/                       Workspace Anchor
  programs/salvia/src/lib.rs  Programa
  tests/salvia.ts             Pruebas del programa (anchor test)
  DEPLOY.md                   Cómo compilar y desplegar
scripts/
  verificar.mjs               Comprueba que IDL, programa y Program ID coinciden con Devnet
  evidencias.mjs              Ejecuta los casos de prueba en Devnet y genera el informe
evidencias/                   Resultados y capturas
```

El resto de `app/` es la aplicación off-chain previa (Next.js 16, Supabase y Gemini), que no
forma parte de la evaluación del programa.

## Programa

Anchor 0.30, escrito para este proyecto (no parte del template del curso).

### Cuentas

| Cuenta | Semillas de la PDA | Campos |
|---|---|---|
| `Receta` | `"receta"`, autor, título | autor, título, descripción, tiempo_minutos, condicion_salud, likes, creada_en, bump |
| `Like` | `"like"`, usuario, receta | usuario, receta, creado_en, bump |

`Like` depende de `Receta`: su semilla incluye la dirección de la receta y su campo `receta`
la referencia. Como la semilla incluye al usuario, cada wallet puede dar como máximo un like
por receta.

### Instrucciones

| Instrucción | Firma | Efecto |
|---|---|---|
| `crear_receta(titulo, descripcion, tiempo_minutos, condicion_salud)` | autor | Crea `Receta` con `likes = 0`. El autor paga la renta. |
| `actualizar_receta(descripcion, tiempo_minutos)` | autor | Modifica la misma cuenta `Receta`. |
| `dar_like()` | usuario | Crea `Like` e incrementa `Receta.likes`. |
| `quitar_like()` | usuario | Cierra `Like` (la renta vuelve al usuario) y decrementa `Receta.likes`. |
| `cerrar_receta()` | autor | Cierra `Receta` y devuelve la renta al autor. |

### Reglas que aplica el programa

| Regla | Dónde | Error |
|---|---|---|
| Solo el autor modifica o cierra su receta | `has_one = autor` en `ActualizarReceta` y `CerrarReceta` | `NoEresAutor` |
| Solo quien dio el like puede retirarlo | `has_one = usuario` en `QuitarLike` | `NoEresDuenoDelLike` |
| El like debe pertenecer a la receta indicada | `has_one = receta` en `QuitarLike` | `LikeDeOtraReceta` |
| Una receta con likes no puede cerrarse | `constraint = receta.likes == 0` en `CerrarReceta` | `RecetaConLikes` |
| El autor no puede darse like | `require_keys_neq!` en `dar_like` | `LikePropio` |
| Condición de salud dentro de una lista cerrada | `crear_receta` | `CondicionInvalida` |
| Título de 1 a 32 bytes, descripción ≤ 200 bytes, tiempo de 1 a 600 min | `crear_receta`, `actualizar_receta` | `TituloVacio`, `TituloMuyLargo`, `DescripcionMuyLarga`, `TiempoInvalido` |

Todas las cuentas se validan además con sus semillas y `bump` guardado, de modo que no se
puede sustituir una `Receta` o un `Like` por otra cuenta del mismo tipo.

## Aporte propio

- **Modelo y caso de uso propios.** Dos cuentas relacionadas por PDA (`Receta` y `Like`) en lugar
  del registro de ventas del proyecto guiado.
- **Cierre condicionado con una razón de negocio.** Exigir `likes == 0` impide borrar recetas que la
  comunidad respalda y garantiza además que nunca queden cuentas `Like` apuntando a una receta
  cerrada.
- **Una regla nueva con su caso de rechazo:** el autor no puede darse like a sí mismo (`LikePropio`).
- **Errores de pertenencia distinguibles.** Las semillas de `Like` se derivan de sus propios campos
  y la relación se comprueba con `has_one`, así que pasar el like de otra receta devuelve
  `LikeDeOtraReceta` en lugar de un error genérico de semillas.
- **Integración en una app existente.** La parte on-chain se añadió a Salvia como una capa opcional:
  se puede usar sin cuenta de Salvia y sin Supabase, solo con una wallet.
- **Rechazos verificables.** El cliente envía las transacciones sin preflight, de modo que cuando el
  programa rechaza una operación queda una transacción fallida consultable en el Explorer, con el
  código de error en los logs. `pnpm evidencias` recorre todos los casos con dos wallets y genera el
  informe con sus firmas.

## Configuración

Requisitos: Node.js 20 o superior, pnpm 9 o superior y una wallet de Solana (Phantom o Solflare)
configurada en **Devnet** con saldo de prueba ([faucet.solana.com](https://faucet.solana.com)).

```bash
cp .env.example .env.local
```

Las variables de `.env.example` solo son necesarias para la parte off-chain (inicio de sesión con
Supabase e IA con Gemini). **La ruta `/onchain` funciona sin ellas.**

## Ejecución

```bash
pnpm install
pnpm dev
```

Abre <http://localhost:3000/onchain> y conecta la wallet.

Para compilar y desplegar el programa (Solana Playground o Anchor CLI) consulta
[`solana/DEPLOY.md`](solana/DEPLOY.md). Después de desplegar:

```bash
pnpm verificar
```

comprueba que el Program ID es el mismo en `lib.rs`, `Anchor.toml` y el IDL, que los
discriminadores del IDL son correctos y que el programa está desplegado y es ejecutable en Devnet.

## Cómo probarlo

### Recorrido manual

Usa dos cuentas de la wallet (A y B), ambas con SOL de Devnet.

1. Con A, publica una receta. Aparece en la lista con 0 likes; el aviso enlaza la transacción.
2. Con A, pulsa **Editar**, cambia la descripción y el tiempo, y guarda.
3. Con A, pulsa **Like** en tu propia receta → rechazo `LikePropio`.
4. Cambia a B. Pulsa **Editar** o **Cerrar** en la receta de A → rechazo `NoEresAutor`.
5. Con B, pulsa **Like** en la receta de A → la receta pasa a 1 like.
6. Vuelve a A y pulsa **Cerrar** → rechazo `RecetaConLikes`; la receta sigue en la lista.
7. Con B, pulsa **Quitar like**. Con A, pulsa **Cerrar** → la receta desaparece y la renta vuelve a A.

La interfaz no bloquea ninguna de estas acciones: la decisión la toma el programa. Todas quedan
en la sección **Transacciones de esta sesión**, con enlace al Explorer.

### Recorrido automático en Devnet

```bash
pnpm evidencias
```

Crea dos wallets de prueba en `.wallets/` (excluidas del repositorio), solicita SOL de Devnet,
ejecuta los casos de la tabla siguiente y escribe el resultado en
[`evidencias/resultados-devnet.md`](evidencias/resultados-devnet.md), con los cuatro datos que
pide cada caso: estado inicial, operación y resultado esperado, resultado observado en las
cuentas, y firma o error. Si el airdrop está limitado, el script indica la dirección a la que
hay que enviar SOL desde el faucet.

### Pruebas del programa

```bash
cd solana
anchor test
```

## Correspondencia con Pruebas y evidencias

| Caso del proyecto guiado | Caso equivalente en Salvia | Instrucción | Resultado esperado |
|---|---|---|---|
| Crear Registro y Cliente; leer cuentas | Publicar una receta y leerla sin firma | `crear_receta`, lectura RPC | `Receta` creada con `likes = 0` |
| Registrar una venta válida | Dar like a una receta ajena | `dar_like` | `Like` creada, `Receta.likes` + 1 |
| Corregir el importe | Editar la receta | `actualizar_receta` | Misma cuenta, datos nuevos |
| Devolución válida | Quitar el like | `quitar_like` | `Like` cerrada, `Receta.likes` − 1 |
| Baja de cliente vacío | Cerrar una receta sin likes | `cerrar_receta` | `Receta` cerrada, renta al autor |
| Wallet no autorizada | Otra wallet edita o cierra la receta | `actualizar_receta`, `cerrar_receta` | `NoEresAutor`, datos sin cambios |
| Venta ajena al cliente | Quitar un like indicando otra receta | `quitar_like` | `LikeDeOtraReceta`, cuentas sin cambios |
| Baja de cliente con ventas activas | Cerrar una receta con likes | `cerrar_receta` | `RecetaConLikes`, receta y like se conservan |
| Regla nueva (aporte) | El autor se da like | `dar_like` | `LikePropio`, sin cuenta `Like` |

## Identificación

- Nombre para el certificado: _pendiente_
- Correo de registro: _pendiente_
