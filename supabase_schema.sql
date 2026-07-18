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
