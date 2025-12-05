# Instrucciones para Claude - Setup de Base de Datos

## Contexto
Este proyecto usa Prisma con SQLite. Cuando se clona en una nueva computadora o después de un pull con cambios en el schema, necesitas sincronizar la base de datos.

## Comandos a ejecutar

### 1. Sincronizar schema con la base de datos
```bash
npx prisma db push
```
Este comando:
- Lee el schema de `prisma/schema.prisma`
- Crea/actualiza las tablas en la base de datos SQLite (`prisma/dev.db`)
- No requiere migraciones formales para desarrollo

### 2. Generar el cliente de Prisma
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

### 3. (Opcional) Ver la base de datos
```bash
npx prisma studio
```
Abre una interfaz web para ver/editar datos.

## Cambios recientes en el Schema

### Modelo Character (NUEVO)
```prisma
model Character {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relación opcional con Series
  seriesId    String?
  series      Series?  @relation(fields: [seriesId], references: [id], onDelete: SetNull)

  // Relaciones
  figures     Figure[]
}
```

### Cambios en Figure
- Agregado campo `characterId` (opcional)
- Agregada relación con `Character`

### Cambios en Series
- Agregada relación inversa `characters Character[]`

## Archivos nuevos creados
- `src/app/api/characters/route.ts` - API GET/POST
- `src/app/api/characters/[id]/route.ts` - API GET/PUT/DELETE
- `src/app/admin/characters/page.tsx` - Página admin
- `src/app/admin/characters/CharactersClient.tsx` - Componente cliente

## Orden de ejecución recomendado
1. `npm install` (si es clone fresco)
2. `npx prisma db push` (sincroniza DB)
3. `npx prisma generate` (genera tipos)
4. `npm run dev` (inicia servidor)
