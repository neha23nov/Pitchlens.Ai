import { NextResponse } from "next/server";
import { Endee } from "endee";

export async function POST(req: Request) {
  try {
    const { text, persona } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
console.log("KEY PREFIX:", process.env.GEMINI_API_KEY?.slice(0, 8));

    // STEP 1: Get embedding
    let vector: number[];
    try {
      const embRes = await fetch("http://localhost:5001/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const embData = await embRes.json();
      vector = embData.vector;
    } catch (e: any) {
      return NextResponse.json({
        error: "Cannot reach embedding service",
        detail: e.message,
      }, { status: 500 });
    }

    // STEP 2: Search Endee
    let similar: any[] = [];
    try {
      const client = new Endee();
      const index = await client.getIndex("pitch_index");
      similar = await index.query({ vector, topK: 3 });
    } catch (e: any) {
      console.log("Endee error (non-fatal):", e.message);
    }

    // STEP 3: Build context
    const context = similar.length > 0
      ? similar.map((r: any, i: number) =>
          `Example ${i + 1} (${(r.similarity * 100).toFixed(0)}% similar): ${r.meta?.text}`
        ).join("\n\n")
      : "No similar pitches found in database.";

    const personaLabel = persona.replace(/_/g, " ");

    // STEP 4: Call Gemini
    const prompt = `You are a ${personaLabel} investor evaluating a startup pitch.

SIMILAR SUCCESSFUL PITCHES FROM DATABASE:
${context}

PITCH TO EVALUATE:
${text}

Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON:
{"overall_score":7,"scores":{"problem_clarity":7,"market_size":6,"business_model":7,"traction":5,"team_moat":6},"strengths":["strength one","strength two","strength three"],"weaknesses":["weakness one","weakness two","weakness three"],"suggestions":["suggestion one","suggestion two","suggestion three"],"rewritten_pitch":"Improved version of the pitch in 3-4 sentences.","investor_verdict":"Two sentence verdict from the ${personaLabel} perspective."}`;

    let geminiText = "";
    try {
  const geminiRes = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
     model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  }
);

const geminiData = await geminiRes.json();
console.log("GROQ FULL RESPONSE:", JSON.stringify(geminiData).slice(0, 500));
geminiText = geminiData.choices?.[0]?.message?.content || "";

      // Check for API errors
      if (geminiData.error) {
        return NextResponse.json({
          error: "Gemini API error",
          detail: geminiData.error.message,
        }, { status: 500 });
      }

      geminiText = geminiData.choices?.[0]?.message?.content || "";
      console.log("Raw Gemini text:", geminiText.slice(0, 200));

    } catch (e: any) {
      return NextResponse.json({
        error: "Cannot reach Gemini API",
        detail: e.message,
      }, { status: 500 });
    }

   if (!geminiText) {
  return NextResponse.json({
    error: "Empty response from AI",
    detail: `Check GROQ_API_KEY in .env.local. Key exists: ${!!process.env.GROQ_API_KEY}`,
  }, { status: 500 });
}

    // STEP 5: Parse JSON safely
    let evaluation;
    try {
      // Remove any markdown code blocks if present
      const cleaned = geminiText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON object in the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }

      evaluation = JSON.parse(jsonMatch[0]);
    } catch (e: any) {
      console.log("JSON parse error:", e.message);
      console.log("Raw text was:", geminiText);
      return NextResponse.json({
        error: "Failed to parse Gemini response",
        detail: e.message,
        raw: geminiText.slice(0, 500),
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      evaluation,
      similar_pitches: similar,
    });

  } catch (error: any) {
    console.error("Top level error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}