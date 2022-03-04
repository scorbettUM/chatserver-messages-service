-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "user" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "kafkaPartition" INTEGER NOT NULL,
    "kafkaTopic" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
