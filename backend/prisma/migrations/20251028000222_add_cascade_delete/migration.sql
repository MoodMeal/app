/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChatSession` table. All the data in the column will be lost.
  - Made the column `title` on table `ChatSession` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dish" DROP CONSTRAINT "Dish_sessionId_fkey";

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "createdAt",
ALTER COLUMN "title" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
