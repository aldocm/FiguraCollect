/*
  Warnings:

  - You are about to drop the column `size` on the `Figure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN "country" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "figureId" TEXT,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Figure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "heightCm" REAL,
    "widthCm" REAL,
    "depthCm" REAL,
    "scale" TEXT,
    "material" TEXT,
    "maker" TEXT,
    "priceMXN" REAL,
    "priceUSD" REAL,
    "priceYEN" REAL,
    "originalPriceCurrency" TEXT,
    "releaseDate" TEXT,
    "isReleased" BOOLEAN NOT NULL DEFAULT false,
    "isNSFW" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "brandId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    CONSTRAINT "Figure_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Figure_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Figure" ("brandId", "createdAt", "description", "id", "isNSFW", "isReleased", "lineId", "maker", "material", "name", "priceMXN", "priceUSD", "priceYEN", "releaseDate", "scale", "sku", "updatedAt") SELECT "brandId", "createdAt", "description", "id", "isNSFW", "isReleased", "lineId", "maker", "material", "name", "priceMXN", "priceUSD", "priceYEN", "releaseDate", "scale", "sku", "updatedAt" FROM "Figure";
DROP TABLE "Figure";
ALTER TABLE "new_Figure" RENAME TO "Figure";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT NOT NULL,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "measureUnit" TEXT NOT NULL DEFAULT 'cm',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("bio", "country", "createdAt", "email", "emailVerified", "id", "name", "password", "role", "updatedAt", "username", "verifyToken") SELECT "bio", "country", "createdAt", "email", "emailVerified", "id", "name", "password", "role", "updatedAt", "username", "verifyToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
