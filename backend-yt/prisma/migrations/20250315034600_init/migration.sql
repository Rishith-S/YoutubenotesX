-- CreateTable
CREATE TABLE "VideoNotes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "videoId" TEXT NOT NULL,
    "notesContent" JSONB[],

    CONSTRAINT "VideoNotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoNotes_userId_key" ON "VideoNotes"("userId");

-- AddForeignKey
ALTER TABLE "VideoNotes" ADD CONSTRAINT "VideoNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
