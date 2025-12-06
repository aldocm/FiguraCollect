# Instrucciones para Claude - Setup de Base de Datos

## Contexto
Este proyecto usa Prisma con SQLite. Cuando se clona en una nueva computadora o después de un pull con cambios en el schema, necesitas sincronizar la base de datos.

## Comandos a ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Sincronizar schema con la base de datos
```bash
npx prisma db push
```
Este comando:
- Lee el schema de `prisma/schema.prisma`
- Crea/actualiza las tablas en la base de datos SQLite (`prisma/dev.db`)
- No requiere migraciones formales para desarrollo

### 3. Generar el cliente de Prisma
```bash
npx prisma generate
```
Este comando:
- Genera los tipos de TypeScript basados en el schema
- Actualiza `node_modules/.prisma/client`

**IMPORTANTE**: Si el servidor de desarrollo está corriendo, puede fallar con error `EPERM`. En ese caso:
1. Detén el servidor de desarrollo (Ctrl+C)
2. Ejecuta `npx prisma generate`
3. Reinicia el servidor

### 4. (Opcional) Poblar con datos de prueba
```bash
npx prisma db seed
```
Crea usuarios de prueba, marcas, líneas, series, figuras de ejemplo, etc.

### 5. (Opcional) Ver la base de datos
```bash
npx prisma studio
```
Abre una interfaz web para ver/editar datos.

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
```

---

## Schema Completo Actual

### Usuarios y Autenticación

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  username      String       @unique
  password      String
  name          String?
  country       String
  bio           String?
  role          String       @default("USER") // USER | ADMIN | SUPERADMIN
  isPro         Boolean      @default(false)
  emailVerified Boolean      @default(false)
  verifyToken   String?
  measureUnit   String       @default("cm") // cm | in
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  userFigures   UserFigure[]
  lists         List[]
  reviews       Review[]
  notifications Notification[]
}
```

### Catálogo Principal

```prisma
model Brand {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  country     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lines       Line[]
  figures     Figure[]
}

model Line {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  releaseYear Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  brandId     String
  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  figures     Figure[]
}

model Series {
  id          String         @id @default(cuid())
  name        String
  slug        String         @unique
  description String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  figures     FigureSeries[]
  characters  Character[]
}

model Character {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  seriesId    String?
  series      Series?  @relation(fields: [seriesId], references: [id], onDelete: SetNull)

  figures     Figure[]
}

model Tag {
  id        String      @id @default(cuid())
  name      String      @unique
  createdAt DateTime    @default(now())

  figures   FigureTag[]
}
```

### Figuras

```prisma
model Figure {
  id          String   @id @default(cuid())
  name        String
  description String?
  sku         String?
  heightCm    Float?
  widthCm     Float?
  depthCm     Float?
  scale       String?
  material    String?
  maker       String?
  priceMXN    Float?
  priceUSD    Float?
  priceYEN    Float?
  originalPriceCurrency String? // MXN | USD | YEN
  releaseDate String?  // YYYY-MM format
  isReleased  Boolean  @default(false)
  isNSFW      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  brandId     String
  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  lineId      String
  line        Line     @relation(fields: [lineId], references: [id], onDelete: Cascade)
  characterId String?
  character   Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)

  images        FigureImage[]
  tags          FigureTag[]
  series        FigureSeries[]
  variants      FigureVariant[]
  userFigures   UserFigure[]
  listItems     ListItem[]
  reviews       Review[]
  notifications Notification[]
}

model FigureImage {
  id        String   @id @default(cuid())
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now())

  figureId  String
  figure    Figure   @relation(fields: [figureId], references: [id], onDelete: Cascade)
}

model FigureTag {
  id       String @id @default(cuid())
  figureId String
  tagId    String

  figure   Figure @relation(fields: [figureId], references: [id], onDelete: Cascade)
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([figureId, tagId])
}

model FigureSeries {
  id       String @id @default(cuid())
  figureId String
  seriesId String

  figure   Figure @relation(fields: [figureId], references: [id], onDelete: Cascade)
  series   Series @relation(fields: [seriesId], references: [id], onDelete: Cascade)

  @@unique([figureId, seriesId])
}

model FigureVariant {
  id        String   @id @default(cuid())
  name      String
  priceMXN  Float?
  priceUSD  Float?
  priceYEN  Float?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parentFigureId String
  parentFigure   Figure          @relation(fields: [parentFigureId], references: [id], onDelete: Cascade)
  images         VariantImage[]
}

model VariantImage {
  id        String   @id @default(cuid())
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now())

  variantId String
  variant   FigureVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
}
```

### Colección de Usuario

```prisma
model UserFigure {
  id            String   @id @default(cuid())
  status        String   @default("WISHLIST") // WISHLIST | PREORDER | OWNED
  userPrice     Float?
  preorderMonth String?  // YYYY-MM format
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  figureId      String
  figure        Figure   @relation(fields: [figureId], references: [id], onDelete: Cascade)

  @@unique([userId, figureId])
}
```

### Listas

```prisma
model List {
  id          String     @id @default(cuid())
  name        String
  description String?
  isOfficial  Boolean    @default(false)
  isFeatured  Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  createdById String
  createdBy   User       @relation(fields: [createdById], references: [id], onDelete: Cascade)
  items       ListItem[]
}

model ListItem {
  id        String   @id @default(cuid())
  order     Int      @default(0)
  createdAt DateTime @default(now())

  listId    String
  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  figureId  String
  figure    Figure   @relation(fields: [figureId], references: [id], onDelete: Cascade)

  @@unique([listId, figureId])
}
```

### Reviews

```prisma
model Review {
  id          String        @id @default(cuid())
  rating      Float         // 1.0 - 5.0
  title       String
  description String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  figureId    String
  figure      Figure        @relation(fields: [figureId], references: [id], onDelete: Cascade)
  images      ReviewImage[]

  @@unique([userId, figureId])
}

model ReviewImage {
  id        String   @id @default(cuid())
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now())

  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
}
```

### Notificaciones

```prisma
model Notification {
  id        String   @id @default(cuid())
  type      String   // FIGURE_RELEASED | PREORDER_REMINDER | etc.
  title     String
  message   String
  isRead    Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  figureId  String?
  figure    Figure?  @relation(fields: [figureId], references: [id], onDelete: SetNull)
}
```

### Configuración del Sistema

```prisma
model SystemConfiguration {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   // JSON content
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HomeSection {
  id          String   @id @default(cuid())
  title       String
  type        String   // "QUERY" | "LIST" | "PRESET"
  config      String   // JSON: { brandId, lineId, minPrice, maxPrice, isReleased, sort, listId }
  viewAllUrl  String?
  order       Int      @default(0)
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Usuarios de Prueba (después de seed)

| Email | Password | Role |
|-------|----------|------|
| admin@figuracollect.com | admin123 | SUPERADMIN |
| demo@figuracollect.com | user123 | USER |

---

## APIs Disponibles

### Catálogo
- `GET/POST /api/brands` - Marcas
- `GET/PUT/DELETE /api/brands/[id]`
- `GET/POST /api/lines` - Líneas
- `GET/PUT/DELETE /api/lines/[id]`
- `GET/POST /api/series` - Series
- `GET/PUT/DELETE /api/series/[id]`
- `GET/POST /api/characters` - Personajes
- `GET/PUT/DELETE /api/characters/[id]`
- `GET/POST /api/tags` - Tags
- `GET/PUT/DELETE /api/tags/[id]`
- `GET/POST /api/figures` - Figuras
- `GET/PUT/DELETE/PATCH /api/figures/[id]`

### Usuario
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual
- `GET/POST /api/inventory` - Inventario del usuario
- `PUT/DELETE /api/inventory/[id]`
- `GET/POST /api/lists` - Listas
- `GET/PUT/DELETE /api/lists/[id]`
- `POST /api/reviews` - Crear review

### Admin
- `GET /api/admin/users` - Lista usuarios (SUPERADMIN)
- `PUT/DELETE /api/admin/users/[id]`
- `GET/POST /api/admin/home-sections` - Secciones del home
- `PUT/DELETE /api/admin/home-sections/[id]`
- `POST /api/admin/home-sections/reorder`
- `GET/PUT /api/admin/home-config` - Configuración del home

### Utilidades
- `GET /api/calendar/releases` - Releases por mes
- `GET /api/timeline` - Timeline de figuras

---

## Páginas Admin

- `/admin` - Dashboard principal
- `/admin/brands` - Gestión de marcas
- `/admin/lines` - Gestión de líneas
- `/admin/series` - Gestión de series
- `/admin/characters` - Gestión de personajes
- `/admin/tags` - Gestión de tags
- `/admin/figures` - Gestión de figuras
- `/admin/users` - Gestión de usuarios (SUPERADMIN)
- `/admin/home` - Configuración del home (SUPERADMIN)

---

## Orden de ejecución recomendado (setup completo)

```bash
# 1. Clonar e instalar
git clone <repo>
cd FiguraCollect
npm install

# 2. Configurar base de datos
npx prisma db push
npx prisma generate

# 3. (Opcional) Poblar con datos de prueba
npx prisma db seed

# 4. Iniciar desarrollo
npm run dev
```

## Si hay errores de EPERM al generar Prisma
```bash
# Detener el servidor dev primero, luego:
npx prisma generate
npm run dev
```

## Para resetear la base de datos completamente
```bash
# Eliminar dev.db y recrear
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```
