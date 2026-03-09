-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "specifications" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "variants" TEXT,
    "priceDisplay" BOOLEAN NOT NULL DEFAULT true,
    "minOrder" TEXT,
    "priceRange" TEXT,
    "tieredPricing" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "id", "images", "isActive", "isFeatured", "name", "shortDescription", "slug", "specifications", "tags", "updatedAt", "variants") SELECT "categoryId", "createdAt", "description", "id", "images", "isActive", "isFeatured", "name", "shortDescription", "slug", "specifications", "tags", "updatedAt", "variants" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
