-- =====================================================================
-- SALVIA · Migración Supabase
-- Pégalo completo en Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- 1. Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nombre TEXT NOT NULL,
  texto TEXT NOT NULL CHECK (char_length(texto) BETWEEN 2 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_receta ON comentarios(receta_id, created_at DESC);

ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comentarios_select" ON comentarios;
CREATE POLICY "comentarios_select" ON comentarios FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "comentarios_insert" ON comentarios;
CREATE POLICY "comentarios_insert" ON comentarios FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comentarios_delete" ON comentarios;
CREATE POLICY "comentarios_delete" ON comentarios FOR DELETE USING (auth.uid() = user_id);


-- 2. Tabla de likes
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, receta_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_receta ON likes(receta_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select" ON likes;
CREATE POLICY "likes_select" ON likes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "likes_insert" ON likes;
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete" ON likes;
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);


-- 3. Trigger para mantener likes_count en recetas
CREATE OR REPLACE FUNCTION actualizar_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recetas SET likes_count = likes_count + 1 WHERE id = NEW.receta_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recetas SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.receta_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS likes_trigger ON likes;
CREATE TRIGGER likes_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION actualizar_likes_count();


-- 4. (Opcional) Verifica los resultados
-- SELECT 'comentarios' AS tabla, count(*) FROM comentarios
-- UNION ALL SELECT 'likes', count(*) FROM likes;
