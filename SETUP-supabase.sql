-- =====================================================================
-- SALVIA · Configuración de Supabase (parte off-chain)
-- Supabase Dashboard → SQL Editor → New query → pegar todo → Run.
-- Es idempotente: se puede ejecutar más de una vez.
-- =====================================================================

-- 1. Comentarios
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES public.recetas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nombre TEXT NOT NULL,
  texto TEXT NOT NULL CHECK (char_length(texto) BETWEEN 2 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comentarios_receta ON public.comentarios(receta_id, created_at DESC);

-- Un like por usuario y receta (si ya hubiera duplicados, se omite el índice)
DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS likes_usuario_receta ON public.likes(user_id, receta_id);
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Hay likes duplicados; no se creó el índice único.';
END $$;

-- 2. Permisos de la API (anon = sin sesión, authenticated = con sesión)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON public.recetas, public.comentarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.recetas, public.perfiles, public.puntos, public.likes, public.comentarios
  TO authenticated;

-- 3. Seguridad por fila
ALTER TABLE public.recetas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Recetas: lectura pública; cada autor gestiona las suyas
DROP POLICY IF EXISTS salvia_recetas_leer ON public.recetas;
CREATE POLICY salvia_recetas_leer ON public.recetas FOR SELECT USING (true);
DROP POLICY IF EXISTS salvia_recetas_crear ON public.recetas;
CREATE POLICY salvia_recetas_crear ON public.recetas FOR INSERT WITH CHECK (auth.uid() = autor_id);
DROP POLICY IF EXISTS salvia_recetas_editar ON public.recetas;
CREATE POLICY salvia_recetas_editar ON public.recetas FOR UPDATE USING (auth.uid() = autor_id);
DROP POLICY IF EXISTS salvia_recetas_borrar ON public.recetas;
CREATE POLICY salvia_recetas_borrar ON public.recetas FOR DELETE USING (auth.uid() = autor_id);

-- Perfiles: cada usuario solo ve y edita el suyo
DROP POLICY IF EXISTS salvia_perfiles_leer ON public.perfiles;
CREATE POLICY salvia_perfiles_leer ON public.perfiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS salvia_perfiles_crear ON public.perfiles;
CREATE POLICY salvia_perfiles_crear ON public.perfiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS salvia_perfiles_editar ON public.perfiles;
CREATE POLICY salvia_perfiles_editar ON public.perfiles FOR UPDATE USING (auth.uid() = id);

-- Puntos: cada usuario registra y ve los suyos
DROP POLICY IF EXISTS salvia_puntos_leer ON public.puntos;
CREATE POLICY salvia_puntos_leer ON public.puntos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS salvia_puntos_crear ON public.puntos;
CREATE POLICY salvia_puntos_crear ON public.puntos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes: visibles para usuarios con sesión; cada quien da y quita los suyos
DROP POLICY IF EXISTS salvia_likes_leer ON public.likes;
CREATE POLICY salvia_likes_leer ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS salvia_likes_crear ON public.likes;
CREATE POLICY salvia_likes_crear ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS salvia_likes_borrar ON public.likes;
CREATE POLICY salvia_likes_borrar ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comentarios: lectura pública; cada quien publica y borra los suyos
DROP POLICY IF EXISTS salvia_comentarios_leer ON public.comentarios;
CREATE POLICY salvia_comentarios_leer ON public.comentarios FOR SELECT USING (true);
DROP POLICY IF EXISTS salvia_comentarios_crear ON public.comentarios;
CREATE POLICY salvia_comentarios_crear ON public.comentarios FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS salvia_comentarios_borrar ON public.comentarios;
CREATE POLICY salvia_comentarios_borrar ON public.comentarios FOR DELETE USING (auth.uid() = user_id);

-- 4. Contador de likes. SECURITY DEFINER porque quien da like no es el autor de la
--    receta y la política de recetas no le permitiría actualizar likes_count.
CREATE OR REPLACE FUNCTION public.actualizar_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.recetas SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.receta_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.recetas SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.receta_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS likes_trigger ON public.likes;
CREATE TRIGGER likes_trigger
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.actualizar_likes_count();

-- 5. Que la API vea los cambios de inmediato
NOTIFY pgrst, 'reload schema';
