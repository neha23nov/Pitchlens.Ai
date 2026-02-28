# PitchLens AI 🎯

> Investor-grade AI analysis for startup founders. See your pitch through the eyes of different VCs — powered by Endee vector search, semantic similarity, and RAG-based evaluation.

![PitchLens AI](https://img.shields.io/badge/Vector_DB-Endee-f59e0b?style=flat-square) ![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?style=flat-square) ![Groq](https://img.shields.io/badge/AI-Groq_Llama_3.3-blue?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📌 Problem Statement

Most startup founders receive generic, surface-level feedback on their pitches. They have no way to benchmark their pitch against successful ones, understand how different investors evaluate their idea, or get actionable, structured improvements before speaking to real investors.

**PitchLens solves this** by combining vector similarity search with LLM-powered evaluation to give founders investor-grade feedback in seconds.

---

## 🚀 What It Does

1. **Founder pastes their pitch** and selects an investor persona (Tech VC, Growth VC, Fintech VC, Impact Investor)
2. **System embeds the pitch** into a 384-dimensional vector using a local sentence transformer model
3. **Endee vector database** retrieves the most semantically similar benchmark pitches
4. **RAG pipeline** sends the pitch + retrieved context to Groq's Llama 3.3 model
5. **Investor-grade report** is returned with:
   - Overall score (1–10)
   - 5 category scores with animated bars
   - Strengths, weaknesses, actionable suggestions
   - AI-rewritten improved version of the pitch
   - Investor verdict from the selected VC perspective
   - Similar pitches from the vector database

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js)                     │
│         Persona Selector + Pitch Input + Results UI      │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /api/evaluate
┌──────────────────────▼──────────────────────────────────┐
│              Next.js API Route (Server-side)             │
│                  app/api/evaluate/route.ts               │
└────────┬──────────────────────────┬─────────────────────┘
         │ POST /embed              │ SDK query()
┌────────▼──────────┐    ┌──────────▼──────────────────────┐
│  Python Embedding │    │     Endee Vector Database        │
│  Service (: 5001) │    │     Docker Container (: 8080)    │
│  all-MiniLM-L6-v2 │    │     pitch_index (384 dims)       │
│  → 384-dim vector │    │     cosine similarity search     │
└────────┬──────────┘    └──────────┬──────────────────────┘
         │                          │ top-k similar pitches
         └──────────┬───────────────┘
                    │ pitch + context
         ┌──────────▼──────────────────┐
         │     Groq AI API (Cloud)     │
         │   llama-3.3-70b-versatile   │
         │   Persona-aware evaluation  │
         └──────────┬──────────────────┘
                    │ structured JSON
         ┌──────────▼──────────────────┐
         │   Scores + Feedback +       │
         │   Suggestions + Rewrite     │
         └─────────────────────────────┘
```

---

## 🧠 How Endee Is Used

Endee is the **core** of this system. Without vector search, the evaluation would be generic. With it, every response is grounded in real benchmark data.

### Index Configuration
```json
{
  "index_name": "pitch_index",
  "dim": 384,
  "space_type": "cosine",
  "M": 16,
  "ef_con": 128,
  "precision": "float16"
}
```

### Insert Flow (Seeding)
```javascript
const client = new Endee();
const index = await client.getIndex("pitch_index");
await index.upsert([
  { id: "bench_1", vector: [...384 numbers], meta: { text: "pitch example" } }
]);
```

### Search Flow (Query)
```javascript
const results = await index.query({ vector: userPitchVector, topK: 3 });
// Returns: [{ id, similarity, meta: { text } }, ...]
```

### RAG Integration
The retrieved similar pitches are injected into the Groq prompt as context:
```
SIMILAR SUCCESSFUL PITCHES FROM DATABASE:
Example 1 (87% similar): AI tool that fixes bugs automatically...
Example 2 (72% similar): Infrastructure platform for ML deployment...

PITCH TO EVALUATE:
[user's pitch]
```

This grounds the AI evaluation in real benchmark examples rather than hallucinated feedback.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, TailwindCSS | UI, routing, API routes |
| Vector DB | Endee (Docker) | Semantic similarity search |
| Embeddings | Python, sentence-transformers | Text → vector conversion |
| AI Model | Groq (Llama 3.3 70B) | Evaluation + feedback generation |
| Fonts | Playfair Display, DM Sans, DM Mono | Premium typography |

---

## 📁 Project Structure

```
pitchlens-ai/
├── endee/                          # Endee vector database
│   └── docker-compose.yml
├── frontend/                       # Next.js application
│   ├── app/
│   │   ├── page.tsx                # Main UI
│   │   └── api/
│   │       ├── search/route.ts     # Vector search endpoint
│   │       └── evaluate/route.ts   # Full RAG pipeline
│   ├── .env.local                  # API keys (not committed)
│   └── package.json
├── backend/
│   └── seed.js                     # Seeds benchmark data into Endee
└── embedding-service/
    ├── app.py                      # Flask embedding microservice
    └── requirements.txt
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker Desktop

### Step 1 — Clone & Fork
```bash
git clone https://github.com/YOUR_USERNAME/pitchlens-ai
cd pitchlens-ai
```

### Step 2 — Start Endee Vector Database
```bash
docker run -p 8080:8080 -v endee-data:/data --name endee-server endeeio/endee-server:latest
```
Endee dashboard available at: `http://localhost:8080`

### Step 3 — Start Embedding Service
```bash
cd embedding-service
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install sentence-transformers flask
python app.py
# Running on http://localhost:5001
```

### Step 4 — Seed Benchmark Data Into Endee
```bash
cd backend
npm install
node seed.js
# Inserts 10 benchmark pitch vectors into Endee
```

### Step 5 — Configure API Keys
Create `frontend/.env.local`:
```
GROQ_API_KEY=your_groq_key_here
```
Get free key at: https://console.groq.com

### Step 6 — Start Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🎯 Usage

1. Open `http://localhost:3000`
2. Select an investor persona (Tech VC, Growth VC, Fintech VC, Impact Investor)
3. Paste your startup pitch in the text area
4. Click **"Analyze Pitch"**
5. Wait ~3–5 seconds for the full evaluation
6. Review your scores, strengths, weaknesses, and suggestions
7. Click **"Reveal"** to see the AI-rewritten version of your pitch

---

## 🔑 Key Concepts

**Vector Embeddings** — Text converted to 384-dimensional numerical vectors where semantic similarity is preserved. Similar meanings produce mathematically close vectors.

**Cosine Similarity** — Measures the angle between two vectors. Used by Endee to find the most similar pitches in the database.

**RAG (Retrieval-Augmented Generation)** — AI evaluation is grounded in retrieved benchmark data, not just model memory. This produces more specific, relevant feedback.

**Persona-Aware Evaluation** — The same pitch is evaluated differently based on investor type, reflecting real-world investor priorities and biases.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---
