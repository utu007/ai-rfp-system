import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';
import { createRfpFromText } from './aiRfpService';
import { sendRfpToAllVendors } from "./rfpEmailService";
import { parseVendorReply } from "./parseVendorReplyService";
import { scoreProposalsForRfp } from "./scoringService";




const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Create RFP from natural language (AI + DB)
app.post('/api/rfps/from-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const structured = await createRfpFromText(text);

    const rfp = await prisma.rfp.create({
      data: {
        title: structured.title,
        description: text,
        budget: structured.budget,
        deliveryDays: structured.deliveryDays,
        paymentTerms: structured.paymentTerms,
        warranty: structured.warranty,
        items: {
          create: (structured.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            details: i.details ? JSON.stringify(i.details) : null,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(rfp);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create RFP' });
  }
});

// 👉 Create vendor
app.post('/api/vendors', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const vendor = await prisma.vendor.create({
      data: { name, email },
    });

    res.status(201).json(vendor);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2002') {
      // Unique constraint error (email)
      return res.status(400).json({ error: 'Vendor with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// 👉 List vendors
app.get('/api/vendors', async (_req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// 👉 List RFPs (useful later in UI)
app.get('/api/rfps', async (_req, res) => {
  try {
    const rfps = await prisma.rfp.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    res.json(rfps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch RFPs' });
  }
});

// Send RFP by id to all vendors (email)
app.post("/api/rfps/:id/send", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid RFP id" });
    }

    const sentTo = await sendRfpToAllVendors(id);

    return res.json({
      message: "RFP emailed to vendors",
      sentTo,
    });
  } catch (err: any) {
    console.error("Error while sending RFP emails:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to send RFP emails" });
  }
});

// Vendor sends a reply for a specific RFP
app.post("/api/vendors/:vendorId/rfps/:rfpId/reply", async (req, res) => {
  try {
    const vendorId = Number(req.params.vendorId);
    const rfpId = Number(req.params.rfpId);
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (Number.isNaN(vendorId) || Number.isNaN(rfpId)) {
      return res.status(400).json({ error: "Invalid vendorId or rfpId" });
    }

    // Ensure vendor + rfp exist (optional but good)
    const [vendor, rfp] = await Promise.all([
      prisma.vendor.findUnique({ where: { id: vendorId } }),
      prisma.rfp.findUnique({ where: { id: rfpId } }),
    ]);

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    if (!rfp) return res.status(404).json({ error: "RFP not found" });

    // Use AI to parse the reply
    const parsed = await parseVendorReply(message);

    // Save in VendorResponse table
    const saved = await prisma.vendorResponse.create({
      data: {
        vendorId,
        rfpId,
        message,
        price: parsed.price ?? null,
        deliveryDays: parsed.deliveryDays ?? null,
        warranty: parsed.warranty ?? null,
        notes: parsed.notes ?? null,
      },
    });

    res.status(201).json(saved);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to save vendor reply" });
  }
});

// (Optional) list responses for an RFP
app.get("/api/rfps/:id/responses", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const responses = await prisma.vendorResponse.findMany({
      where: { rfpId: id },
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// Score all vendor responses for a given RFP
app.get("/api/rfps/:id/score", async (req, res) => {
  try {
    const rfpId = Number(req.params.id);
    if (Number.isNaN(rfpId)) {
      return res.status(400).json({ error: "Invalid RFP ID" });
    }

    const scores = await scoreProposalsForRfp(rfpId);
    res.json(scores);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});
