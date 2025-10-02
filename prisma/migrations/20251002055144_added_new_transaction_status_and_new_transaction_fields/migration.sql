/*
  Warnings:

  - Added the required column `originalAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'Processing';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "convertedAmount" INTEGER,
ADD COLUMN     "originalAmount" INTEGER NOT NULL;
