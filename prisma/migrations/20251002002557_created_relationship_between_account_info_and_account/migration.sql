/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[accountId]` on the table `AccountInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."AccountInfo" DROP CONSTRAINT "AccountInfo_accountId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "availableBalance" SET DEFAULT 0,
ALTER COLUMN "pendingBalance" SET DEFAULT 0,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Account_id_seq";

-- AlterTable
ALTER TABLE "AccountInfo" ALTER COLUMN "accountId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AccountInfo_accountId_key" ON "AccountInfo"("accountId");

-- AddForeignKey
ALTER TABLE "AccountInfo" ADD CONSTRAINT "AccountInfo_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
