# Sistema de Inventario y ERP - Aditivos DRAFV

Sistema moderno y escalable desarrollado para la gestión integral de una empresa de aditivos para concreto. Inició como un sistema de control de inventarios y ha sido extendido a un ERP completo (Compras, Ventas, Manufactura y Facturación) manteniendo un estricto control de Kardex (append-only), trazabilidad, y un control de acceso basado en roles (RBAC).

---

## 🚀 Stack Tecnológico

- **Framework Core:** Next.js 15+ (App Router, Server Actions)
- **Lenguaje:** TypeScript (Tipado estricto end-to-end)
- **Base de Datos & Auth:** Supabase (PostgreSQL, Row Level Security, Triggers, Funciones RPC)
- **Estilos:** TailwindCSS v4
- **Componentes UI:** shadcn/ui + Radix UI (Accesibles y personalizables)
- **Validación de Datos:** Zod
- **Manejo de Formularios:** React Hook Form
- **Tablas de Datos:** TanStack Table v8
- **Gráficos e Indicadores:** Recharts
- **Iconos:** Lucide React

---

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza un patrón **Modular por Dominio (Domain-Driven Design Lite)**. Esto garantiza alta cohesión, bajo acoplamiento y facilita enormemente el trabajo en equipo y la mantenibilidad.

```text
src/
├── app/                  # Enrutamiento de Next.js (App Router). Páginas y Layouts.
├── components/           # Componentes genéricos (ui/shadcn) que no pertenecen a un dominio.
├── lib/                  # Utilidades core (Supabase clients, cn, formatters).
├── modules/              # 📦 CORE DEL NEGOCIO. Dividido por dominios empresariales.
│   ├── auth/             # Autenticación y Perfiles
│   ├── inventory/        # Kardex y Movimientos
│   ├── purchases/        # Compras y Proveedores
│   ├── sales/            # Ventas y Clientes
│   ├── manufacturing/    # Producción y BOMs
│   └── invoicing/        # Facturación
└── shared/               # Tipos globales (database.types.ts), constantes y utilidades base.
```

---

## 🛠️ Guía para el Equipo: Cómo agregar un nuevo Módulo

Para no romper la arquitectura y mantener el patrón de diseño establecido, cualquier nuevo módulo funcional debe implementarse siguiendo estrictamente este flujo:

### 1. Capa de Datos (Supabase SQL)
Toda regla de negocio fuerte y estructura de datos pertenece primero a la base de datos.
- Define tus tablas asegurando claves foráneas y restricciones.
- Aplica el trigger estándar de auditoría o de `updated_at`.
- **CRÍTICO:** Define siempre las políticas de **Row Level Security (RLS)** para la nueva tabla. Nunca dejes una tabla sin RLS.
- *Tip:* Si tu módulo emite documentos (ej. Notas de Crédito), usa la función RPC `next_document_code('tu_modulo')` en lugar de generar códigos en el frontend.

### 2. Estructura del Módulo (Frontend)
Crea una carpeta para el dominio en `src/modules/[nuevo-modulo]`. Debe contener exclusivamente:

```text
src/modules/[nuevo-modulo]/
├── actions/              # Mutaciones (Server Actions con "use server")
│   └── [nombre].actions.ts
├── services/             # Consultas (Data Fetching seguro)
│   └── [nombre].service.ts
└── components/           # Componentes UI encapsulados
    └── [Nombre]Table.tsx
```

### 3. Capa de Servicios (`services/`)
Aquí ocurre la comunicación de solo lectura con Supabase.
- Usa el cliente importado de `@/lib/supabase/server`.
- Tipa estrictamente el retorno de los datos.
- Nunca llames a la BD directamente desde un componente React de UI.

### 4. Capa de Acciones (`actions/`)
Aquí residen los **Server Actions** encargados de mutar datos (INSERT, UPDATE, DELETE).
- Valida siempre los parámetros de entrada antes de tocar la BD (usa Zod).
- Maneja los errores de Supabase y retorna respuestas estandarizadas: `{ success: boolean; data?: any; error?: string }`.
- Al culminar un cambio, ejecuta `revalidatePath('/ruta-afectada')` para actualizar la UI automáticamente.

### 5. Ensamblaje en Páginas (`src/app/`)
Crea la interfaz final en el App Router (`src/app/(dashboard)/[modulo]/page.tsx`).
- Las páginas de ruta son **Server Components**.
- Haz `await` a tus funciones de `services/` aquí en el servidor y pasa la data como props a los Client Components de UI que desarrollaste en el paso 2.

---

## 🗄️ Instalación y Base de Datos

1. **Instalar dependencias:**
```bash
pnpm install
```

2. **Variables de Entorno:**
Crea un archivo `.env.local` basado en `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

3. **Scripts de Base de Datos Unificados:**
La estructura SQL ha sido consolidada. En el Editor SQL de tu panel de Supabase debes ejecutar estos archivos **en este orden exacto**:

- **Paso 1:** `database/01_DB_SCHEMA_AND_RLS.sql`
  *(Crea toda la estructura de tablas transaccionales, funciones RPC, reglas de Kardex, Auditoría y Políticas de Seguridad RLS)*
- **Paso 2:** `database/02_DB_SEED.sql`
  *(Inserta los catálogos base, almacenes, unidades y la matriz completa de Roles y Permisos granulares)*

4. **Levantar el Servidor:**
```bash
pnpm dev
```

---

## 🔒 Características Críticas de Seguridad

- **Kardex Inmutable:** La tabla `inventory_movements` rechaza cualquier comando `UPDATE` o `DELETE` a nivel del motor PostgreSQL mediante `RULES`. Cualquier corrección de stock exige una transacción compensatoria, garantizando un Kardex auditable y legalmente sólido.
- **Defensa en Profundidad (RBAC):** La seguridad no confía en el frontend. Ocultamos botones según rol, re-validamos la sesión en cada Server Action, y finalmente el RLS de la base de datos bloquea cualquier petición anómala o directa desde API.
- **Auditoría Transparente:** Un trigger de base de datos intercepta operaciones en módulos críticos y guarda versiones en formato JSONB (`old_values` y `new_values`) en `audit_logs`.

---

## 🛠️ Scripts Disponibles

- `pnpm dev`: Inicia entorno local de desarrollo (puerto 3000)
- `pnpm build`: Construye la versión de producción optimizada
- `pnpm start`: Inicia el servidor usando los artefactos de producción
- `pnpm lint`: Análisis estático y corrección de sintaxis
