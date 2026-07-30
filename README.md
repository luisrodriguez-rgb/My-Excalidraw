<div align="center">

<img src="https://github.com/luisrodriguez-rgb.png" width="110" height="110" style="border-radius: 50%; border: 4px solid #ef4444; margin-bottom: 12px;" alt="luisrodriguez-rgb avatar" />

# My-Excalidraw

**Plataforma de Pizarra Virtual, Colaboración en Tiempo Real y Espacio de Estudio Infinito**

[![Autor](https://img.shields.io/badge/Creador-luisrodriguez--rgb-ef4444?style=for-the-badge&logo=github)](https://github.com/luisrodriguez-rgb)
[![Deploy Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://my-excalidraw-nine.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

[🚀 Probar Aplicación en Vivo](https://my-excalidraw-nine.vercel.app) • [📖 Arquitectura](#-arquitectura-del-sistema) • [✨ Novedades 2026](#-novedades-destacadas)

</div>

---

## 💡 Acerca del Proyecto

**My-Excalidraw** es una extensión avanzada y personalizada de Excalidraw diseñada para transformar una simple pizarra virtual en un **entorno de trabajo y estudio todo-en-uno**. Permite integrar documentos **PDF**, tablas nativas importadas desde **Google Sheets / Excel**, notas en **Markdown**, salas de colaboración multi-usuario y un **Modo Estudio** interactivo con tarjetas de memoria.

---

## ✨ Novedades Destacadas

```mermaid
graph TD
    A[My-Excalidraw Suite] --> B[⚡ PDFs dentro del Canvas]
    A --> C[📊 Tablas Google Sheets & CSV]
    A --> D[🔒 Control de Roles por URL]
    A --> E[🎓 Modo Estudio Flashcards]
    A --> F[💳 Persistencia de Planes Pro]

    B --> B1[JPEG 75% Compression - 70KB/pag]
    C --> C1[Auto-formato con Encabezados Rojos]
    D --> D1[?role=viewer / commenter]
    E --> E1[Repaso Interactivo de Notas]
    F --> F1[Local-First + Supabase Sync]
```

### ⚡ 1. Importación Ultra-Rápida de PDF (Motor Local Sin Lag)
- Renderiza archivos PDF de múltiples páginas directamente sobre la pizarra.
- **Compresión Inteligente JPEG (75%)**: reduce el tamaño por página de ~800 KB a solo **~70 KB**, permitiendo hacer zoom, anotar y vincular diagramas sin sobrecargar el navegador.
- **Renderizado Blanco Sólido**: elimina transparencias o marcas en blanco al instante.

### 🔒 2. Control de Permisos de Roles por URL
- **Modo Lector**: `?role=viewer`
- **Modo Comentador**: `?role=commenter`
- Bloquea forzosamente la edición del canvas (`viewModeEnabled = true`) para usuarios invitados, protegiendo tus esquemas originales.

### 📊 3. Importador de Google Sheets & CSV
- Copia celdas de Excel o Google Sheets (`Cmd+C` / `Ctrl+C`) y genera tablas vectoriales formateadas en un clic (`Cmd+V` / `Ctrl+V`).
- Soporta presupuestos, inventarios y cronogramas de hasta 500 celdas por tabla.

### 🎓 4. Modo Estudio (Flashcards Interactivas)
- Convierte tus apuntes y diagramas en un sistema de memorización activa.
- Voltea tarjetas de repaso, mide tu porcentaje de dominio y marca temas para revisar luego.

### 💳 5. Gestión y Persistencia de Planes
- Guarda la suscripción del usuario (*Gratuito / Pro / Empresarial*) en `localStorage` y la sincroniza con la cuenta de Supabase.

---

## 📖 Arquitectura del Sistema

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Frontend as Vite + React (Local-First)
    participant IDB as IndexedDB (Local Storage)
    participant Backend as Supabase (PostgreSQL + Auth)
    participant Collab as Socket.IO (Server)

    Usuario->>Frontend: Abre tablero / Carga PDF o Tabla
    Frontend->>IDB: Guarda copia instantánea offline
    Frontend->>Backend: Sincroniza metadatos y preferencias
    Frontend->>Collab: Emite cursores y cambios en tiempo real a otros usuarios
```

---

## 🛠️ Guía de Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/luisrodriguez-rgb/My-Excalidraw.git

# 2. Entrar al directorio
cd My-Excalidraw/excalidraw

# 3. Dar permisos de ejecutable e instalar dependencias
yarn install

# 4. Iniciar el servidor de desarrollo local
npm run start
```

---

## 👨‍💻 Creador & Mantenimiento

Desarrollado y mantenido por **Luis Rodriguez** ([@luisrodriguez-rgb](https://github.com/luisrodriguez-rgb)).

<div align="center">
  <a href="https://github.com/luisrodriguez-rgb">
    <img src="https://github.com/luisrodriguez-rgb.png" width="80" height="80" style="border-radius:50%;" alt="Luis Rodriguez" />
    <br/>
    <strong>Luis Rodriguez (luisrodriguez-rgb)</strong>
  </a>
</div>
