/*
  Warnings:

  - The primary key for the `package_features` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `feature_name` on the `package_features` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `package_features` table. All the data in the column will be lost.
  - Added the required column `feature_id` to the `package_features` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_features" DROP CONSTRAINT "package_features_pkey",
DROP COLUMN "feature_name",
DROP COLUMN "id",
ADD COLUMN     "feature_id" UUID NOT NULL,
ADD CONSTRAINT "package_features_pkey" PRIMARY KEY ("package_id", "feature_id");

-- CreateTable
CREATE TABLE "features" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_code_key" ON "features"("code");

-- AddForeignKey
ALTER TABLE "package_features" ADD CONSTRAINT "package_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
