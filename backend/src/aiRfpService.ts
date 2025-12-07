import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function createRfpFromText(text: string) {
  const prompt = `
You are an assistant that converts procurement needs into a structured JSON RFP.

Input:
"""
${text}
"""

Output: ONLY valid JSON, no extra text, no markdown.
Use exactly this structure:

{
  "title": string,
  "budget": number | null,
  "deliveryDays": number | null,
  "paymentTerms": string | null,
  "warranty": string | null,
  "items": [
    {
      "name": string,
      "quantity": number,
      "details": {}
    }
  ]
}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",  // <--- updated model
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
    console.error("Groq JSON parse failed:", raw);
    throw new Error("Invalid AI JSON output");
  }
}
