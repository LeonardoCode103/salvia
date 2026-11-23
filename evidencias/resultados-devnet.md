# Resultados en Devnet

Generado por `pnpm evidencias` el 2026-11-23T03:03:44.595Z.

- Programa: [43HQ86bvTfr6n5FLt2RiMBPzzCwAuPtyJSRCrrMcpmjY](https://explorer.solana.com/address/43HQ86bvTfr6n5FLt2RiMBPzzCwAuPtyJSRCrrMcpmjY?cluster=devnet)
- Wallet autora: `6116qcMLkC5PtWGn8z3ojpwcZxLti5csKCK6taB6uTey`
- Otra wallet: `85RWKzcSDdomS3aMtsGuAXvKgSJXEFeVC3KffBYKrvJZ`
- Casos correctos: 11 de 11
- Estado final: la receta [«Avena con canela mwsokk87»](https://explorer.solana.com/address/43TXUAnRtm8gdjeUaU9zrZk92a9XPycx5PKxbubTSobo?cluster=devnet) queda publicada (likes=1, tiempo=10 min, descripción="Desayuno de bajo índice glucémico") y se puede ver en `/onchain`.

Las transacciones se envían sin preflight, así que los rechazos del programa también quedan registrados en Devnet con firma consultable.

| # | Caso | Firmante | Resultado | Transacción |
|---|---|---|---|---|
| 1 | Crear receta | autor | Confirmada | [23xpomr8…](https://explorer.solana.com/tx/23xpomr8PMHsQRyjZGB79jyXhTr7kTfKq9AtdPsY1mA3R7v1qgefVV6tMndpifD1tURd3iZoNnYuKFQ3CS3vwYz2?cluster=devnet) |
| 2 | Leer recetas sin firmar | ninguno | Lectura | — |
| 3 | Actualizar receta (autor) | autor | Confirmada | [26KS3psy…](https://explorer.solana.com/tx/26KS3psyqDb9ktXzZjU1pNHZMve4YPyThSFXKr4KiJXXPxUojTi34DQHj2hTa4v8j857Jn94aoQZJLDcvdPncJva?cluster=devnet) |
| 4 | Actualizar receta ajena (wallet no autorizada) | otra wallet | Rechazada · `NoEresAutor` | [5BGfRJYQ…](https://explorer.solana.com/tx/5BGfRJYQqnd3y6vqgsa9DPGABty6thETEtQbLiphoUefocutMXpDpjzMUNynua3bjy2qzFbSxrQhFHGN3bm6nQsU?cluster=devnet) |
| 5 | Like a la propia receta | autor | Rechazada · `LikePropio` | [2H4p6e6A…](https://explorer.solana.com/tx/2H4p6e6AqFZxL4oBdQGSfWjMvBu8vfbT9MavmkDSBQfzJCA9iTsLngEAtVVgwV4UPjUTAvizoWhjbazVKQnLnefR?cluster=devnet) |
| 6 | Dar like (otra wallet) | otra wallet | Confirmada | [nz9S1v4z…](https://explorer.solana.com/tx/nz9S1v4zMCdPgVAt5oz4f6w2VgB4ztUefyafpViR9Qb1udqp8NnJc6Xy14QH4aCWTzH8XW6LA6k1rjmvj4NKepo?cluster=devnet) |
| 7 | Cerrar receta con likes activos | autor | Rechazada · `RecetaConLikes` | [5R3yrdA7…](https://explorer.solana.com/tx/5R3yrdA7mE3WfnpNGFw1iQ4jr5R954wgGmef7v62VLEHxU1CPw2xEYJMRKQcZ53tuxBDEJr4EpjvdkpG3MkkGFmp?cluster=devnet) |
| 8 | Quitar like pasando otra receta (combinación inválida) | otra wallet | Rechazada · `LikeDeOtraReceta` | [vDM8iCn6…](https://explorer.solana.com/tx/vDM8iCn6gWfLHoCVB4hWzQZyTNqL78qXq5QYyYc3mdPLRG6npFjnJbgCfdwrEHRwq8NVRsYnaDSX1pqwZsJ7vL5?cluster=devnet) |
| 9 | Quitar like (quien lo dio) | otra wallet | Confirmada | [3MmbXxYb…](https://explorer.solana.com/tx/3MmbXxYbZWRLodi2ayeW6CCFhwBoxWVfEYZZc23fUvf91QjgXvpkGVUPdtXp4osLu9Lg5vhDke3cTVpXrFfgfbcm?cluster=devnet) |
| 10 | Cerrar receta ajena | otra wallet | Rechazada · `NoEresAutor` | [5RnQy4Gt…](https://explorer.solana.com/tx/5RnQy4GtPEfe1Xv79Xf9A21vWtw5egonqvDcQFeCRPXPcss4gyCBgiuS494vdShzcezWjEiiQnU8ajMTK6oo1EUq?cluster=devnet) |
| 11 | Cerrar receta sin likes (autor) | autor | Confirmada | [2onnhGyD…](https://explorer.solana.com/tx/2onnhGyD344AhtzDPrPb9V4J95nguPgURBXc4sKvjSjsPsP8A7m4EbaQAjwiqT3B78TKExCyoLk7PCvTTGW4nup2?cluster=devnet) |

## 1. Crear receta

1. **Datos y estado inicial:** PDA tvRtfoeQJfqdbtUYwHy7G4Do2srhDV4h1DXoRvAu9JN: la cuenta no existe.
2. **Operación y resultado esperado:** crear_receta("Caldo de pollo mwsokk87", 45 min, hipertension). Se espera una cuenta Receta con likes=0 y autor = wallet firmante.
3. **Resultado observado:** likes=0, tiempo=45 min, descripción="Bajo en sodio, con verduras de temporada"; autor=6116qcMLkC5PtWGn8z3ojpwcZxLti5csKCK6taB6uTey. Leído con program.account.receta.fetch.
4. **Firma o error:** [23xpomr8PMHsQRyjZGB79jyXhTr7kTfKq9AtdPsY1mA3R7v1qgefVV6tMndpifD1tURd3iZoNnYuKFQ3CS3vwYz2](https://explorer.solana.com/tx/23xpomr8PMHsQRyjZGB79jyXhTr7kTfKq9AtdPsY1mA3R7v1qgefVV6tMndpifD1tURd3iZoNnYuKFQ3CS3vwYz2?cluster=devnet)
   Cuenta: [tvRtfoeQJfqdbtUYwHy7G4Do2srhDV4h1DXoRvAu9JN](https://explorer.solana.com/address/tvRtfoeQJfqdbtUYwHy7G4Do2srhDV4h1DXoRvAu9JN?cluster=devnet)

## 2. Leer recetas sin firmar

1. **Datos y estado inicial:** Consulta RPC con un proveedor de solo lectura (sin wallet).
2. **Operación y resultado esperado:** program.account.receta.all(). Se espera la receta creada entre las cuentas del programa, sin transacción.
3. **Resultado observado:** 4 recetas leídas; la creada aparece con likes=0, tiempo=45 min, descripción="Bajo en sodio, con verduras de temporada".
4. **Firma o error:** Sin transacción (lectura).

## 3. Actualizar receta (autor)

1. **Datos y estado inicial:** likes=0, tiempo=45 min, descripción="Bajo en sodio, con verduras de temporada"
2. **Operación y resultado esperado:** actualizar_receta(descripción nueva, 50 min) firmada por el autor. Se espera el cambio en la misma cuenta.
3. **Resultado observado:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Misma PDA tvRtfoeQJfqdbtUYwHy7G4Do2srhDV4h1DXoRvAu9JN.
4. **Firma o error:** [26KS3psyqDb9ktXzZjU1pNHZMve4YPyThSFXKr4KiJXXPxUojTi34DQHj2hTa4v8j857Jn94aoQZJLDcvdPncJva](https://explorer.solana.com/tx/26KS3psyqDb9ktXzZjU1pNHZMve4YPyThSFXKr4KiJXXPxUojTi34DQHj2hTa4v8j857Jn94aoQZJLDcvdPncJva?cluster=devnet)

## 4. Actualizar receta ajena (wallet no autorizada)

1. **Datos y estado inicial:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** actualizar_receta firmada por una wallet que no es el autor. Se espera el rechazo NoEresAutor.
3. **Resultado observado:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Los datos no cambiaron.
4. **Firma o error:** `NoEresAutor` — Solo el autor puede modificar o cerrar esta receta. · [5BGfRJYQqnd3y6vqgsa9DPGABty6thETEtQbLiphoUefocutMXpDpjzMUNynua3bjy2qzFbSxrQhFHGN3bm6nQsU](https://explorer.solana.com/tx/5BGfRJYQqnd3y6vqgsa9DPGABty6thETEtQbLiphoUefocutMXpDpjzMUNynua3bjy2qzFbSxrQhFHGN3bm6nQsU?cluster=devnet)

## 5. Like a la propia receta

1. **Datos y estado inicial:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** dar_like firmado por el autor de la receta. Se espera el rechazo LikePropio.
3. **Resultado observado:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". No se creó cuenta Like: true.
4. **Firma o error:** `LikePropio` — El autor no puede dar like a su propia receta. · [2H4p6e6AqFZxL4oBdQGSfWjMvBu8vfbT9MavmkDSBQfzJCA9iTsLngEAtVVgwV4UPjUTAvizoWhjbazVKQnLnefR](https://explorer.solana.com/tx/2H4p6e6AqFZxL4oBdQGSfWjMvBu8vfbT9MavmkDSBQfzJCA9iTsLngEAtVVgwV4UPjUTAvizoWhjbazVKQnLnefR?cluster=devnet)

## 6. Dar like (otra wallet)

1. **Datos y estado inicial:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** dar_like firmado por otra wallet. Se espera una cuenta Like (PDA ["like", usuario, receta]) y likes+1.
3. **Resultado observado:** likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Like AZfH5zPUQBk1vcpfD6t5NZDjquGqFSxvrvULfzyPnmds con usuario=85RWKzcSDdomS3aMtsGuAXvKgSJXEFeVC3KffBYKrvJZ y receta=tvRtfoeQJfqdbtUYwHy7G4Do2srhDV4h1DXoRvAu9JN.
4. **Firma o error:** [nz9S1v4zMCdPgVAt5oz4f6w2VgB4ztUefyafpViR9Qb1udqp8NnJc6Xy14QH4aCWTzH8XW6LA6k1rjmvj4NKepo](https://explorer.solana.com/tx/nz9S1v4zMCdPgVAt5oz4f6w2VgB4ztUefyafpViR9Qb1udqp8NnJc6Xy14QH4aCWTzH8XW6LA6k1rjmvj4NKepo?cluster=devnet)
   Cuenta: [AZfH5zPUQBk1vcpfD6t5NZDjquGqFSxvrvULfzyPnmds](https://explorer.solana.com/address/AZfH5zPUQBk1vcpfD6t5NZDjquGqFSxvrvULfzyPnmds?cluster=devnet)

## 7. Cerrar receta con likes activos

1. **Datos y estado inicial:** likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** cerrar_receta firmada por el autor mientras likes > 0. Se espera el rechazo RecetaConLikes.
3. **Resultado observado:** likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". La cuenta y su Like se conservan.
4. **Firma o error:** `RecetaConLikes` — La receta tiene likes activos y no puede cerrarse. · [5R3yrdA7mE3WfnpNGFw1iQ4jr5R954wgGmef7v62VLEHxU1CPw2xEYJMRKQcZ53tuxBDEJr4EpjvdkpG3MkkGFmp](https://explorer.solana.com/tx/5R3yrdA7mE3WfnpNGFw1iQ4jr5R954wgGmef7v62VLEHxU1CPw2xEYJMRKQcZ53tuxBDEJr4EpjvdkpG3MkkGFmp?cluster=devnet)

## 8. Quitar like pasando otra receta (combinación inválida)

1. **Datos y estado inicial:** Receta 1: likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Receta 2 (43TXUAnRtm8gdjeUaU9zrZk92a9XPycx5PKxbubTSobo): likes=0, tiempo=10 min, descripción="Desayuno de bajo índice glucémico". El Like pertenece a la receta 1.
2. **Operación y resultado esperado:** quitar_like con el Like de la receta 1 y la cuenta de la receta 2. Se espera el rechazo LikeDeOtraReceta.
3. **Resultado observado:** Receta 1: likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Receta 2: likes=0, tiempo=10 min, descripción="Desayuno de bajo índice glucémico". Like sigue existiendo: true.
4. **Firma o error:** `LikeDeOtraReceta` — El like no corresponde a esta receta. · [vDM8iCn6gWfLHoCVB4hWzQZyTNqL78qXq5QYyYc3mdPLRG6npFjnJbgCfdwrEHRwq8NVRsYnaDSX1pqwZsJ7vL5](https://explorer.solana.com/tx/vDM8iCn6gWfLHoCVB4hWzQZyTNqL78qXq5QYyYc3mdPLRG6npFjnJbgCfdwrEHRwq8NVRsYnaDSX1pqwZsJ7vL5?cluster=devnet)

## 9. Quitar like (quien lo dio)

1. **Datos y estado inicial:** likes=1, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** quitar_like firmado por quien dio el like. Se espera cerrar la cuenta Like y likes-1.
3. **Resultado observado:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Cuenta Like: la cuenta no existe.
4. **Firma o error:** [3MmbXxYbZWRLodi2ayeW6CCFhwBoxWVfEYZZc23fUvf91QjgXvpkGVUPdtXp4osLu9Lg5vhDke3cTVpXrFfgfbcm](https://explorer.solana.com/tx/3MmbXxYbZWRLodi2ayeW6CCFhwBoxWVfEYZZc23fUvf91QjgXvpkGVUPdtXp4osLu9Lg5vhDke3cTVpXrFfgfbcm?cluster=devnet)

## 10. Cerrar receta ajena

1. **Datos y estado inicial:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria"
2. **Operación y resultado esperado:** cerrar_receta firmada por una wallet que no es el autor (likes = 0). Se espera el rechazo NoEresAutor.
3. **Resultado observado:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". La cuenta se conserva.
4. **Firma o error:** `NoEresAutor` — Solo el autor puede modificar o cerrar esta receta. · [5RnQy4GtPEfe1Xv79Xf9A21vWtw5egonqvDcQFeCRPXPcss4gyCBgiuS494vdShzcezWjEiiQnU8ajMTK6oo1EUq](https://explorer.solana.com/tx/5RnQy4GtPEfe1Xv79Xf9A21vWtw5egonqvDcQFeCRPXPcss4gyCBgiuS494vdShzcezWjEiiQnU8ajMTK6oo1EUq?cluster=devnet)

## 11. Cerrar receta sin likes (autor)

1. **Datos y estado inicial:** likes=0, tiempo=50 min, descripción="Bajo en sodio, con calabaza y zanahoria". Rent depositada en la cuenta: 0.002250 SOL.
2. **Operación y resultado esperado:** cerrar_receta firmada por el autor con likes = 0. Se espera cerrar la cuenta y devolver la rent al autor.
3. **Resultado observado:** Receta: la cuenta no existe. Saldo del autor: 0.268673 → 0.270918 SOL (rent menos comisión).
4. **Firma o error:** [2onnhGyD344AhtzDPrPb9V4J95nguPgURBXc4sKvjSjsPsP8A7m4EbaQAjwiqT3B78TKExCyoLk7PCvTTGW4nup2](https://explorer.solana.com/tx/2onnhGyD344AhtzDPrPb9V4J95nguPgURBXc4sKvjSjsPsP8A7m4EbaQAjwiqT3B78TKExCyoLk7PCvTTGW4nup2?cluster=devnet)
