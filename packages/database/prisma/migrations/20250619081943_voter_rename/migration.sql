/*
  Warnings:

  - You are about to drop the column `worker_id` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `voter_id` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_worker_id_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "worker_id",
ADD COLUMN     "voter_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Worker";

-- CreateTable
CREATE TABLE "Voter" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "pending_amount" INTEGER NOT NULL,
    "locked_amount" INTEGER NOT NULL,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_address_key" ON "Voter"("address");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
