"use client";

import { useState, useEffect, useRef } from "react";

const PERSONAS = [
  { id: "tech_vc", label: "Tech VC", icon: "⚡", desc: "Scalability & Innovation" },
  { id: "growth_vc", label: "Growth VC", icon: "📈", desc: "Traction & Market" },
  { id: "fintech_vc", label: "Fintech VC", icon: "💰", desc: "Revenue & Compliance" },
  { id: "impact_vc", label: "Impact Investor", icon: "🌍", desc: "Social & Sustainability" },
];

const SCORE_LABELS: Record<string, string> = {
  problem_clarity: "Problem Clarity",
  market_size: "Market Size",
  business_model: "Business Model",
  traction: "Traction",
  team_moat: "Team & Moat",
};

function useAnimateIn(delay = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, []);
  return visible;
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      {children}
    </div>
  );
}

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 10), delay + 100);
    return () => clearTimeout(t);
  }, [score, delay]);

  const color = score >= 8 ? "#f59e0b" : score >= 6 ? "#fbbf24" : "#78716c";
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#a8a29e", letterSpacing: "0.03em" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color, fontWeight: 700 }}>
          {score}<span style={{ color: "#44403c", fontWeight: 400 }}>/10</span>
        </span>
      </div>
      <div style={{ width: "100%", height: "3px", background: "#1c1917", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, #92400e, ${color})`,
          borderRadius: "2px",
          transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 12px ${color}40`,
        }} />
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [animScore, setAnimScore] = useState(0);
  const circumference = 2 * Math.PI * 54;
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (animScore / 10) * circumference;
  const color = score >= 8 ? "#f59e0b" : score >= 6 ? "#fbbf24" : "#78716c";

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r="54" fill="none" stroke="#1c1917" strokeWidth="6" />
        <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)", filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "36px", fontWeight: 700, color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#57534e", letterSpacing: "0.12em", marginTop: "4px" }}>
          OUT OF 10
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [persona, setPersona] = useState("tech_vc");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [step, setStep] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setShowRewrite(false);
    setStep(0);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, persona }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`${data.error || "Unknown error"} | ${data.detail || ""}`);
        return;
      }
      setResult(data);
      setTimeout(() => setStep(1), 100);
      setTimeout(() => setStep(2), 600);
      setTimeout(() => setStep(3), 1100);
      setTimeout(() => setStep(4), 1600);
      setTimeout(() => setStep(5), 2100);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const evaluation = result?.evaluation;
  const similarPitches = result?.similar_pitches || [];
  const selectedPersona = PERSONAS.find((p) => p.id === persona);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0908",
      color: "#e7e5e4",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::placeholder { color: #44403c; }
        textarea:focus { outline: none; }
        button { cursor: pointer; border: none; }

        .persona-btn:hover { background: rgba(245,158,11,0.08) !important; border-color: rgba(245,158,11,0.3) !important; }

        .analyze-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
          box-shadow: 0 0 40px rgba(245,158,11,0.3) !important;
          transform: translateY(-1px) !important;
        }
        .analyze-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .card {
          background: #0f0e0d;
          border: 1px solid #1c1917;
          border-radius: 16px;
          padding: 32px;
        }

        .tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid #44403c;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
          50% { box-shadow: 0 0 0 8px rgba(245,158,11,0.08); }
        }
      `}</style>

      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        opacity: 0.4,
      }} />

      {/* Amber glow top */}
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div className="tag" style={{ background: "#1c1917", color: "#78716c", marginBottom: "24px" }}>
            Vector DB · Semantic Search · AI Evaluation
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(52px, 8vw, 80px)",
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fafaf9 30%, #78716c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "20px",
          }}>
            PitchLens
          </h1>
          <p style={{ color: "#78716c", fontSize: "16px", fontWeight: 300, lineHeight: 1.7, letterSpacing: "0.01em" }}>
            Investor-grade AI analysis for startup founders.<br />
            Powered by Endee vector search.
          </p>
        </div>

        {/* Persona Selector */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "11px", color: "#44403c", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "12px", textAlign: "center" }}>
            Investor Persona
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {PERSONAS.map((p) => (
              <button key={p.id} onClick={() => setPersona(p.id)}
                className="persona-btn"
                style={{
                  padding: "16px 12px",
                  borderRadius: "12px",
                  border: `1px solid ${persona === p.id ? "rgba(245,158,11,0.4)" : "#1c1917"}`,
                  background: persona === p.id ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.01)",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>{p.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: persona === p.id ? "#fbbf24" : "#a8a29e", marginBottom: "3px" }}>
                  {p.label}
                </div>
                <div style={{ fontSize: "11px", color: "#44403c", lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#44403c", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "16px" }}>
            Your Pitch
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your startup: the problem you're solving, your solution, target market, revenue model, current traction, and what gives you an unfair advantage..."
            rows={7}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#d6d3d1",
              fontSize: "15px",
              lineHeight: 1.75,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              resize: "none",
            }}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="analyze-btn"
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#000",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
            transition: "all 0.2s ease",
            marginBottom: "48px",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span className="spinner" />
              Analyzing pitch...
            </span>
          ) : `Analyze for ${selectedPersona?.label} →`}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            padding: "16px 20px", borderRadius: "12px", marginBottom: "32px",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          }}>
            <span style={{ color: "#f87171", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
              ⚠ {error}
            </span>
          </div>
        )}

        {/* Results — step by step reveal */}
        {evaluation && (
          <div ref={resultsRef} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Step 1: Score + Verdict */}
            {step >= 1 && (
              <AnimatedSection delay={0}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px", alignItems: "stretch" }}>

                  {/* Score Ring */}
                  <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 40px" }}>
                    <ScoreRing score={evaluation.overall_score} />
                    <div style={{ marginTop: "16px", fontSize: "11px", color: "#44403c", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                      Overall Score
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="card" style={{ position: "relative", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                      background: "linear-gradient(90deg, #f59e0b, transparent)",
                    }} />
                    <div className="tag" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", marginBottom: "16px" }}>
                      {selectedPersona?.icon} {selectedPersona?.label} Verdict
                    </div>
                    <p style={{ color: "#d6d3d1", fontSize: "15px", lineHeight: 1.8, fontWeight: 300, fontStyle: "italic" }}>
                      "{evaluation.investor_verdict}"
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Step 2: Score Bars */}
            {step >= 2 && (
              <AnimatedSection delay={0}>
                <div className="card">
                  <div style={{ fontSize: "11px", color: "#44403c", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "28px" }}>
                    Category Breakdown
                  </div>
                  {Object.entries(evaluation.scores).map(([key, val], i) => (
                    <ScoreBar key={key} label={SCORE_LABELS[key] || key} score={val as number} delay={i * 120} />
                  ))}
                </div>
              </AnimatedSection>
            )}

            {/* Step 3: Strengths + Weaknesses */}
            {step >= 3 && (
              <AnimatedSection delay={0}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="card">
                    <div className="tag" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", marginBottom: "20px" }}>
                      Strengths
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: "#a8a29e", lineHeight: 1.6 }}>
                          <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }}>+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card">
                    <div className="tag" style={{ background: "rgba(120,113,108,0.1)", color: "#78716c", marginBottom: "20px" }}>
                      Weaknesses
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {evaluation.weaknesses.map((w: string, i: number) => (
                        <li key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: "#a8a29e", lineHeight: 1.6 }}>
                          <span style={{ color: "#78716c", flexShrink: 0, marginTop: "2px" }}>−</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Step 4: Suggestions + Rewrite */}
            {step >= 4 && (
              <AnimatedSection delay={0}>
                <div className="card">
                  <div className="tag" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", marginBottom: "20px" }}>
                    How to Improve
                  </div>
                  <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {evaluation.suggestions.map((s: string, i: number) => (
                      <li key={i} style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, alignItems: "flex-start" }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)", borderRadius: "6px",
                          padding: "2px 8px", flexShrink: 0, marginTop: "1px",
                        }}>
                          0{i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Rewrite */}
                <div className="card" style={{ marginTop: "16px", borderColor: "rgba(245,158,11,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showRewrite ? "20px" : "0" }}>
                    <div className="tag" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b" }}>
                      AI-Rewritten Pitch
                    </div>
                    <button
                      onClick={() => setShowRewrite(!showRewrite)}
                      style={{
                        fontSize: "12px", color: "#78716c", background: "transparent",
                        fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
                        padding: "6px 12px", borderRadius: "8px", border: "1px solid #1c1917",
                        transition: "all 0.2s",
                      }}
                    >
                      {showRewrite ? "Hide ↑" : "Reveal ↓"}
                    </button>
                  </div>
                  {showRewrite && (
                    <p style={{ color: "#d6d3d1", fontSize: "14px", lineHeight: 1.85, fontWeight: 300 }}>
                      {evaluation.rewritten_pitch}
                    </p>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Step 5: Similar pitches from Endee */}
            {step >= 5 && similarPitches.length > 0 && (
              <AnimatedSection delay={0}>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ fontSize: "11px", color: "#44403c", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "12px" }}>
                    Similar Pitches · Endee Vector Search
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {similarPitches.map((match: any, i: number) => (
                      <div key={i} style={{
                        padding: "16px 20px", borderRadius: "10px",
                        background: "#0f0e0d", border: "1px solid #1c1917",
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px",
                      }}>
                        <p style={{ fontSize: "13px", color: "#78716c", lineHeight: 1.6, flex: 1 }}>
                          {match.meta?.text}
                        </p>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 700,
                          color: "#f59e0b", background: "rgba(245,158,11,0.08)",
                          padding: "4px 10px", borderRadius: "6px", flexShrink: 0,
                          border: "1px solid rgba(245,158,11,0.15)",
                        }}>
                          {(match.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "80px", textAlign: "center", fontSize: "11px", color: "#292524", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
          PitchLens · Endee Vector DB · Groq AI
        </div>
      </div>
    </main>
  );
}