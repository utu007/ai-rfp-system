-- CreateTable
CREATE TABLE "Rfp" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "deliveryDays" INTEGER,
    "paymentTerms" TEXT,
    "warranty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rfp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfpItem" (
    "id" SERIAL NOT NULL,
    "rfpId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "details" TEXT,

    CONSTRAINT "RfpItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RfpItem" ADD CONSTRAINT "RfpItem_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
