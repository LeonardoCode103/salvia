# Evidencias

- [`resultados-devnet.md`](resultados-devnet.md): generado por `pnpm evidencias`. Cada caso incluye
  su estado inicial, la operación y el resultado esperado, el resultado observado en las cuentas
  y la firma o el error, con enlace al Explorer de Devnet.

## Capturas

| Archivo | Qué muestra |
|---|---|
| [`01-onchain-lectura.jpg`](capturas/01-onchain-lectura.jpg) | `/onchain` leyendo del programa desplegado, sin wallet: la receta que deja el recorrido automático, con 1 like de otra wallet |
| [`02-explorer-crear-receta.jpg`](capturas/02-explorer-crear-receta.jpg) | Transacción `crear_receta` confirmada en Devnet (caso 1) |
| [`03-explorer-rechazo-resumen.jpg`](capturas/03-explorer-rechazo-resumen.jpg) | Transacción `cerrar_receta` rechazada por el programa (caso 7) |
| [`04-explorer-rechazo-logs.jpg`](capturas/04-explorer-rechazo-logs.jpg) | Logs del mismo rechazo: `Error Code: RecetaConLikes. Error Number: 6009` |

Las capturas no muestran claves privadas ni datos personales.
