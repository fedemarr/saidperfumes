# Prompt para Claude Code — SAID Perfumes E-commerce

> **Copiá todo este texto y pegalo en Claude Code para iniciar el proyecto.**

---

## CONTEXTO DEL PROYECTO

Construí una tienda e-commerce de perfumes árabes llamada **SAID Perfumes** — réplica premium de [milrahperfumes.com](https://www.milrahperfumes.com/) con el nombre/marca reemplazado por "SAID".

**Stack obligatorio:**
- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (ya tengo la DB anterior con los 91 productos)
- NextAuth.js v5 (Auth.js) para autenticación
- Zustand para carrito (client state)
- TanStack Query para server state
- Resend para emails transaccionales
- Cloudflare Turnstile para protección de formularios (captcha)
- Framer Motion para animaciones
- next/image para imágenes optimizadas

---

## DISEÑO VISUAL — REPLICAR MILRAHPERFUMES.COM

El sitio tiene estética luxury dark:
- **Fondo**: negro puro `#000000`
- **Texto**: blanco `#FFFFFF`
- **Acento**: dorado `#C9A84C` y variantes
- **Tipografía header**: serif bold en uppercase (estilo "MILRAH PERFUMES" → usar "SAID")
- **Cards de producto**: fondo negro, imagen centrada, nombre + precio en blanco, precio con transferencia en dorado
- **Navbar**: logo centrado, búsqueda a la izquierda, cuenta + carrito a la derecha, nav secundario con Inicio / Productos / Contacto
- **Hero**: banner full-width con imagen oscura, perfumes destacados, badges de ofertas (20% OFF por transferencia, cuotas sin interés, envío gratis superando $X, más de 250 perfumes en stock)
- **Secciones home**: DESTACADOS (carrusel), NOVEDADES (carrusel), TENDENCIAS PARA EL INVIERNO (carrusel), MARCAS (logos en dorado sobre negro)
- **Banner de confianza** debajo del hero: 4 pills con íconos — "Envíos a todo el país", "Pagá en cuotas con cualquier tarjeta", "Ver testimonios de clientes", "Asesoramiento personalizado"
- **Footer**: Newsletter (email input + enviar), Categorías, Contactános (tel + email), Instagram, Medios de pago (logos de tarjetas)
- **Página Productos**: filtros laterales (categoría, género, marca, precio), grilla 4 columnas, ordenar por
- **Página Contacto**: datos de contacto a la izquierda, formulario con Cloudflare Turnstile
- **Login/Register**: minimalista, fondo negro, campos con borde blanco, link "¿Olvidaste tu contraseña?" y "Crear cuenta"
- **Carrito**: slide-over panel desde la derecha, overlay gris sobre el contenido

---

## SECCIÓN ESPECIAL DEL HOME — PIRÁMIDE OLFATIVA

En la página de inicio (y también en cada página de producto) implementar una **pirámide olfativa interactiva** visual. La imagen de referencia muestra barras de colores horizontales apiladas con las notas del perfume (amaderado, cálido especiado, afrutados, cítrico, aromático, tropical, lavanda, florales, avainillado, ámbar). Hacerlo como componente SVG/CSS animado con colores vibrantes y etiquetas de notas que aparecen al hover. En el home mostrar un ejemplo con el perfume destacado.

---

## BASE DE DATOS — SCHEMA PRISMA

Crear/usar el siguiente schema. **YA TENGO UNA DB EXISTENTE** con los productos cargados, respetar los nombres exactos de campos:

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  ARABE
  DESIGNER
  NICHE
  NATIONAL
}

enum Gender {
  MASCULINO
  FEMENINO
  UNISEX
}

enum Role {
  ADMIN
  USER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  TRANSFERENCIA
  TARJETA
  EFECTIVO
}

model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String    @db.Text
  brand           String
  category        Category
  gender          Gender
  occasion        String[]
  notes           Json      // { top: [], heart: [], base: [] }
  images          String[]
  price           Decimal   @db.Decimal(10, 2)
  priceCash       Decimal?  @db.Decimal(10, 2)
  priceTransfer   Decimal?  @db.Decimal(10, 2)
  stock           Int       @default(0)
  isActive        Boolean   @default(true)
  isFeatured      Boolean   @default(false)
  freeShipping    Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  orderItems      OrderItem[]
  cartItems       CartItem[]
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  name            String?
  password        String?
  role            Role      @default(USER)
  phone           String?
  address         Json?     // { street, city, province, zip }
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  orders          Order[]
  cart            Cart?
  accounts        Account[]
  sessions        Session[]
  verificationTokens VerificationToken[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  id         String   @id @default(cuid())
  token      String   @unique
  userId     String
  expires    DateTime
  type       String   // "email_verification" | "password_reset"
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  cart      Cart     @relation(fields: [cartId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  @@unique([cartId, productId])
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique // "SAID-2024-0001"
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  items           OrderItem[]
  status          OrderStatus   @default(PENDING)
  paymentMethod   PaymentMethod
  subtotal        Decimal       @db.Decimal(10, 2)
  discount        Decimal       @default(0) @db.Decimal(10, 2)
  shippingCost    Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  shippingAddress Json
  notes           String?       @db.Text
  paymentProof    String?       // URL del comprobante de transferencia
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  productId   String
  quantity    Int
  unitPrice   Decimal @db.Decimal(10, 2)
  order       Order   @relation(fields: [orderId], references: [id])
  product     Product @relation(fields: [productId], references: [id])
}
```

---

## ESTRUCTURA DE CARPETAS

```
said-perfumes/
├── src/
│   ├── app/
│   │   ├── (store)/                    # Tienda pública
│   │   │   ├── page.tsx                # Home
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx            # Listado con filtros
│   │   │   │   └── [slug]/page.tsx     # Detalle de producto
│   │   │   ├── contacto/page.tsx
│   │   │   └── layout.tsx              # Navbar + Footer
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (account)/
│   │   │   ├── mi-cuenta/page.tsx      # Perfil del usuario
│   │   │   └── mis-pedidos/page.tsx    # Historial de órdenes
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Sidebar admin
│   │   │   ├── page.tsx                # Dashboard con métricas
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx            # Tabla de productos
│   │   │   │   ├── nuevo/page.tsx      # Crear producto
│   │   │   │   └── [id]/page.tsx       # Editar producto
│   │   │   ├── pedidos/page.tsx        # Gestión de órdenes
│   │   │   ├── usuarios/page.tsx       # Gestión de usuarios
│   │   │   └── pagos/page.tsx          # Confirmación de pagos
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── products/route.ts
│   │       ├── cart/route.ts
│   │       ├── orders/route.ts
│   │       ├── upload/route.ts
│   │       └── admin/
│   │           ├── products/route.ts
│   │           ├── orders/route.ts
│   │           └── users/route.ts
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── store/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCarousel.tsx
│   │   │   ├── BrandLogos.tsx
│   │   │   ├── TrustBanner.tsx
│   │   │   ├── OlfactivePyramid.tsx    # Componente pirámide olfativa
│   │   │   ├── CartSidebar.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── auth/
│   │   │   └── TurnstileWidget.tsx     # Cloudflare Turnstile
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── StatsCards.tsx
│   │       ├── OrdersTable.tsx
│   │       └── ProductForm.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── email.ts                    # Resend
│   │   ├── utils.ts
│   │   └── validations/
│   ├── stores/
│   │   └── cartStore.ts                # Zustand
│   ├── hooks/
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   └── types/
│       └── index.ts
├── public/
│   └── PERFUMES SAID/                  # Imágenes de productos por marca
├── prisma/
│   └── schema.prisma
├── .env.example
└── README.md
```

---

## FUNCIONALIDADES COMPLETAS A IMPLEMENTAR

### 🛍️ TIENDA PÚBLICA

**Home (/):**
- Hero banner full-width con imagen oscura de perfumes, logo SAID, badges (20% OFF por transferencia, cuotas sin interés, envío gratis +$150.000, +250 perfumes en stock)
- Trust bar con 4 íconos (envíos, cuotas, testimonios, asesoramiento)
- Sección DESTACADOS: carrusel horizontal con productos `isFeatured: true`
- Sección NOVEDADES: carrusel con últimos productos agregados
- Sección TENDENCIAS PARA EL INVIERNO: carrusel filtrado
- Sección MARCAS: logos dorados sobre negro (LATTAFA, ARMAF, AFNAN, RASASI, FRENCH AVENUE, AL HARAMAIN, BHARARA)
- Pirámide olfativa interactiva de muestra
- Newsletter footer

**Productos (/productos):**
- Filtros laterales: Categoría (checkboxes), Género (checkboxes), Marca (checkboxes), Precio (range slider)
- Ordenar por: Más vendidos, Precio menor a mayor, Precio mayor a menor, Novedades
- Grilla 4 columnas responsive (2 en tablet, 1 en mobile)
- Cada card: imagen, nombre, precio tachado + precio transferencia, badge de descuento si aplica
- Paginación o infinite scroll
- Búsqueda con debounce

**Detalle de producto (/productos/[slug]):**
- Galería de imágenes (main + thumbnails)
- Nombre, marca, precio transferencia + precio normal
- Selector de cantidad
- Botón "Agregar al carrito"
- Badge "Envío gratis" si aplica
- Pirámide olfativa interactiva con las notas del perfume (top/heart/base) — barras de color horizontal con animación
- Descripción completa
- Ocasiones recomendadas (tags)
- Género

**Carrito:**
- Slide-over panel derecho (no página separada)
- Lista de items con imagen, nombre, precio, cantidad (+ y -)
- Subtotal en tiempo real
- Botón "Ir al checkout"
- Persistir en localStorage para usuarios no logueados, sync con DB al loguear

**Checkout:**
- Paso 1: Datos de envío (nombre, email, teléfono, dirección, provincia, CP)
- Paso 2: Método de pago (Transferencia bancaria con 20% OFF / Tarjeta de crédito hasta 6 cuotas)
- Si elige transferencia: mostrar datos bancarios (CBU, alias, titular) y campo para subir comprobante
- Paso 3: Confirmación — resumen del pedido + número de orden
- Email automático al cliente con detalles del pedido
- Email automático al admin con nueva venta

### 🔐 AUTENTICACIÓN & CUENTAS

**Registro:**
- Formulario: nombre, email, contraseña (mínimo 8 chars, 1 mayúscula, 1 número), confirmar contraseña
- Cloudflare Turnstile captcha OBLIGATORIO
- Al registrar: enviar email de verificación (link con token que expira en 24h)
- No puede comprar hasta verificar email
- Hash de contraseña con bcrypt (cost 12)

**Login:**
- Email + contraseña
- Cloudflare Turnstile captcha
- Recordar sesión (checkbox)
- "¿Olvidaste tu contraseña?" → flujo de reset por email

**Verificación de email:**
- Token único enviado por Resend
- Página /verify-email?token=XXX que activa la cuenta
- Template de email bonito con logo SAID y botón dorado

**Reset de contraseña:**
- Formulario con email → envía link con token (expira 1h)
- Página para ingresar nueva contraseña

**Mi Cuenta:**
- Editar nombre, teléfono, dirección guardada
- Cambiar contraseña

**Mis Pedidos:**
- Lista de órdenes con número, fecha, estado, total
- Ver detalle de cada orden

### 👑 PANEL ADMIN (/admin)

**Acceso:** Solo usuarios con `role: ADMIN`. Middleware que redirige si no es admin.

**Dashboard principal:**
- Métricas del día/semana/mes: ventas totales, número de órdenes, nuevos usuarios, ingresos
- Gráfico de ventas últimos 30 días (recharts)
- Últimas 5 órdenes recientes
- Últimos 5 usuarios registrados
- Stock bajo (productos con stock < 5)

**Gestión de Pedidos (/admin/pedidos):**
- Tabla con: N° orden, cliente, fecha, productos, total, método de pago, estado
- Filtros por estado (Pendiente, Confirmado, Pagado, Enviado, Entregado, Cancelado)
- Filtro por fecha
- Al hacer click en una orden: modal/drawer con detalle completo
- Botones de acción: Confirmar pago, Marcar como enviado, Marcar como entregado, Cancelar
- Si pagó por transferencia: ver comprobante adjunto (imagen/PDF)
- Cambio de estado genera email automático al cliente

**Confirmación de Pagos (/admin/pagos):**
- Vista específica para órdenes con `status: PENDING` y método `TRANSFERENCIA`
- Muestra: cliente, monto, comprobante (preview de imagen), fecha
- Botón "Confirmar pago" → cambia status a PAID + envía email al cliente
- Botón "Rechazar" → cancela la orden + envía email explicativo

**Gestión de Productos (/admin/productos):**
- Tabla con todos los productos: imagen, nombre, marca, precio, stock, activo/inactivo
- Buscar por nombre
- Filtrar por categoría/marca
- Toggle rápido de isActive e isFeatured
- Botón "Nuevo Producto" → formulario completo
- Click en producto → formulario de edición

**Formulario de Producto (crear/editar):**
- Nombre, Slug (auto-generado desde nombre, editable)
- Marca (select con las marcas existentes o input libre)
- Categoría (ARABE / DESIGNER / NICHE / NATIONAL)
- Género (MASCULINO / FEMENINO / UNISEX)
- Descripción (textarea rich)
- Precio base, Precio efectivo, Precio transferencia
- Stock
- Ocasiones (tags input: Día, Noche, Formal, Casual, Primavera, etc.)
- Notas olfativas: top (tags), corazón (tags), base (tags)
- Imágenes: upload múltiple con preview, drag & drop
- Switches: Activo, Destacado, Envío gratis
- Guardar / Cancelar

**Gestión de Usuarios (/admin/usuarios):**
- Tabla: nombre, email, fecha registro, rol, nº pedidos, total gastado
- Cambiar rol (USER ↔ ADMIN)
- Ver detalle de un usuario con sus órdenes

### 📧 EMAILS (Resend)

Templates HTML bonitos con logo SAID, fondo oscuro, texto blanco, botones dorados:

1. **Verificación de email** — "Confirmá tu cuenta en SAID Perfumes" + botón
2. **Reset de contraseña** — "Restablecer contraseña" + botón + aviso de expiración
3. **Orden confirmada (cliente)** — número de orden, lista de productos, total, dirección, instrucciones de pago si es transferencia
4. **Nueva orden (admin)** — misma info para notificar al equipo
5. **Pago confirmado (cliente)** — "Tu pago fue confirmado, preparando tu pedido"
6. **Pedido enviado (cliente)** — "Tu pedido está en camino" con código de seguimiento (campo opcional)

---

## SEGURIDAD — IMPLEMENTAR TODO

- Rate limiting: 5 intentos de login por IP en 15 min (usar `@upstash/ratelimit` o similar)
- Cloudflare Turnstile en: registro, login, contacto, checkout (todos los formularios públicos)
- Helmet headers en Next.js (middleware)
- CSRF protection (NextAuth lo maneja, verificar)
- Input sanitization con Zod en TODOS los endpoints
- Contraseñas hasheadas con bcrypt cost 12
- Tokens de verificación/reset con `crypto.randomBytes(32)` + expiración
- Variables sensibles NUNCA en código, siempre process.env
- Middleware de auth para rutas protegidas (/admin/*, /mi-cuenta/*, /checkout/*)
- SQL injection imposible (usar Prisma siempre)

---

## VARIABLES DE ENTORNO (.env.example)

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/said_perfumes"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="SAID Perfumes <noreply@saidperfumes.com>"
EMAIL_ADMIN="admin@saidperfumes.com"

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"

# Upload (Cloudinary o local)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Datos bancarios para transferencia (mostrar en checkout)
BANK_CBU="0000000000000000000000"
BANK_ALIAS="said.perfumes"
BANK_HOLDER="SAID S.R.L."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
FREE_SHIPPING_THRESHOLD="150000"
TRANSFER_DISCOUNT_PERCENT="20"
INSTALLMENTS_MAX="6"
```

---

## DATOS DE PRODUCTOS EXISTENTES

La base de datos ya tiene 91 productos cargados con este esquema. Las imágenes locales están en `public/PERFUMES SAID/[MARCA]/[NOMBRE].jpg`. Solo tenés que conectar la DB existente y hacer `npx prisma db pull` o ajustar el schema.

**Marcas y productos clave (los más importantes a mostrar en home):**
- **Destacados home**: Yara (LATTAFA), Asad Bourbon (LATTAFA), Khamrah (LATTAFA), Club De Nuit Intense (ARMAF), 9PM (AFNAN), Hawas For Him (RASASI), Erba Pura 100ml (XERJOFF), Amber Oud Gold (AL HARAMAIN), Born In Roma (VALENTINO)
- **Categorías**: ARABE (la mayoría), DESIGNER (XERJOFF, VALENTINO)
- **Rango de precios**: $45.000 — $490.000 ARS

---

## ORDEN DE IMPLEMENTACIÓN

1. **Setup del proyecto**: `create-next-app`, instalar dependencias, configurar Tailwind + shadcn
2. **Prisma + DB**: conectar DB existente, ajustar schema si es necesario, `prisma generate`
3. **NextAuth**: configurar providers (credentials), callbacks de sesión, middleware de protección de rutas
4. **Design System**: tokens de color (negro/blanco/dorado), componentes base (Button, Card, Input)
5. **Layout de tienda**: Navbar + Footer
6. **Home**: hero, trust bar, carruseles de productos, marcas, newsletter
7. **Listado de productos**: grilla + filtros laterales + búsqueda
8. **Detalle de producto**: galería + pirámide olfativa + carrito
9. **Carrito**: store Zustand + slide-over + persistencia
10. **Auth pages**: login, register con Turnstile, verify email
11. **Checkout**: 3 pasos (envío, pago, confirmación)
12. **Emails**: templates Resend + envíos automáticos
13. **Panel admin**: dashboard, pedidos, pagos, productos (CRUD), usuarios
14. **Seguridad**: rate limiting, validaciones finales
15. **README**: setup completo, variables de entorno, scripts

---

## NOTAS FINALES

- El sitio vende **solo perfumes árabes** (categoría ARABE principalmente, más algunos DESIGNER como XERJOFF y VALENTINO)
- Los precios están en **pesos argentinos (ARS)**
- El descuento por transferencia es del **20%** sobre el precio base
- Envío gratis para compras superiores a **$150.000 ARS**
- Cuotas sin interés hasta **6** con cualquier tarjeta
- La pirámide olfativa es un diferenciador visual clave — hacerla bonita con colores vibrantes (naranja, verde, azul, rosa, amarillo) y animaciones suaves
- El slide de marcas en home tiene categorías: ÁRABE / DISEÑADOR / NICHO
- Implementar Cloudflare Turnstile **en todos los formularios públicos** — es un requisito del cliente
- No usar `any` en TypeScript
- Manejo de errores en loading/error/empty states en cada componente
- Mobile-first responsive design

---

**¡Empezá por el setup y el schema de Prisma, y luego seguí el orden de implementación!**
