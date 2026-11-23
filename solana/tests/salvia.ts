import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { Salvia } from "../target/types/salvia";

describe("salvia", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Salvia as Program<Salvia>;

  const autor = Keypair.generate();
  const otro = Keypair.generate();
  const titulo = "Caldo de pollo";
  const otroTitulo = "Avena con canela";

  const pdaReceta = (t: string) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("receta"), autor.publicKey.toBuffer(), Buffer.from(t)],
      program.programId,
    )[0];
  const pdaLike = (usuario: PublicKey, receta: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("like"), usuario.toBuffer(), receta.toBuffer()],
      program.programId,
    )[0];

  const receta = pdaReceta(titulo);
  const likeOtro = pdaLike(otro.publicKey, receta);

  const esperarError = async (promesa: Promise<unknown>, codigo: string) => {
    try {
      await promesa;
      assert.fail(`se esperaba ${codigo}`);
    } catch (e) {
      assert.equal((e as anchor.AnchorError).error?.errorCode?.code, codigo);
    }
  };

  before(async () => {
    for (const kp of [autor, otro]) {
      const firma = await provider.connection.requestAirdrop(kp.publicKey, LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(firma);
    }
  });

  it("crea una receta", async () => {
    await program.methods
      .crearReceta(titulo, "Bajo en sodio", 45, "hipertension")
      .accountsPartial({ receta, autor: autor.publicKey, systemProgram: SystemProgram.programId })
      .signers([autor])
      .rpc();

    const cuenta = await program.account.receta.fetch(receta);
    assert.equal(cuenta.titulo, titulo);
    assert.equal(cuenta.likes, 0);
    assert.ok(cuenta.autor.equals(autor.publicKey));
  });

  it("rechaza una condición no admitida", async () => {
    await esperarError(
      program.methods
        .crearReceta("Otra", "", 10, "keto")
        .accountsPartial({ receta: pdaReceta("Otra"), autor: autor.publicKey, systemProgram: SystemProgram.programId })
        .signers([autor])
        .rpc(),
      "CondicionInvalida",
    );
  });

  it("el autor actualiza su receta", async () => {
    await program.methods
      .actualizarReceta("Bajo en sodio, con calabaza", 50)
      .accountsPartial({ receta, autor: autor.publicKey })
      .signers([autor])
      .rpc();
    assert.equal((await program.account.receta.fetch(receta)).tiempoMinutos, 50);
  });

  it("rechaza la actualización de otra wallet", async () => {
    await esperarError(
      program.methods
        .actualizarReceta("hack", 5)
        .accountsPartial({ receta, autor: otro.publicKey })
        .signers([otro])
        .rpc(),
      "NoEresAutor",
    );
    assert.equal((await program.account.receta.fetch(receta)).tiempoMinutos, 50);
  });

  it("rechaza el like del autor a su propia receta", async () => {
    await esperarError(
      program.methods
        .darLike()
        .accountsPartial({ receta, like: pdaLike(autor.publicKey, receta), usuario: autor.publicKey, systemProgram: SystemProgram.programId })
        .signers([autor])
        .rpc(),
      "LikePropio",
    );
  });

  it("otra wallet da like", async () => {
    await program.methods
      .darLike()
      .accountsPartial({ receta, like: likeOtro, usuario: otro.publicKey, systemProgram: SystemProgram.programId })
      .signers([otro])
      .rpc();
    assert.equal((await program.account.receta.fetch(receta)).likes, 1);
  });

  it("no permite cerrar una receta con likes", async () => {
    await esperarError(
      program.methods.cerrarReceta().accountsPartial({ receta, autor: autor.publicKey }).signers([autor]).rpc(),
      "RecetaConLikes",
    );
  });

  it("rechaza un like de otra receta", async () => {
    const otraReceta = pdaReceta(otroTitulo);
    await program.methods
      .crearReceta(otroTitulo, "", 10, "diabetes")
      .accountsPartial({ receta: otraReceta, autor: autor.publicKey, systemProgram: SystemProgram.programId })
      .signers([autor])
      .rpc();

    await esperarError(
      program.methods
        .quitarLike()
        .accountsPartial({ receta: otraReceta, like: likeOtro, usuario: otro.publicKey })
        .signers([otro])
        .rpc(),
      "LikeDeOtraReceta",
    );
  });

  it("quita el like y entonces el autor sí puede cerrar", async () => {
    await program.methods
      .quitarLike()
      .accountsPartial({ receta, like: likeOtro, usuario: otro.publicKey })
      .signers([otro])
      .rpc();
    assert.isNull(await provider.connection.getAccountInfo(likeOtro));

    await esperarError(
      program.methods.cerrarReceta().accountsPartial({ receta, autor: otro.publicKey }).signers([otro]).rpc(),
      "NoEresAutor",
    );

    await program.methods.cerrarReceta().accountsPartial({ receta, autor: autor.publicKey }).signers([autor]).rpc();
    assert.isNull(await provider.connection.getAccountInfo(receta));
  });
});
