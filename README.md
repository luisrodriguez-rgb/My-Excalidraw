# My-Excalidraw

Fork personalizado y extendido de Excalidraw, la herramienta de dibujo colaborativo de estilo pizarra virtual a mano alzada. Este proyecto incorpora un sistema de gestión de tableros organizados por carpetas, autenticación segura de usuarios, almacenamiento y sincronización híbrida (local-first mediante IndexedDB y en la nube a través de Supabase), comentarios interactivos anclados al lienzo, un panel de anotaciones enriquecido en Markdown y un modo de presentación adaptado a marcos de diapositivas con máscaras visuales de enfoque.

* **URL de Producción (Frontend):** [https://my-excalidraw-nine.vercel.app](https://my-excalidraw-nine.vercel.app)
* **Servidor de Colaboración:** Node.js + Socket.IO (Desplegado en Render.com)
* **Base de Datos y Autenticación:** Supabase (PostgreSQL)

---

## 1. Arquitectura del Proyecto y Stack Tecnológico

El proyecto está diseñado bajo un modelo de monorepo que separa la aplicación frontend de los servicios backend auxiliares de base de datos y mensajería en tiempo real:

```
My-Excalidraw/
├── excalidraw/                       # Monorepo del Frontend (Fork de Excalidraw)
│   ├── excalidraw-app/               # Aplicación principal personalizada (Vite + React)
│   │   ├── App.tsx                   # Componente raíz de la pizarra y sincronización
│   │   ├── index.html                # Entrada HTML principal (incluye recursos del logo personalizado)
│   │   ├── index.scss                # Estilos globales y reglas de maquetación responsive
│   │   ├── collab/                   # Lógica de comunicación para salas colaborativas
│   │   ├── components/               # Módulos y elementos de interfaz de usuario
│   │   │   ├── Dashboard.tsx         # Panel del usuario para administrar carpetas y pizarras
│   │   │   ├── AuthModal.tsx         # Formulario de inicio de sesión, registro y recuperación
│   │   │   ├── PresentationMode.tsx  # Modo presentación con soporte de máscaras y zoom reactivo
│   │   │   ├── Minimap.tsx           # Vista general en miniatura del lienzo
│   │   │   ├── PresenceBar.tsx       # Barra de usuarios conectados en el tablero actual
│   │   │   └── CollabChat.tsx        # Chat lateral para salas en tiempo real
│   │   └── data/
│   │       ├── boardsDb.ts           # Gestión de datos (IndexedDB y llamadas API a Supabase)
│   │       ├── supabaseClient.ts     # Inicialización del cliente de base de datos Supabase
│   │       └── LocalData.ts          # Adaptadores de almacenamiento local para elementos y bibliotecas
│   ├── packages/                     # Paquetes y librerías base de Excalidraw
│   └── vercel.json                   # Configuración de redirecciones y cabeceras de seguridad de Vercel
├── collab-server.js                  # Servidor de sockets en Node.js (Socket.IO)
├── supabase_schema.sql               # Esquema de base de datos, relaciones y políticas RLS
└── package.json                      # Dependencias y scripts del servidor de colaboración
```

### Tecnologías Utilizadas

* **Frontend:** React 18, TypeScript, Vite.
* **Estilos (CSS):** Sass / Vanilla CSS (para evitar dependencias externas como Tailwind y asegurar el control del rendimiento de dibujo).
* **Almacenamiento Local (Local-First):** IndexedDB administrado mediante `idb-keyval` para garantizar persistencia y acceso offline inmediato.
* **Base de Datos y Autenticación:** Supabase PostgreSQL con autenticación por correo electrónico y Row Level Security (RLS) activo en todas las tablas.
* **Mensajería en Tiempo Real (Canal General):** Canales Broadcast de Supabase Realtime (bypasseando RLS para actualizaciones instantáneas de posición de elementos).
* **Mensajería de Salas de Colaboración:** Socket.IO sobre Node.js con soporte de transporte híbrido (polling y websocket).
* **Sanitización de Datos (Seguridad):** DOMPurify para prevenir ataques Cross-Site Scripting (XSS) en renders dinámicos.

---

## 2. Funcionalidades Detalladas y Mejoras Propias

### Dashboard y Gestión de Workspace
* **Estructura jerárquica:** Creación y edición de carpetas para agrupar tableros de manera ordenada.
* **Búsqueda y filtrado:** Buscador de tableros por nombre y clasificación mediante etiquetas de estado.
* **Soft Deletes:** Los tableros eliminados se envían a una papelera de reciclaje y pueden ser recuperados o borrados permanentemente.

### Panel de Notas en Markdown (Rendimiento Optimizado)
* **Editor Lateral:** Al seleccionar cualquier elemento del lienzo, se despliega una barra lateral con soporte para Markdown. Permite documentar especificaciones técnicas, añadir tareas o escribir descripciones.
* **Rendimiento Reactivo:** El editor utiliza una vinculación de estado local que permite una escritura fluida libre de latencia. Los cambios aplicados sobre el canvas se envían de forma asíncrona mediante un temporizador agrupado (debounce de 150ms), lo que evita la regeneración continua de la escena de dibujo.

### Modo Presentación de Alto Rendimiento
* **Detección Automática de Diapositivas:** Reconoce elementos de tipo "Frame" (Marcos) presentes en el lienzo y los organiza cronológicamente (ordenación espacial arriba-abajo e izquierda-derecha) como diapositivas individuales.
* **Máscara Visual de Enfoque:** Implementa un fondo translúcido que oculta cualquier elemento adyacente que quede fuera del marco activo. Este fondo detecta el tema del lienzo de forma dinámica (blanco en temas claros y gris oscuro en temas oscuros) y aplica una animación suave al cambiar de diapositiva.
* **Cálculo de Viewport:** Ajusta de forma reactiva el zoom y la posición de centrado de cada diapositiva considerando si la barra de notas está abierta, garantizando que el marco nunca se vea cubierto o recortado por componentes de la interfaz.

### Colaboración en Tiempo Real y Presencia
* **PresenceBar:** Barra superior derecha que muestra en tiempo real los avatares e iniciales de los usuarios editando el documento.
* **Generación de Colores:** Cada usuario tiene asignado un color de cursor y avatar persistente calculado mediante un hash determinístico de su nombre.
* **Notificaciones de Eventos:** Alertas visuales y auditivas en pantalla cuando un usuario se une o abandona el lienzo de trabajo.

### Sincronización Automática de Bibliotecas
* **Nube Compartida:** La biblioteca de formas y colecciones de Excalidraw de cada usuario se sincroniza automáticamente con su cuenta de Supabase.
* **Importación Directa:** Cuenta con resolución automática de rutas para solicitudes externas (`addLibrary` en la URL). Si se accede mediante un enlace de biblioteca oficial de Excalidraw, la aplicación levanta una pizarra por defecto de forma transparente para permitir la confirmación e inserción directa de los elementos.

---

## 3. Modelo de Datos y Seguridad (Supabase SQL)

El esquema relacional de la base de datos se describe a continuación (disponible en `supabase_schema.sql`):

### Esquema de Base de Datos

1. **Tabla de Carpetas (`public.folders`)**
   * Almacena carpetas organizativas.
   * Campos: `id` (UUID), `user_id` (UUID), `name` (TEXT), `created_at` (TIMESTAMPTZ).
   * Políticas RLS: Solo lectura, escritura y borrado permitidos al propietario (`auth.uid() = user_id`).

2. **Tabla de Tableros (`public.boards`)**
   * Almacena metadatos y configuraciones del canvas.
   * Campos: `id` (TEXT), `user_id` (UUID), `folder_id` (UUID, nullable), `name` (TEXT), `elements` (JSONB), `app_state` (JSONB, limitado a configuraciones de color de fondo y temas), `files` (JSONB), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
   * Políticas RLS: Solo lectura y escritura permitidas al propietario (`auth.uid() = user_id`).

3. **Tabla de Bibliotecas (`public.libraries`)**
   * Colecciones de formas personalizadas sincronizadas en la nube.
   * Campos: `user_id` (UUID, primary key), `items` (JSONB), `updated_at` (TIMESTAMPTZ).
   * Políticas RLS: Gestión exclusiva para el propietario (`auth.uid() = user_id`).

4. **Tabla de Enlaces Compartidos (`public.shared_links`)**
   * Registra las invitaciones temporales generadas para colaborar de manera remota.
   * Campos: `id` (UUID), `board_id` (TEXT), `created_by` (UUID), `created_at` (TIMESTAMPTZ).
   * Políticas RLS: Los inserts están limitados a usuarios autenticados; las lecturas son públicas para permitir el acceso mediante el token generado.

---

## 4. Medidas de Seguridad Aplicadas (Auditoría Cyber Neo)

El proyecto cuenta con un blindaje completo contra las vulnerabilidades identificadas en auditorías de seguridad informática:

* **Mitigación de Cross-Site Scripting (XSS) (CN-002 / CN-012):** Integración de `DOMPurify` para sanitizar las cadenas de entrada Markdown dentro del editor lateral de notas y filtrar los payloads SVG en los códigos QR compartidos.
* **Prevención de Ataques de Origen (CORS) (CN-004):** El servidor de colaboración (`collab-server.js`) restringe las solicitudes de conexión exclusivamente a la URL de producción configurada y al entorno de desarrollo local.
* **Control de Consumo de Recursos (Rate Limiting) (CN-005 / CN-013):** Implementación de una memoria caché de peticiones en el servidor Socket.IO que bloquea de forma temporal a clientes que superen un límite de 60 eventos de transmisión de lienzo por segundo, evitando ataques de denegación de servicio.
* **Identificadores Criptográficamente Seguros (CN-007):** Reemplazo de funciones generadoras de números pseudoaleatorios (`Math.random()`) por UUIDs conformes al estándar criptográfico (`crypto.randomUUID()`) en la inicialización de tableros, comentarios y notificaciones.
* **Filtrado de Exposición de Información (CN-008):** Restricción de lectura en el gestor global de errores (`TopErrorBoundary.tsx`). En caso de fallo de aplicación, el volcado excluye tokens de sesión o llaves de bases de datos de `localStorage`, reportando únicamente parámetros de interfaz inofensivos.
* **Mensajería de Autenticación Segura (CN-009):** Homogeneización de mensajes de error de Supabase Auth en la interfaz del cliente para prevenir ataques de enumeración de nombres de usuario y direcciones de correo electrónico.
* **Cabeceras HTTP de Seguridad (CN-011):** Configuración de directivas estrictas en `vercel.json` que incluyen `X-Frame-Options: SAMEORIGIN` para mitigar ataques de Clickjacking, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, y `Strict-Transport-Security`.

---

## 5. Configuración y Despliegue

### Variables de Entorno Requeridas (.env)

Configurar las siguientes credenciales del lado del frontend:

```env
VITE_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_APP_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
VITE_APP_COLLAB_SERVER_URL=https://tu-servidor-colaboracion.render.com
```

### Configuración de Supabase
1. Ingresa a la consola de Supabase, abre la pestaña de **SQL Editor** y ejecuta todo el contenido del archivo [supabase_schema.sql](file:///Users/leonfeliperodriguez/Desktop/Trabajos/My-Excalidraw/My-Excalidraw/supabase_schema.sql) para estructurar las tablas, habilitar RLS y los canales de mensajería Realtime.
2. En **Authentication -> URL Configuration**, registra la URL de tu cliente:
   * **Site URL:** `https://my-excalidraw-nine.vercel.app`
   * **Redirect URLs:** `https://my-excalidraw-nine.vercel.app/**`

### Ejecución en Entorno Local

El repositorio utiliza Yarn Workspaces. Es indispensable instalar dependencias desde la raíz para mantener en sincronía los ficheros de bloqueo:

1. **Instalar dependencias:**
   ```bash
   yarn install
   ```
2. **Ejecutar servidor frontend en desarrollo:**
   ```bash
   cd excalidraw
   yarn dev
   ```
   La aplicación levantará por defecto en `http://localhost:3000`.

3. **Ejecutar servidor de colaboración de forma local:**
   ```bash
   node collab-server.js
   ```
   El servidor de WebSocket estará a la escucha en `http://localhost:5000` (puerto configurable mediante variable de entorno `PORT`).

---

*Desarrollado sobre la base open-source de [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) — Licencia MIT.*
