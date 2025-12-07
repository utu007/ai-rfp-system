import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function parseVendorReply(text: string) {
  const prompt = `
You are an AI that extracts procurement proposal details.

From the vendor reply, extract these fields:

- price: total quoted price (number, no currency symbol)
- deliveryDays: delivery time in days (number)
- warranty: warranty / support details (string)
- notes: any extra conditions or comments (string)

Return ONLY valid JSON, no explanation, in this format:

{
  "price": number | null,
  "deliveryDays": number | null,
  "warranty": string | null,
  "notes": string | null
}

Vendor reply:
"""${text}"""
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a strict JSON generator." },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
  });

  const raw = completion.choices[0].message?.content?.trim() || "";

  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse vendor reply JSON from Groq:", raw);
    throw new Error("Invalid JSON from AI while parsing vendor reply");
  }
}
