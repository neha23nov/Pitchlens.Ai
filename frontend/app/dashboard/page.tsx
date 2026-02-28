"use client";

import { useState } from "react";

export default function Dashboard() {
  const [persona, setPersona] = useState("tech_vc");
  const [pitch, setPitch] = useState("");

  const handleEvaluate = async () => {
  const response = await fetch("http://localhost:5000/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ persona, pitch }),
  });

  const data = await response.json();
  console.log(data);
};

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">
        Pitch Evaluation Dashboard
      </h1>

      {/* Persona Selector */}
      <div className="mb-6">
        <label className="block mb-2 text-sm text-zinc-400">
          Select VC Persona
        </label>

        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        >
          <option value="tech_vc">Tech VC</option>
          <option value="growth_vc">Growth VC</option>
          <option value="fintech_vc">Fintech VC</option>
          <option value="impact_vc">Impact Investor</option>
        </select>
      </div>

      {/* Pitch Input */}
      <div className="mb-6">
        <label className="block mb-2 text-sm text-zinc-400">
          Paste Your Startup Pitch
        </label>

        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          rows={8}
          placeholder="Describe your startup idea..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4"
        />
      </div>

      {/* Evaluate Button */}
     <button
  onClick={handleEvaluate}
  className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:scale-105 transition"
>
  Evaluate Pitch
</button>

      {/* Result Placeholder */}
      <div className="mt-10 bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">
          Evaluation Result
        </h2>
        <p className="text-zinc-400">
          Results will appear here after evaluation.
        </p>
      </div>
    </main>
  );
}