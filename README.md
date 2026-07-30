<div align="center">

<img src="https://res.cloudinary.com/lucho-cloude/image/upload/v1785392444/logo-custom_s94xrr.png" width="100%" max-width="850" style="border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.25); margin-bottom: 20px;" alt="My-Excalidraw Banner" />

# My-Excalidraw

**Workspace Visual para PDFs, Estudio, Colaboración, Diagramación y Documentación**

[![Autor](https://img.shields.io/badge/Creador-luisrodriguez--rgb-ef4444?style=for-the-badge&logo=github)](https://github.com/luisrodriguez-rgb)
[![Deploy Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://my-excalidraw-nine.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

[🚀 Probar Aplicación en Vivo](https://my-excalidraw-nine.vercel.app) • [✅ Funciones Hoy](#-lo-que-existe-hoy) • [📊 Comparativa vs Excalidraw](#-tabla-comparativa-my-excalidraw-vs-excalidraw-original) • [🛣️ Roadmap 2026](#%EF%B8%8F-roadmap-2026)

</div>

---

## 💡 Acerca del Proyecto

**My-Excalidraw** transforma la tradicional pizarra a mano alzada en un **Workspace Visual todo-en-uno**. Permite integrar documentos **PDF**, tablas nativas importadas desde **Google Sheets / Excel**, especificaciones enriquecidas en **Markdown**, salas de colaboración multi-usuario, roles de lectura y un **Modo Estudio** interactivo con tarjetas de memoria.

---

## 🚀 Visión del Proyecto

My-Excalidraw no busca ser únicamente una pizarra digital.

Nuestra visión es construir un **Workspace Visual** donde estudiantes, profesionales y equipos puedan:

- 🧠 **Pensar**: Bocetar e iterar libremente.
- 📌 **Planificar**: Organizar proyectos y sprints.
- 📚 **Aprender**: Estudiar PDFs y notas con memorización activa.
- 📝 **Documentar**: Vincular especificaciones y arquitecturas.
- 🎬 **Presentar**: Exponer ideas en modo diapositivas cine.
- 🤝 **Colaborar**: Trabajar en equipo en tiempo real.

todo desde un único espacio de trabajo.

---

## ✅ Lo que Existe Hoy (100% Funcional)

Las siguientes capacidades se encuentran completamente implementadas y listas para usar en producción:

| Módulo | Estado | Descripción |
| :--- | :---: | :--- |
| ⚡ **PDF Fast Engine** | `✅ Disponible` | Renderizado nativo de PDFs multicapa sobre el canvas con compresión ultraliviana. |
| 📊 **Google Sheets Importer** | `✅ Disponible` | Conversión de celdas copiadas de Excel/Sheets (`Cmd+C`) a tablas editables (`Cmd+V`). |
| 🎓 **Modo Estudio (Flashcards)** | `✅ Disponible` | Tarjetas de memorización activa con seguimiento de progreso e interfaz interactiva. |
| 🔒 **Control de Roles por URL** | `✅ Disponible` | Enlaces de solo lectura (`?role=viewer`) y comentarios (`?role=commenter`). |
| 📂 **Dashboard & Workspaces** | `✅ Disponible` | Organización por carpetas, filtros de búsqueda y papelera de reciclaje. |
| 🔄 **Persistencia Híbrida** | `✅ Disponible` | Arquitectura Local-First (IndexedDB) con sincronización automática en la nube (Supabase). |
| 📝 **Notas Markdown & Comentarios** | `✅ Disponible` | Panel lateral de especificaciones en Markdown y hilos de comentarios anclados. |
| 🎬 **Modo Presentación Cine** | `✅ Disponible` | Marcos estilo diapositivas con zoom reactivo y exportación a PowerPoint (.pptx). |
| 💳 **Persistencia de Planes** | `✅ Disponible` | Gestión de suscripciones (*Gratuito / Pro / Empresarial*) persistida en cuenta y storage. |

---

## 🎯 Casos de Uso Principales

| Caso de Uso | Nivel de Cobertura | Beneficio Clave |
| :--- | :---: | :--- |
| 🎓 **Universidad & Estudio** | ⭐⭐⭐⭐⭐ | Lectura de PDFs en canvas + Modo Estudio (Flashcards) |
| 🛠️ **Ingeniería & Software** | ⭐⭐⭐⭐⭐ | Diagramas de arquitectura, Kanban y prototipos |
| 🏗️ **Arquitectura de Sistemas** | ⭐⭐⭐⭐⭐ | Plantillas de diseño hexagonal y microservicios |
| 💼 **Product Management** | ⭐⭐⭐⭐ | Importación de Google Sheets y seguimiento de sprints |
| 🎬 **Workshops & Presentaciones** | ⭐⭐⭐⭐ | Modo presentación diapositivas + Exportación a PPTX |
| 💡 **Brainstorming Rápido** | ⭐⭐⭐⭐⭐ | Pizarra infinita colaborativa Local-First instantánea |

---

## 📊 Tabla Comparativa: My-Excalidraw vs. Excalidraw Original

| Característica | Excalidraw Estándar | My-Excalidraw (Este Proyecto) |
| :--- | :---: | :---: |
| **Documentos PDF en Canvas** | ❌ No soportado | ⚡ **Renderizado nativo ultra-liviano** |
| **Tablas de Google Sheets & CSV** | ❌ No soportado | 📊 **Conversión instantánea a tablas editables** |
| **Modo Estudio & Flashcards** | ❌ No soportado | 🎓 **Tarjetas de memorización activa con progreso** |
| **Control de Roles por URL** | ❌ No disponible | 🔒 **Modo Lector (`?role=viewer`) y Comentador (`?role=commenter`)** |
| **Dashboard y Workspaces** | ❌ Pizarra única volátil | 📂 **Gestión por carpetas, papelera y filtros** |
| **Persistencia de Datos** | ⚠️ Solo LocalStorage básico | 🔄 **Local-First (IndexedDB) + Nube (Supabase Cloud Sync)** |
| **Notas Enriquecidas** | ❌ Texto plano | 📝 **Panel lateral de especificaciones en Markdown** |
| **Comentarios Interactivos** | ❌ No disponible | 💬 **Hilos de comentarios anclados a figuras** |
| **Modo Presentación Cine** | ⚠️ Básico | 🎬 **Marcos estilo diapositiva + Exportación a PPTX** |
| **Navegación & Chat Colaborativo**| ❌ No disponible | 🗺️ **Minimapa flotante + Chat lateral en tiempo real** |
| **Gestión de Cuota / Planes** | ❌ No disponible | 💳 **Persistencia de planes Pro/Empresarial** |

---

## 🛣️ Roadmap 2026

Nivel de madurez actual del ecosistema:

```text
✅ Workspace / Dashboard           90%
✅ PDFs                            95%
✅ Google Sheets                   90%
✅ Flashcards                      85%
✅ Comentarios                     80%
✅ Roles                           80%

🚧 Librerías Premium              60%
🚧 Plantillas Profesionales        35%
🚧 Motores Visuales                20%
🚧 Skills IA                       5%
```

---

### 🔹 Fase 1 — Núcleo del Workspace (✅ 100% Completado)
- [x] Persistencia Local-First con IndexedDB y Supabase Cloud Sync
- [x] Motor de importación de PDFs en canvas
- [x] Conversión de Google Sheets / CSV a tablas vectoriales
- [x] Modo Estudio con tarjetas de memoria interactiva (Flashcards)
- [x] Enlaces compartidos con restricción de roles (`?role=viewer` / `?role=commenter`)

---

### 🔹 Fase 2 — Librerías & Plantillas Profesionales (🚧 En Desarrollo)
- [x] Catálogo base de plantillas por taxonomías (Kanban, Retro, SWOT)
- [ ] Catálogo extendido con más de 150 plantillas profesionales (Estrategia, Educación, IA, Producto)
- [ ] Librerías de componentes vectoriales precargados

---

### 🔹 Fase 3 — Motores Visuales Específicos (🚧 En Diseño)
- [ ] Motor A — Cerebro (Mapas mentales dinámicos)
- [ ] Motor C — Flujo (Diagramación de procesos)
- [ ] Motor F — Red (Arquitectura de microservicios y nodos)
- [ ] Motor G — Matriz (Cuadrantes de prioridad e impacto)
- [ ] Motor I — Árbol (Estructuras jerárquicas)
- [ ] Motor J — Timeline (Líneas de tiempo e hitos)
- [ ] Motor K — Board (Tableros de estado avanzado)

---

### 🔹 Fase 4 — Generación Asistida por IA & Skills (📝 Investigación)
Arquitectura propuesta para la integración de IA:

```text
Idea / Prompt
      ↓
Plantilla adecuada
      ↓
Contenido estructurado
      ↓
Motor visual
      ↓
Tablero listo para usar
```

- [ ] Generación automática de tableros a partir de prompts estructurados
- [ ] Asistente de resumen e inteligencia espacial para notas y PDFs

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
    <img src="https://github.com/luisrodriguez-rgb.png" width="90" height="90" style="border-radius: 50%; border: 3px solid #ef4444;" alt="Luis Rodriguez" />
    <br/>
    <strong>Luis Rodriguez (luisrodriguez-rgb)</strong>
  </a>
</div>
