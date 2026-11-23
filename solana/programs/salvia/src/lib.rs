use anchor_lang::prelude::*;

declare_id!("43HQ86bvTfr6n5FLt2RiMBPzzCwAuPtyJSRCrrMcpmjY");

/// El título es semilla de la PDA, así que su límite es el de una semilla: 32 bytes.
pub const TITULO_MAX: usize = 32;
pub const DESCRIPCION_MAX: usize = 200;
pub const TIEMPO_MAX: u16 = 600;
pub const CONDICIONES: [&str; 5] = ["ninguna", "diabetes", "hipertension", "colesterol", "celiaca"];

#[program]
pub mod salvia {
    use super::*;

    pub fn crear_receta(
        ctx: Context<CrearReceta>,
        titulo: String,
        descripcion: String,
        tiempo_minutos: u16,
        condicion_salud: String,
    ) -> Result<()> {
        require!(!titulo.trim().is_empty(), SalviaError::TituloVacio);
        require!(titulo.len() <= TITULO_MAX, SalviaError::TituloMuyLargo);
        require!(
            CONDICIONES.contains(&condicion_salud.as_str()),
            SalviaError::CondicionInvalida
        );
        validar_contenido(&descripcion, tiempo_minutos)?;

        ctx.accounts.receta.set_inner(Receta {
            autor: ctx.accounts.autor.key(),
            titulo,
            descripcion,
            tiempo_minutos,
            condicion_salud,
            likes: 0,
            creada_en: Clock::get()?.unix_timestamp,
            bump: ctx.bumps.receta,
        });
        Ok(())
    }

    pub fn actualizar_receta(
        ctx: Context<ActualizarReceta>,
        descripcion: String,
        tiempo_minutos: u16,
    ) -> Result<()> {
        validar_contenido(&descripcion, tiempo_minutos)?;

        let receta = &mut ctx.accounts.receta;
        receta.descripcion = descripcion;
        receta.tiempo_minutos = tiempo_minutos;
        Ok(())
    }

    pub fn dar_like(ctx: Context<DarLike>) -> Result<()> {
        let usuario = ctx.accounts.usuario.key();
        let receta_key = ctx.accounts.receta.key();

        let receta = &mut ctx.accounts.receta;
        require_keys_neq!(receta.autor, usuario, SalviaError::LikePropio);
        receta.likes = receta
            .likes
            .checked_add(1)
            .ok_or(SalviaError::ContadorFueraDeRango)?;

        ctx.accounts.like.set_inner(Like {
            usuario,
            receta: receta_key,
            creado_en: Clock::get()?.unix_timestamp,
            bump: ctx.bumps.like,
        });
        Ok(())
    }

    pub fn quitar_like(ctx: Context<QuitarLike>) -> Result<()> {
        let receta = &mut ctx.accounts.receta;
        receta.likes = receta
            .likes
            .checked_sub(1)
            .ok_or(SalviaError::ContadorFueraDeRango)?;
        Ok(())
    }

    /// Las reglas de cierre (autor y cero likes) se validan en `CerrarReceta`.
    /// Exigir cero likes garantiza que nunca queden cuentas `Like` apuntando a una receta cerrada.
    pub fn cerrar_receta(_ctx: Context<CerrarReceta>) -> Result<()> {
        Ok(())
    }
}

fn validar_contenido(descripcion: &str, tiempo_minutos: u16) -> Result<()> {
    require!(
        descripcion.len() <= DESCRIPCION_MAX,
        SalviaError::DescripcionMuyLarga
    );
    require!(
        (1..=TIEMPO_MAX).contains(&tiempo_minutos),
        SalviaError::TiempoInvalido
    );
    Ok(())
}

#[account]
#[derive(InitSpace)]
pub struct Receta {
    pub autor: Pubkey,
    #[max_len(32)]
    pub titulo: String,
    #[max_len(200)]
    pub descripcion: String,
    pub tiempo_minutos: u16,
    #[max_len(16)]
    pub condicion_salud: String,
    pub likes: u32,
    pub creada_en: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Like {
    pub usuario: Pubkey,
    pub receta: Pubkey,
    pub creado_en: i64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(titulo: String)]
pub struct CrearReceta<'info> {
    #[account(
        init,
        payer = autor,
        space = 8 + Receta::INIT_SPACE,
        seeds = [b"receta", autor.key().as_ref(), titulo.as_bytes()],
        bump
    )]
    pub receta: Account<'info, Receta>,
    #[account(mut)]
    pub autor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ActualizarReceta<'info> {
    #[account(
        mut,
        has_one = autor @ SalviaError::NoEresAutor,
        seeds = [b"receta", receta.autor.as_ref(), receta.titulo.as_bytes()],
        bump = receta.bump
    )]
    pub receta: Account<'info, Receta>,
    pub autor: Signer<'info>,
}

#[derive(Accounts)]
pub struct DarLike<'info> {
    #[account(
        mut,
        seeds = [b"receta", receta.autor.as_ref(), receta.titulo.as_bytes()],
        bump = receta.bump
    )]
    pub receta: Account<'info, Receta>,
    #[account(
        init,
        payer = usuario,
        space = 8 + Like::INIT_SPACE,
        seeds = [b"like", usuario.key().as_ref(), receta.key().as_ref()],
        bump
    )]
    pub like: Account<'info, Like>,
    #[account(mut)]
    pub usuario: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct QuitarLike<'info> {
    #[account(
        mut,
        seeds = [b"receta", receta.autor.as_ref(), receta.titulo.as_bytes()],
        bump = receta.bump
    )]
    pub receta: Account<'info, Receta>,
    #[account(
        mut,
        close = usuario,
        has_one = usuario @ SalviaError::NoEresDuenoDelLike,
        has_one = receta @ SalviaError::LikeDeOtraReceta,
        seeds = [b"like", like.usuario.as_ref(), like.receta.as_ref()],
        bump = like.bump
    )]
    pub like: Account<'info, Like>,
    #[account(mut)]
    pub usuario: Signer<'info>,
}

#[derive(Accounts)]
pub struct CerrarReceta<'info> {
    #[account(
        mut,
        close = autor,
        has_one = autor @ SalviaError::NoEresAutor,
        constraint = receta.likes == 0 @ SalviaError::RecetaConLikes,
        seeds = [b"receta", receta.autor.as_ref(), receta.titulo.as_bytes()],
        bump = receta.bump
    )]
    pub receta: Account<'info, Receta>,
    #[account(mut)]
    pub autor: Signer<'info>,
}

#[error_code]
pub enum SalviaError {
    #[msg("El título no puede estar vacío.")]
    TituloVacio,
    #[msg("El título no puede superar 32 bytes.")]
    TituloMuyLargo,
    #[msg("La descripción no puede superar 200 bytes.")]
    DescripcionMuyLarga,
    #[msg("La condición de salud no es una de las admitidas.")]
    CondicionInvalida,
    #[msg("El tiempo de preparación debe estar entre 1 y 600 minutos.")]
    TiempoInvalido,
    #[msg("Solo el autor puede modificar o cerrar esta receta.")]
    NoEresAutor,
    #[msg("El autor no puede dar like a su propia receta.")]
    LikePropio,
    #[msg("Solo quien dio el like puede retirarlo.")]
    NoEresDuenoDelLike,
    #[msg("El like no corresponde a esta receta.")]
    LikeDeOtraReceta,
    #[msg("La receta tiene likes activos y no puede cerrarse.")]
    RecetaConLikes,
    #[msg("El contador de likes quedó fuera de rango.")]
    ContadorFueraDeRango,
}
