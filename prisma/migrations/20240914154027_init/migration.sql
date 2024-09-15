-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'HR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "profilePicture" TEXT,
    "securityQuestion" TEXT NOT NULL,
    "securityAnswer" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isMFAEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
