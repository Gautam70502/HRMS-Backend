-- CreateTable
CREATE TABLE "userOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userOtp_pkey" PRIMARY KEY ("id")
);
