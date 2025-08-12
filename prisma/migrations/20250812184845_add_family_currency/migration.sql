-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP');

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
