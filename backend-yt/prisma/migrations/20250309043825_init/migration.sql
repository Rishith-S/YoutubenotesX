-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "playListId" TEXT NOT NULL,
    "playListTitle" TEXT NOT NULL,
    "playListImage" TEXT NOT NULL,
    "playListContent" JSONB[],

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_key" ON "Playlist"("userId");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
