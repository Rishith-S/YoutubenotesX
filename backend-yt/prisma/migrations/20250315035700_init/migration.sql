/*
  Warnings:

  - Changed the type of `notesContent` on the `VideoNotes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VideoNotes" DROP COLUMN "notesContent",
ADD COLUMN     "notesContent" JSONB NOT NULL;
