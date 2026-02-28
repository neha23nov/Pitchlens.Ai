import { NextResponse } from "next/server";
import { Endee } from "endee";

export async function POST(req: Request) {
  console.log("🔥 API ROUTE HIT");

  try {
    const body = await req.json();
    const { text, persona } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // STEP 1: Get embedding from Python service
    let vector: number[];
    try {
      console.log("Calling embedding service...");

      const embeddingRes = await fetch("http://localhost:5001/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!embeddingRes.ok) {
        const err = await embeddingRes.text();
        return NextResponse.json({
          error: "Embedding service failed",
          detail: err,
          step: "embedding",
        }, { status: 500 });
      }

      const data = await embeddingRes.json();
      vector = data.vector;

      if (!vector || !Array.isArray(vector)) {
        return NextResponse.json({
          error: "No vector returned from embedding service",
          data,
          step: "embedding_parse",
        }, { status: 500 });
      }

      console.log("✅ Vector length:", vector.length);

    } catch (embErr: any) {
      console.log("❌ Embedding error:", embErr.message);
      return NextResponse.json({
        error: "Cannot reach embedding service",
        detail: embErr.message,
        step: "embedding_connection",
        fix: "Run: cd embedding-service && python app.py",
      }, { status: 500 });
    }

    // STEP 2: Query Endee using official SDK
    try {
      console.log("Querying Endee via SDK...");

      const client = new Endee();
      const index = await client.getIndex("pitch_index");
      const results = await index.query({ vector, topK: 5 });

      console.log("✅ Endee results:", JSON.stringify(results).slice(0, 200));

      return NextResponse.json({
        success: true,
        persona: persona || "general",
        results,
      });

    } catch (endeeErr: any) {
      console.log("❌ Endee error:", endeeErr.message);
      return NextResponse.json({
        error: "Endee query failed",
        detail: endeeErr.message,
        step: "endee_query",
        fix: "Make sure Docker endee-server is running on port 8080",
      }, { status: 500 });
    }

  } catch (error: any) {
    console.log("❌ TOP LEVEL ERROR:", error.message);
    return NextResponse.json({
      error: "Server Error",
      detail: error?.message,
    }, { status: 500 });
  }
}