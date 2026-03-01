const { Endee } = require("endee");
const axios = require("axios");

const EMBED_URL = "http://localhost:5001/embed";
const INDEX_NAME = "pitch_index";

const benchmarks = [
  "AI tool that fixes bugs automatically. Engineers waste 40% of time debugging. 500 paying customers at $99/month growing 20% MoM.",
  "Infrastructure platform to deploy ML models 10x faster. MLOps market is $4B growing to $13B. Reduces cloud costs by 60%.",
  "B2C fitness app with 2M users, 400K subscribers at $15/month. CAC $3, LTV $180. Expanding into $50B corporate wellness market.",
  "Shopify for African e-commerce. 10,000 merchants, $5M GMV/month growing 35% MoM. 2% transaction fee model.",
  "Embedded insurance for 50M uninsured gig workers. $3M premiums processed, 45% loss ratio, partnered with 3 major platforms.",
  "Cross-border payments reducing fees from 3% to 0.3%. $50M monthly volume. Licensed in 12 countries. 3 Fortune 500 clients.",
  "Solar-as-a-service for rural Southeast Asia. 50,000 homes powered, 30,000 tons CO2 displaced annually.",
  "AI detects employee burnout with 94% accuracy. 50 enterprise customers, $2M ARR, 140% net revenue retention.",
  "Healthcare AI unifies patient records, reduces diagnostic time 60%. HIPAA compliant. 30 hospital systems, $5M ARR.",
  "Automates accounts payable at $0.50 per invoice vs $15 manual. 200 customers, $3M ARR, 25% MoM growth.",
];

async function getEmbedding(text) {
  const res = await axios.post(EMBED_URL, { text });
  return res.data.vector;
}

async function seed() {
  console.log("Connecting to Endee...");
  
  const client = new Endee();
  const index = await client.getIndex(INDEX_NAME);
  
  console.log(" Connected to index:", INDEX_NAME);
  console.log(" Seeding benchmark data...\n");

  const vectors = [];
  
  for (let i = 0; i < benchmarks.length; i++) {
    console.log(`Embedding ${i + 1}/${benchmarks.length}...`);
    const vector = await getEmbedding(benchmarks[i]);
    vectors.push({
      id: `bench_${i + 1}`,
      vector: vector,
      meta: { text: benchmarks[i] }
    });
  }

  console.log("\nUpserting all vectors into Endee...");
  await index.upsert(vectors);
  
  console.log("\n Seeding complete!");
  console.log(`Inserted ${vectors.length} benchmark pitches.`);
}

seed().catch(console.error);