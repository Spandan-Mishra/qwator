-- CreateEnum
CREATE TYPE "TsnStatus" AS ENUM ('Processing', 'Success', 'Failure');

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "voter_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "TsnStatus" NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
