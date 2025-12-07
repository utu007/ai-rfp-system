import "dotenv/config";
import nodemailer from "nodemailer";
import { prisma } from "./prisma";

// Create a reusable transporter object using Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

if (!process.env.MAIL_FROM) {
  console.warn(
    'MAIL_FROM is not set in .env. Using default "no-reply@example.com".'
  );
}

/**
 * Sends the RFP with given ID to all vendors in the system.
 * Returns the list of vendor emails it was sent to.
 */
export async function sendRfpToAllVendors(rfpId: number): Promise<string[]> {
  if (!rfpId || Number.isNaN(rfpId)) {
    throw new Error("Invalid RFP id");
  }

  // 1. Load RFP with items
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: { items: true },
  });

  if (!rfp) {
    throw new Error("RFP not found");
  }

  // 2. Load all vendors
  const vendors = await prisma.vendor.findMany();

  if (vendors.length === 0) {
    throw new Error("No vendors found to send to");
  }

  // 3. Build email body
  const itemsText =
    rfp.items.length > 0
      ? rfp.items.map((i) => `${i.name} — Qty: ${i.quantity}`).join("\n")
      : "No specific items listed.";

  const body = `
You have received a new Request for Proposal (RFP).

Title: ${rfp.title}

Description:
${rfp.description}

Budget: ${rfp.budget ?? "N/A"}
Delivery Days: ${rfp.deliveryDays ?? "N/A"}
Payment Terms: ${rfp.paymentTerms ?? "N/A"}
Warranty: ${rfp.warranty ?? "N/A"}

Items:
${itemsText}

Please reply with:
- Your total price
- Delivery timeline
- Warranty terms
- Any additional conditions
`;

  const from = process.env.MAIL_FROM || "no-reply@example.com";

  const sentTo: string[] = [];

  // 4. Send email to each vendor
  for (const vendor of vendors) {
    await transporter.sendMail({
      from,
      to: vendor.email,
      subject: `RFP: ${rfp.title}`,
      text: body,
    });

    sentTo.push(vendor.email);
  }

  return sentTo;
}
