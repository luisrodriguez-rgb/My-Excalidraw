    -- 1. Tabla de Carpetas
    CREATE TABLE IF NOT EXISTS public.folders (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Habilitar RLS para carpetas
    ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow users to manage their own folders" ON public.folders;
    CREATE POLICY "Allow users to manage their own folders"
        ON public.folders FOR ALL
        USING (auth.uid() = user_id);

    -- 2. Tabla de Tableros
    CREATE TABLE IF NOT EXISTS public.boards (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        elements JSONB NOT NULL,
        app_state JSONB NOT NULL,
        files JSONB NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
        password TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Habilitar RLS para tableros
    ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow users to manage their own boards" ON public.boards;
    CREATE POLICY "Allow users to manage their own boards"
        ON public.boards FOR ALL
        USING (auth.uid() = user_id);

    -- 3. Tabla de Biblioteca Compartida (Formas)
    CREATE TABLE IF NOT EXISTS public.libraries (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Habilitar RLS para bibliotecas
    ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow users to manage their own library" ON public.libraries;
    CREATE POLICY "Allow users to manage their own library"
        ON public.libraries FOR ALL
        USING (auth.uid() = user_id);

    -- 4. Habilitar Realtime para tableros (boards) en Supabase de forma segura (evita errores si ya existe)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_rel pr 
        JOIN pg_publication p ON p.oid = pr.prpubid 
        JOIN pg_class c ON c.oid = pr.prrelid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'boards'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
      END IF;
    END $$;

    -- 5. Tabla de Enlaces Compartidos (Shared Links)
    CREATE TABLE IF NOT EXISTS public.shared_links (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        encryption_key TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Habilitar RLS para shared_links
    ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public read access for shared_links" ON public.shared_links;
    CREATE POLICY "Public read access for shared_links"
        ON public.shared_links FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public insert access for shared_links" ON public.shared_links;
    CREATE POLICY "Public insert access for shared_links"
        ON public.shared_links FOR INSERT
        WITH CHECK (true);

    -- Función de mantenimiento para auto-eliminar enlaces compartidos de más de 30 días
    CREATE OR REPLACE FUNCTION public.clean_old_shared_links()
    RETURNS void AS $$
    BEGIN
      DELETE FROM public.shared_links
      WHERE created_at < NOW() - INTERVAL '30 days';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

