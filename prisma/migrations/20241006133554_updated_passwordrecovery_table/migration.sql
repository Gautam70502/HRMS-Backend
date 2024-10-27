-- CreateTable
CREATE TABLE "passwordRecovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recoveryToken" TEXT NOT NULL,
    "recoveryTokenExpiry" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passwordRecovery_pkey" PRIMARY KEY ("id")
);
