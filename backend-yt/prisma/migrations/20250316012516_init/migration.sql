/*
  Warnings:

  - Added the required column `playlistId` to the `VideoNotes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoNotes" ADD COLUMN     "playlistId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "VideoNotes" ADD CONSTRAINT "VideoNotes_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
