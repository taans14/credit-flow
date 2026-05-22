-- CreateTable
CREATE TABLE "user_features" (
    "user_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,

    CONSTRAINT "user_features_pkey" PRIMARY KEY ("user_id","feature_id")
);

-- AddForeignKey
ALTER TABLE "user_features" ADD CONSTRAINT "user_features_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_features" ADD CONSTRAINT "user_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
