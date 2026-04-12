-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" REAL NOT NULL,
    "deliveryPrice" REAL NOT NULL DEFAULT 0,
    "recipientName" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "address" TEXT,
    "comment" TEXT,
    "deliveryMethod" TEXT,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "transactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "cardLast4", "city", "comment", "createdAt", "deliveryMethod", "deliveryPrice", "id", "paymentMethod", "phone", "recipientName", "status", "totalAmount", "updatedAt", "userId") SELECT "address", "cardLast4", "city", "comment", "createdAt", "deliveryMethod", "deliveryPrice", "id", "paymentMethod", "phone", "recipientName", "status", "totalAmount", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
