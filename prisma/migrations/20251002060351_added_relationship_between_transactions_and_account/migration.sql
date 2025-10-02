/*
  Warnings:

  - Added the required column `fromAcountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fromAcountId" TEXT NOT NULL,
ADD COLUMN     "toAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromAcountId_fkey" FOREIGN KEY ("fromAcountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
