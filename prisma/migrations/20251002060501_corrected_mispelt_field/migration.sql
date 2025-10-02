/*
  Warnings:

  - You are about to drop the column `fromAcountId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `fromAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_fromAcountId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fromAcountId",
ADD COLUMN     "fromAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
