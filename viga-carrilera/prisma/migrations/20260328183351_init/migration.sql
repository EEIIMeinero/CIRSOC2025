-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "engineer" TEXT,
    "license" TEXT,
    "company" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "general" TEXT NOT NULL,
    "spans" TEXT NOT NULL,
    "supports" TEXT NOT NULL,
    "stiffeners" TEXT NOT NULL,
    "secCfg" TEXT NOT NULL,
    "cranes" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "results" TEXT
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "Fy" REAL NOT NULL,
    "Fu" REAL NOT NULL,
    "E" REAL NOT NULL DEFAULT 200000,
    "G" REAL NOT NULL DEFAULT 77000,
    "norm" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "CraneTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "category" INTEGER NOT NULL,
    "Q" REAL NOT NULL,
    "Lp" REAL NOT NULL,
    "Gp" REAL NOT NULL,
    "Gc" REAL NOT NULL,
    "axles" INTEGER NOT NULL,
    "aw" REAL NOT NULL,
    "cmaa" TEXT NOT NULL,
    "application" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CraneTemplate_code_key" ON "CraneTemplate"("code");
