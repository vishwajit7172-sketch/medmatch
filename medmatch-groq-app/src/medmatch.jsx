import { useState, useRef } from "react";

const HOSPITAL = {
  name: "Apex Multispeciality Hospital",
  departments: {
    cardiology:       { label: "Cardiology",      available: true,  doctors: ["Dr. Ramesh Nair", "Dr. Priya Mehta"],      slots: "Mon–Sat, 9AM–5PM" },
    neurology:        { label: "Neurology",        available: true,  doctors: ["Dr. Sunil Kapoor"],                        slots: "Mon, Wed, Fri – 10AM–2PM" },
    pulmonology:      { label: "Pulmonology",      available: false, doctors: [],                                          slots: "" },
    gastroenterology: { label: "Gastroenterology", available: true,  doctors: ["Dr. Anita Sharma", "Dr. Farhan Qureshi"], slots: "Tue–Sat, 11AM–4PM" },
    orthopedics:      { label: "Orthopedics",      available: true,  doctors: ["Dr. Vikram Singh", "Dr. Leela Rao"],      slots: "Mon–Fri, 8AM–6PM" },
    nephrology:       { label: "Nephrology",       available: true,  doctors: ["Dr. Neha Gupta"],                         slots: "Mon, Thu – 9AM–1PM" },
    endocrinology:    { label: "Endocrinology",    available: false, doctors: [],                                          slots: "" },
    oncology:         { label: "Oncology",         available: true,  doctors: ["Dr. Samuel Thomas", "Dr. Kavita Rao"],    slots: "By appointment" },
    general_medicine: { label: "General Medicine", available: true,  doctors: ["Dr. Pooja Iyer", "Dr. Ravi Kumar"],       slots: "Mon–Sat, 8AM–8PM" },
    dermatology:      { label: "Dermatology",      available: true,  doctors: ["Dr. Sneha Patel"],                        slots: "Mon, Wed, Fri – 2PM–6PM" },
  },
};

const SYMPTOMS = [
  { id: "chest",   label: "Chest Pain",          icon: "🫀", dept: "cardiology",       tests: ["ECG", "Troponin Blood Test", "Echocardiogram", "Lipid Profile"] },
  { id: "head",    label: "Headache / Dizziness", icon: "🧠", dept: "neurology",        tests: ["MRI Brain", "CT Scan Head", "BP Check", "EEG"] },
  { id: "breath",  label: "Breathlessness",       icon: "🫁", dept: "pulmonology",      tests: ["Chest X-Ray", "Spirometry", "ABG Test", "Sputum Culture"] },
  { id: "stomach", label: "Stomach / Acidity",   icon: "🫃", dept: "gastroenterology", tests: ["Ultrasound Abdomen", "H. Pylori Test", "LFT", "Endoscopy"] },
  { id: "joint",   label: "Joint / Back Pain",   icon: "🦴", dept: "orthopedics",      tests: ["X-Ray", "MRI Joint", "CRP & ESR", "RA Factor"] },
  { id: "kidney",  label: "Swelling / Urination", icon: "🫘", dept: "nephrology",       tests: ["Serum Creatinine", "eGFR", "Urine Test", "Renal Ultrasound"] },
  { id: "sugar",   label: "Sugar / Thyroid",     icon: "🔬", dept: "endocrinology",    tests: ["HbA1c", "Fasting Blood Sugar", "TSH / T3 / T4", "Lipid Profile"] },
  { id: "lump",    label: "Lump / Weight Loss",  icon: "🔴", dept: "oncology",         tests: ["CECT Scan", "PET Scan", "Tumor Markers", "Biopsy"] },
];

const DEPT_KEYS = Object.keys(HOSPITAL.departments);

function matchDept(text) {
  const t = text.toLowerCase();
  const map = {
    cardiology:       ["heart","cardiac","hypertension","bp","blood pressure","cholesterol","angina"],
    neurology:        ["brain","stroke","epilepsy","seizure","migraine","nerve","parkinson","vertigo"],
    pulmonology:      ["lung","asthma","copd","bronchitis","pneumonia","tb","respiratory"],
    gastroenterology: ["stomach","liver","gut","ibs","ulcer","acid","gerd","hepatitis","bowel"],
    orthopedics:      ["bone","joint","fracture","arthritis","spine","knee","shoulder"],
    nephrology:       ["kidney","renal","dialysis","ckd","urinary","uti"],
    endocrinology:    ["diabetes","thyroid","insulin","sugar","pcos","hormones","obesity"],
    oncology:         ["cancer","tumor","malignant","lymphoma","leukemia","biopsy"],
    dermatology:      ["skin","rash","acne","eczema","psoriasis","itching","fungal"],
  };
  for (const [dept, kws] of Object.entries(map)) {
    if (kws.some(k => t.includes(k))) return dept;
  }
  return "general_medicine";
}

// ── design tokens ──
const C = {
  bg:      "#0D0D0F",
  surface: "#141416",
  card:    "#1A1A1E",
  border:  "#242428",
  borderHover: "#3A3A40",
  accent:  "#6EE7B7",   // mint green — medical, premium
  accentDim: "#6EE7B720",
  accentText: "#34D399",
  red:     "#F87171",
  redDim:  "#F8717120",
  text:    "#F5F5F7",
  muted:   "#6B6B78",
  muted2:  "#3A3A42",
};

const fontStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function MedMatch() {
  const [screen, setScreen]         = useState("home");
  const [mode, setMode]             = useState("symptom");
  const [picked, setPicked]         = useState(null);
  const [disease, setDisease]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [aiData, setAiData]         = useState(null);
  const [error, setError]           = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const resultRef = useRef(null);

  function reset() { setPicked(null); setDisease(""); setAiData(null); setError(""); }

  async function analyze() {
    if (!disease.trim()) return;
    setLoading(true); setAiData(null); setError("");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Patient condition: "${disease}". You are an honest medical advisor protecting patients from unnecessary tests hospitals use to inflate bills. Reply ONLY in valid JSON with no markdown backticks, no extra text:\n{\n  "name": "clean condition name",\n  "dept_key": "one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology",\n  "specialist": "doctor type e.g. Cardiologist",\n  "needed": [{"test": "name", "reason": "one line why"}],\n  "skip": [{"test": "name", "reason": "why hospitals push this but patient does not need it"}],\n  "advice": "one sentence honest patient tip"\n}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(disease);
      setAiData({ ...parsed, dept: HOSPITAL.departments[key] });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (_) { setError("Something went wrong. Please try again."); }
    setLoading(false);
  }

  const pickedDept = picked ? HOSPITAL.departments[picked.dept] : null;
  const totalDepts  = Object.keys(HOSPITAL.departments).length;
  const activeDepts = Object.values(HOSPITAL.departments).filter(d => d.available).length;
  const totalDocs   = Object.values(HOSPITAL.departments).reduce((a, d) => a + d.doctors.length, 0);

  // shared pieces
  const Divider = () => <div style={{ height: 1, background: C.border, margin: "20px 0" }} />;

  const Tag = ({ ok }) => (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 100,
      background: ok ? C.accentDim : C.redDim, color: ok ? C.accentText : C.red, border: "1px solid " + (ok ? "#34D39940" : "#F8717140") }}>
      {ok ? "● Available" : "● Unavailable"}
    </span>
  );

  const SecLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>{children}</div>
  );

  return (
    <div style={{ ...fontStyle, minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        textarea:focus, input:focus { border-color: ${C.accentText} !important; box-shadow: 0 0 0 3px ${C.accentDim} !important; }
        .sym-card:hover { border-color: ${C.accentText} !important; background: ${C.accentDim} !important; }
        .home-card:hover { border-color: ${C.borderHover} !important; transform: translateY(-1px); }
        .dept-card:hover { border-color: ${C.borderHover} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "1px solid " + C.border, position: "sticky", top: 0, zIndex: 50, background: C.bg, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #34D399, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>+</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: C.text }}>MedMatch</span>
        </div>
        {screen !== "home" && (
          <button onClick={() => { setScreen("home"); reset(); }}
            style={{ ...fontStyle, fontSize: 13, color: C.muted, cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            ← Home
          </button>
        )}
      </nav>

      {/* ══ HOME ══ */}
      {screen === "home" && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "72px 24px 60px" }} className="fade-up">
          {/* eyebrow */}
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentText, marginBottom: 20 }}>Medical Intelligence</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14, color: C.text }}>
            Know exactly<br />what you need.
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 48 }}>
            Find the right tests and doctors — without unnecessary costs or confusion.
          </p>

          {[
            { icon: "⊕", label: "I'm a Patient", sub: "Find tests & the right doctor", target: "patient", accent: C.accentText },
            { icon: "⊞", label: "Hospital Staff", sub: "View department availability",  target: "hospital", accent: "#818CF8" },
          ].map(item => (
            <div key={item.target} className="home-card"
              onClick={() => setScreen(item.target)}
              style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "20px 22px", cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: item.accent + "18", border: "1px solid " + item.accent + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: item.accent, flexShrink: 0, fontWeight: 300 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{item.sub}</div>
              </div>
              <div style={{ color: C.muted2, fontSize: 22, lineHeight: 1 }}>›</div>
            </div>
          ))}
        </div>
      )}

      {/* ══ PATIENT ══ */}
      {screen === "patient" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 6 }}>Your Health Check</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Choose how you'd like to proceed</p>

          {/* Tabs */}
          <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, marginBottom: 28, gap: 4, border: "1px solid " + C.border }}>
            {[["symptom", "I have symptoms"], ["disease", "I know my condition"]].map(([val, lbl]) => (
              <button key={val} onClick={() => { setMode(val); reset(); }}
                style={{ ...fontStyle, flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  background: mode === val ? C.card : "transparent",
                  color: mode === val ? C.text : C.muted,
                  boxShadow: mode === val ? "0 1px 6px rgba(0,0,0,0.4)" : "none",
                  transition: "all 0.18s" }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* ── Symptom Mode ── */}
          {mode === "symptom" && (
            <>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Select what's bothering you</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SYMPTOMS.map(s => {
                  const isSelected = picked?.id === s.id;
                  return (
                    <div key={s.id} className={isSelected ? "" : "sym-card"}
                      onClick={() => { setPicked(s); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
                      style={{ background: isSelected ? C.accentDim : C.card, border: "1px solid " + (isSelected ? C.accentText : C.border), borderRadius: 14, padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.18s" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? C.accentText : C.text, lineHeight: 1.35 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-up" style={{ marginTop: 24, background: C.card, border: "1px solid " + C.border, borderRadius: 18, overflow: "hidden" }}>
                  {/* result header */}
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{pickedDept.label}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{HOSPITAL.name}</div>
                    </div>
                    <Tag ok={pickedDept.available} />
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    <SecLabel>Recommended Tests</SecLabel>
                    {picked.tests.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < picked.tests.length - 1 ? "1px solid " + C.border : "none" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accentText, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{t}</span>
                      </div>
                    ))}
                    <Divider />
                    <SecLabel>Doctor</SecLabel>
                    {pickedDept.available ? (
                      <>
                        {pickedDept.doctors.map((d, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < pickedDept.doctors.length - 1 ? "1px solid " + C.border : "none", fontSize: 14, color: C.text }}>
                            <span style={{ fontSize: 16 }}>👤</span>{d}
                          </div>
                        ))}
                        {pickedDept.slots && (
                          <div style={{ marginTop: 14, fontSize: 12, color: C.accentText, background: C.accentDim, border: "1px solid " + C.accentText + "40", padding: "6px 12px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            ⏰ {pickedDept.slots}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: "14px 16px", background: C.redDim, border: "1px solid " + C.red + "40", borderRadius: 10, fontSize: 13, color: C.red }}>
                        No specialist available. Contact reception for a referral.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Disease Mode ── */}
          {mode === "disease" && (
            <>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Describe your condition or reason for visit</p>
              <textarea
                value={disease}
                onChange={e => setDisease(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); } }}
                placeholder="e.g. Type 2 Diabetes 3-month checkup, Hypertension follow-up, Thyroid disorder..."
                style={{ ...fontStyle, width: "100%", padding: "14px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 12, fontSize: 14, color: C.text, resize: "none", minHeight: 90, outline: "none", lineHeight: 1.65, transition: "border-color 0.2s, box-shadow 0.2s" }}
              />
              <button onClick={analyze} disabled={loading || !disease.trim()}
                style={{ ...fontStyle, width: "100%", padding: "14px", marginTop: 10, background: loading || !disease.trim() ? C.muted2 : "linear-gradient(135deg, #34D399, #059669)", border: "none", borderRadius: 12, color: loading || !disease.trim() ? C.muted : "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !disease.trim() ? "not-allowed" : "pointer", letterSpacing: "0.01em", transition: "all 0.2s" }}>
                {loading ? <span><span className="spin">◌</span> &nbsp;Analyzing...</span> : "Check what tests you need →"}
              </button>
              <div style={{ marginTop: 12, padding: "12px 16px", background: "#78350F18", border: "1px solid #92400E40", borderRadius: 10, fontSize: 12, color: "#D97706", lineHeight: 1.6 }}>
                If a hospital recommends tests not listed here, ask your doctor to justify each one before agreeing.
              </div>

              {error && (
                <div style={{ marginTop: 12, padding: "12px 16px", background: C.redDim, border: "1px solid " + C.red + "40", borderRadius: 10, fontSize: 13, color: C.red }}>
                  {error}
                </div>
              )}

              {aiData && (
                <div ref={resultRef} className="fade-up" style={{ marginTop: 24, background: C.card, border: "1px solid " + C.border, borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{aiData.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>Specialist: {aiData.specialist}</div>
                    </div>
                    <Tag ok={aiData.dept.available} />
                  </div>

                  <div style={{ padding: "20px 24px" }}>
                    <SecLabel>Tests you need</SecLabel>
                    {aiData.needed?.map((t, i) => (
                      <div key={i} style={{ padding: "13px 16px", background: C.accentDim, border: "1px solid " + C.accentText + "30", borderRadius: 11, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.accentText, marginBottom: 4 }}>{t.test}</div>
                        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t.reason}</div>
                      </div>
                    ))}

                    {aiData.skip?.length > 0 && (
                      <>
                        <Divider />
                        <SecLabel>Question or skip these</SecLabel>
                        {aiData.skip.map((t, i) => (
                          <div key={i} style={{ padding: "13px 16px", background: C.redDim, border: "1px solid " + C.red + "30", borderRadius: 11, marginBottom: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: C.red, marginBottom: 4 }}>✕ {t.test}</div>
                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t.reason}</div>
                          </div>
                        ))}
                      </>
                    )}

                    <Divider />
                    <SecLabel>Doctor at {HOSPITAL.name}</SecLabel>
                    {aiData.dept.available ? (
                      <>
                        {aiData.dept.doctors.map((d, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < aiData.dept.doctors.length - 1 ? "1px solid " + C.border : "none", fontSize: 14, color: C.text }}>
                            <span style={{ fontSize: 16 }}>👤</span>{d}
                          </div>
                        ))}
                        {aiData.dept.slots && (
                          <div style={{ marginTop: 14, fontSize: 12, color: C.accentText, background: C.accentDim, border: "1px solid " + C.accentText + "40", padding: "6px 12px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            ⏰ {aiData.dept.slots}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: "14px 16px", background: C.redDim, border: "1px solid " + C.red + "40", borderRadius: 10, fontSize: 13, color: C.red }}>
                        No {aiData.dept.label} specialist available. Ask reception for a referral.
                      </div>
                    )}

                    {aiData.advice && (
                      <>
                        <Divider />
                        <div style={{ padding: "14px 16px", background: "#1E3A5F30", border: "1px solid #3B82F640", borderRadius: 11, fontSize: 13, color: "#93C5FD", lineHeight: 1.65 }}>
                          {aiData.advice}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ HOSPITAL ══ */}
      {screen === "hospital" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 4 }}>{HOSPITAL.name}</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Live department availability</p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { num: activeDepts, label: "Active", color: C.accentText },
              { num: totalDepts - activeDepts, label: "Unavailable", color: C.red },
              { num: totalDocs, label: "Doctors", color: "#818CF8" },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Dept grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(HOSPITAL.departments).map(([key, d]) => {
              const isOpen = expandedDept === key;
              return (
                <div key={key} className={d.available ? "dept-card" : ""}
                  onClick={() => d.available && setExpandedDept(isOpen ? null : key)}
                  style={{ background: C.card, border: "1px solid " + (d.available ? C.border : C.border), borderRadius: 14, padding: "16px", cursor: d.available ? "pointer" : "default", transition: "all 0.18s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{d.label}</span>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.available ? C.accentText : C.red, display: "inline-block", marginTop: 3, flexShrink: 0, boxShadow: d.available ? "0 0 6px " + C.accentText + "80" : "none" }} />
                  </div>
                  <div style={{ fontSize: 11, color: d.available ? C.accentText : C.red, fontWeight: 500, marginBottom: isOpen ? 10 : 0 }}>
                    {d.available ? `${d.doctors.length} doctor${d.doctors.length !== 1 ? "s" : ""}` : "Unavailable"}
                  </div>
                  {d.available && isOpen && (
                    <div style={{ borderTop: "1px solid " + C.border, paddingTop: 10 }}>
                      {d.doctors.map((doc, i) => (
                        <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: C.muted2 }}>–</span> {doc}
                        </div>
                      ))}
                      {d.slots && <div style={{ fontSize: 11, color: C.accentText, marginTop: 8 }}>⏰ {d.slots}</div>}
                    </div>
                  )}
                  {d.available && (
                    <div style={{ fontSize: 10, color: C.muted2, marginTop: 8, fontWeight: 500 }}>{isOpen ? "↑ less" : "↓ details"}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
