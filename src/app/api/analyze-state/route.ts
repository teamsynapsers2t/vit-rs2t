import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing from server environment." }, { status: 500 });
    }

    const body = await request.json();
    const { stateName, budget, allocations } = body;

    const prompt = `You are an elite government financial auditor analyzing the budget of ${stateName}, India.
Total State Capital: ₹${budget.toLocaleString()} Crore.
Proposed sector allocation spread: ${JSON.stringify(allocations)}

Provide an extremely detailed, highly realistic analytical report on this specific budget distribution. 
Explain if they are spending an unbalanced amount in specific administrative sectors. Flag critical gaps. Speak like a senior public policy analyst. 
If allocations are completely zero, firmly warn about absolute systemic failure in that sector.

Respond ONLY in strictly valid JSON format matching this payload structure exactly:
{
  "executive_analysis": "A powerful 2-3 sentence overarching financial summary reviewing the state's total portfolio.",
  "sector_insights": [
    {
      "sector_id": "health",
      "status_level": "Critical Gap", 
      "analysis": "Two detailed sentences explaining exactly why this specific fund amount impacts real-world state metrics (e.g. HDI, mortality, growth)."
    }
  ]
}

Make sure "sector_id" directly perfectly matches Keys from the input allocation map.
Provide insightful analytical feedback for exactly 4 distinct sectors you find most interesting or anomalous in the input. Do NOT include markdown tags around the JSON.
`;

    // Native fetch to Gemini REST API for maximum Next.js edge compatibility
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(geminiUrl, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
       })
    });

    if (!geminiRes.ok) {
       const errorData = await geminiRes.text();
       console.error("Gemini API Error Detail:", errorData);
       throw new Error(`Gemini Call Failed: ${geminiRes.statusText}`);
    }

    const data = await geminiRes.json();
    
    // Extract text payload
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsedData = JSON.parse(rawText);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to generate AI insights." }, { status: 500 });
  }
}
