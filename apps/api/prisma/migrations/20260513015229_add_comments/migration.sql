-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_petitionId_deletedAt_idx" ON "comments"("petitionId", "deletedAt");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
