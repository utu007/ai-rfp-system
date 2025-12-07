-- CreateTable
CREATE TABLE "VendorResponse" (
    "id" SERIAL NOT NULL,
    "rfpId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "deliveryDays" INTEGER,
    "warranty" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendorResponse" ADD CONSTRAINT "VendorResponse_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorResponse" ADD CONSTRAINT "VendorResponse_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
