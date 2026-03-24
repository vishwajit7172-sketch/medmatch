import { useState, useRef } from "react";

const HOSPITAL = {
  name: "Hospitals will be added in future update",
  departments: {
    cardiology:       { label: "Cardiology",      available: true,  doctors: [], slots: "" },
    neurology:        { label: "Neurology",        available: true,  doctors: [], slots: "" },
    pulmonology:      { label: "Pulmonology",      available: false, doctors: [], slots: "" },
    gastroenterology: { label: "Gastroenterology", available: true,  doctors: [], slots: "" },
    orthopedics:      { label: "Orthopedics",      available: true,  doctors: [], slots: "" },
    nephrology:       { label: "Nephrology",       available: true,  doctors: [], slots: "" },
    endocrinology:    { label: "Endocrinology",    available: false, doctors: [], slots: "" },
    oncology:         { label: "Oncology",         available: true,  doctors: [], slots: "" },
    general_medicine: { label: "General Medicine", available: true,  doctors: [], slots: "" },
    dermatology:      { label: "Dermatology",      available: true,  doctors: [], slots: "" },
  },
};

const ADMIN_PASSWORD = "Vishu@226";

// Serious conditions that trigger emergency alert
const SERIOUS_CONDITIONS = [
  "heart attack", "myocardial infarction", "stroke", "cardiac arrest", "pulmonary embolism",
  "aortic aneurysm", "sepsis", "anaphylaxis", "meningitis", "severe chest pain",
  "subarachnoid hemorrhage", "eclampsia", "respiratory failure", "diabetic ketoacidosis",
  "acute kidney failure", "internal bleeding", "severe allergic", "epiglottitis",
  "testicular torsion", "ruptured appendix", "acute appendicitis", "ectopic pregnancy",
  "spinal cord injury", "brain tumor", "acute liver failure", "blood clot", "dvt",
  "leukemia", "lymphoma", "cancer", "tumor", "malignant", "overdose", "poisoning",
  "unconscious", "unresponsive", "seizure", "epilepsy"
];

function isSerious(text, aiName = "") {
  const combined = (text + " " + aiName).toLowerCase();
  return SERIOUS_CONDITIONS.some(k => combined.includes(k));
}

const SYMPTOMS = [
  {
    id: "chest", label: "Chest Pain", icon: "🫀", dept: "cardiology",
    tests: ["ECG", "Troponin Blood Test", "Echocardiogram", "Lipid Profile"],
    followUps: [
      { q: "How severe is the pain? (1–10)", options: ["1–3 Mild", "4–6 Moderate", "7–10 Severe"] },
      { q: "Does pain spread to arm/jaw/back?", options: ["Yes", "No", "Not sure"] },
      { q: "Any shortness of breath with it?", options: ["Yes", "No"] },
      { q: "How long has this been going on?", options: ["Just started", "Few hours", "Days", "Weeks+"] },
    ],
    immediateAction: "Sit or lie down in a comfortable position. Avoid physical exertion. If pain is severe or spreading to arm/jaw, call emergency services immediately.",
  },
  {
    id: "head", label: "Headache / Dizziness", icon: "🧠", dept: "neurology",
    tests: ["MRI Brain", "CT Scan Head", "BP Check", "EEG"],
    followUps: [
      { q: "Type of headache?", options: ["Throbbing", "Pressure/squeezing", "Sharp/stabbing", "Constant dull ache"] },
      { q: "Location of pain?", options: ["Front/forehead", "Back of head", "One side", "Whole head"] },
      { q: "Any vision changes or nausea?", options: ["Yes", "No"] },
      { q: "How long does it last?", options: ["Minutes", "Hours", "Days", "On and off"] },
    ],
    immediateAction: "Rest in a quiet, dark room. Stay hydrated. Avoid screens. If headache is the 'worst of your life' or sudden/thunderclap, seek emergency care immediately.",
  },
  {
    id: "breath", label: "Breathlessness", icon: "🫁", dept: "pulmonology",
    tests: ["Chest X-Ray", "Spirometry", "ABG Test", "Sputum Culture"],
    followUps: [
      { q: "When does breathlessness occur?", options: ["At rest", "Light activity", "Heavy exertion", "Lying flat"] },
      { q: "Any wheezing or chest tightness?", options: ["Yes", "No"] },
      { q: "Any cough or fever alongside?", options: ["Yes, with cough", "Yes, with fever", "Both", "Neither"] },
      { q: "How long has this been present?", options: ["Just started", "Days", "Weeks", "Months+"] },
    ],
    immediateAction: "Sit upright and lean slightly forward. Breathe slowly and deeply through pursed lips. Avoid lying flat. If lips/fingertips turn blue, call emergency services immediately.",
  },
  {
    id: "stomach", label: "Stomach / Acidity", icon: "🫃", dept: "gastroenterology",
    tests: ["Ultrasound Abdomen", "H. Pylori Test", "LFT", "Endoscopy"],
    followUps: [
      { q: "Where is the pain located?", options: ["Upper abdomen", "Lower abdomen", "Right side", "Left side"] },
      { q: "Any vomiting or nausea?", options: ["Yes, with blood", "Yes, without blood", "No"] },
      { q: "Any change in stool (color/consistency)?", options: ["Yes – dark/tarry", "Yes – loose", "Normal"] },
      { q: "Relation to meals?", options: ["Gets worse after eating", "Gets better after eating", "No relation"] },
    ],
    immediateAction: "Avoid spicy, fatty, or acidic foods. Eat small, frequent meals. Stay upright after eating. If there's blood in vomit or stool, seek emergency care immediately.",
  },
  {
    id: "joint", label: "Joint / Back Pain", icon: "🦴", dept: "orthopedics",
    tests: ["X-Ray", "MRI Joint", "CRP & ESR", "RA Factor"],
    followUps: [
      { q: "Which area is affected?", options: ["Knee", "Back/spine", "Shoulder", "Hip/ankle"] },
      { q: "Was there an injury or fall?", options: ["Yes", "No, came gradually"] },
      { q: "Any swelling or redness?", options: ["Yes", "No"] },
      { q: "How does it affect movement?", options: ["Can't move it at all", "Limited movement", "Painful but functional"] },
    ],
    immediateAction: "Rest the affected area. Apply an ice pack (wrapped in cloth) for 20 minutes at a time. Avoid putting weight on it. If injury occurred with a snap sound, seek urgent care.",
  },
  {
    id: "kidney", label: "Swelling / Urination", icon: "🫘", dept: "nephrology",
    tests: ["Serum Creatinine", "eGFR", "Urine Test", "Renal Ultrasound"],
    followUps: [
      { q: "Which type of issue?", options: ["Leg/face swelling", "Frequent urination", "Burning urination", "Little/no urine"] },
      { q: "Any blood in urine?", options: ["Yes", "No"] },
      { q: "Any flank or lower back pain?", options: ["Yes", "No"] },
      { q: "How long has this been going on?", options: ["Today", "A few days", "Weeks", "Months"] },
    ],
    immediateAction: "Drink plenty of water (unless swelling is severe). Avoid salty foods. If urine output suddenly stops or there is blood in urine, seek urgent medical evaluation today.",
  },
  {
    id: "sugar", label: "Sugar / Thyroid", icon: "🔬", dept: "endocrinology",
    tests: ["HbA1c", "Fasting Blood Sugar", "TSH / T3 / T4", "Lipid Profile"],
    followUps: [
      { q: "Main concern?", options: ["High blood sugar", "Low blood sugar episodes", "Thyroid issue", "Weight changes"] },
      { q: "Any excessive thirst or frequent urination?", options: ["Yes, both", "Only thirst", "Only urination", "No"] },
      { q: "Feeling unusually tired or weak?", options: ["Yes, very much", "Somewhat", "No"] },
      { q: "Any family history of diabetes/thyroid?", options: ["Yes – diabetes", "Yes – thyroid", "Both", "None"] },
    ],
    immediateAction: "If blood sugar feels very low (shakiness, sweating, confusion), eat fast sugar immediately (glucose tablets, juice, or regular soda). For high sugar or feeling very unwell, seek care today.",
  },
  {
    id: "lump", label: "Lump / Weight Loss", icon: "🔴", dept: "oncology",
    tests: ["CECT Scan", "PET Scan", "Tumor Markers", "Biopsy"],
    followUps: [
      { q: "Nature of the lump?", options: ["Hard & immovable", "Soft & movable", "Painful to touch", "No pain"] },
      { q: "How long has it been present?", options: ["Less than 1 month", "1–3 months", "3–6 months", "6+ months"] },
      { q: "Any unexplained weight loss?", options: ["Yes – significant", "Slight loss", "No change"] },
      { q: "Any night sweats or fever?", options: ["Yes", "No"] },
    ],
    immediateAction: "Do not squeeze or massage the lump. Monitor for rapid growth or skin changes. Any lump lasting more than 2 weeks with unexplained weight loss warrants urgent evaluation — book an appointment today.",
  },
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

const C = {
  bg:      "#0D0D0F",
  surface: "#141416",
  card:    "#1A1A1E",
  border:  "#242428",
  borderHover: "#3A3A40",
  accent:  "#6EE7B7",
  accentDim: "#6EE7B720",
  accentText: "#34D399",
  red:     "#F87171",
  redDim:  "#F8717120",
  text:    "#F5F5F7",
  muted:   "#6B6B78",
  muted2:  "#3A3A42",
  purple:  "#818CF8",
  purpleDim: "#818CF820",
};

const fontStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

// Emergency overlay component
function EmergencyOverlay({ conditionName, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(180,0,0,0.97)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "emergPulse 1.2s ease-in-out infinite alternate",
      padding: "32px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: "emergBounce 0.6s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: 12, lineHeight: 1.2 }}>
        Emergency Alert
      </div>
      <div style={{ fontSize: 16, color: "#FFCDD2", marginBottom: 8, fontWeight: 500 }}>
        Possible serious condition detected:
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#FFEB3B", marginBottom: 28, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {conditionName}
      </div>
      <div style={{ fontSize: 15, color: "#FFCDD2", lineHeight: 1.7, maxWidth: 360, marginBottom: 36 }}>
        This condition may require <strong style={{ color: "#fff" }}>immediate medical attention</strong>.
        Do not delay — please call emergency services right away.
      </div>
      <a href="tel:112" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "18px 40px", borderRadius: 16,
        background: "#fff", color: "#C62828",
        fontSize: 20, fontWeight: 900, textDecoration: "none",
        boxShadow: "0 0 40px rgba(255,255,255,0.3)",
        marginBottom: 16, width: "100%", maxWidth: 320,
        letterSpacing: "-0.3px",
      }}>
        📞 Call 112 — Emergency
      </a>
      <a href="tel:108" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "14px 32px", borderRadius: 14,
        background: "rgba(255,255,255,0.15)", color: "#fff",
        fontSize: 16, fontWeight: 700, textDecoration: "none",
        border: "2px solid rgba(255,255,255,0.4)",
        marginBottom: 28, width: "100%", maxWidth: 320,
      }}>
        🏥 Call 108 — Ambulance
      </a>
      <button onClick={onClose} style={{
        ...fontStyle, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)",
        color: "rgba(255,255,255,0.7)", padding: "10px 28px", borderRadius: 10,
        fontSize: 13, cursor: "pointer", fontWeight: 500,
      }}>
        I understand — Continue reading
      </button>
    </div>
  );
}

export default function MedMatch() {
  const [screen, setScreen]         = useState("home");
  const [mode, setMode]             = useState("symptom");
  const [picked, setPicked]         = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [disease, setDisease]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [aiData, setAiData]         = useState(null);
  const [error, setError]           = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [emergency, setEmergency]   = useState(null);
  const resultRef = useRef(null);

  // admin state
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass]     = useState("");
  const [adminError, setAdminError]   = useState("");
  const [depts, setDepts]             = useState(() => {
    try { const s = localStorage.getItem("mm_depts"); return s ? JSON.parse(s) : HOSPITAL.departments; }
    catch { return HOSPITAL.departments; }
  });
  const [editDept, setEditDept]       = useState(null);
  const [newDocName, setNewDocName]   = useState("");
  const [newSlots, setNewSlots]       = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  function saveDepts(updated) {
    setDepts(updated);
    try { localStorage.setItem("mm_depts", JSON.stringify(updated)); } catch {}
  }

  function reset() {
    setPicked(null); setDisease(""); setAiData(null); setError("");
    setSymptomAnswers({});
  }

  function adminLogin() {
    if (adminPass === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); }
    else { setAdminError("Incorrect password. Try again."); }
  }

  function startEdit(key) {
    setEditDept(key);
    setNewDocName("");
    setNewSlots(depts[key].slots || "");
    setAdminSuccess("");
  }

  function addDoctor(deptKey) {
    if (!newDocName.trim()) return;
    const updated = {
      ...depts,
      [deptKey]: {
        ...depts[deptKey],
        doctors: [...depts[deptKey].doctors, newDocName.trim()],
        available: true,
      }
    };
    saveDepts(updated);
    setNewDocName("");
    setAdminSuccess("Doctor added successfully.");
    setTimeout(() => setAdminSuccess(""), 2500);
  }

  function removeDoctor(deptKey, idx) {
    const doctors = depts[deptKey].doctors.filter((_, i) => i !== idx);
    const updated = { ...depts, [deptKey]: { ...depts[deptKey], doctors, available: doctors.length > 0 } };
    saveDepts(updated);
  }

  function saveSlots(deptKey) {
    const updated = { ...depts, [deptKey]: { ...depts[deptKey], slots: newSlots } };
    saveDepts(updated);
    setAdminSuccess("Slots updated.");
    setTimeout(() => setAdminSuccess(""), 2500);
  }

  function toggleAvail(deptKey) {
    const updated = { ...depts, [deptKey]: { ...depts[deptKey], available: !depts[deptKey].available } };
    saveDepts(updated);
  }

  const activeDepts = Object.values(depts).filter(d => d.available).length;
  const totalDepts  = Object.keys(depts).length;
  const totalDocs   = Object.values(depts).reduce((a, d) => a + d.doctors.length, 0);
  const pickedDept  = picked ? depts[picked.dept] : null;

  const Divider   = () => <div style={{ height: 1, background: C.border, margin: "20px 0" }} />;
  const Tag = ({ ok }) => (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 100,
      background: ok ? C.accentDim : C.redDim, color: ok ? C.accentText : C.red, border: "1px solid " + (ok ? "#34D39940" : "#F8717140") }}>
      {ok ? "● Available" : "● Unavailable"}
    </span>
  );
  const SecLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>{children}</div>
  );

  const DoctorList = ({ dept, deptKey, showFuture = true }) => (
    dept.available ? (
      dept.doctors.length > 0 ? (
        <>
          {dept.doctors.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < dept.doctors.length - 1 ? "1px solid " + C.border : "none", fontSize: 14, color: C.text }}>
              <span style={{ fontSize: 16 }}>👤</span>{d}
            </div>
          ))}
          {dept.slots && (
            <div style={{ marginTop: 14, fontSize: 12, color: C.accentText, background: C.accentDim, border: "1px solid " + C.accentText + "40", padding: "6px 12px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              ⏰ {dept.slots}
            </div>
          )}
        </>
      ) : showFuture ? (
        <div style={{ padding: "14px 16px", background: C.purpleDim, border: "1px solid " + C.purple + "40", borderRadius: 10, fontSize: 13, color: C.purple, lineHeight: 1.6 }}>
          🕐 Doctor information will be added in future updates.
        </div>
      ) : null
    ) : (
      <div style={{ padding: "14px 16px", background: C.redDim, border: "1px solid " + C.red + "40", borderRadius: 10, fontSize: 13, color: C.red }}>
        No specialist available. Contact reception for a referral.
      </div>
    )
  );

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
          max_tokens: 900,
          messages: [{
            role: "user",
            content: `Patient condition: "${disease}". You are an honest medical advisor protecting patients from unnecessary tests hospitals use to inflate bills. Reply ONLY in valid JSON with no markdown backticks, no extra text:\n{\n  "name": "clean condition name",\n  "dept_key": "one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology",\n  "specialist": "doctor type e.g. Cardiologist",\n  "needed": [{"test": "name", "reason": "one line why"}],\n  "skip": [{"test": "name", "reason": "why hospitals push this but patient does not need it"}],\n  "advice": "one sentence honest patient tip",\n  "immediate_action": "one to two sentence immediate step the patient should take right now before seeing a doctor",\n  "is_serious": true or false (set true if condition could be life-threatening or needs ER-level care)\n}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(disease);
      const result = { ...parsed, dept: depts[key], deptKey: key };
      setAiData(result);
      // Check if serious
      if (parsed.is_serious || isSerious(disease, parsed.name)) {
        setEmergency(parsed.name || disease);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (_) { setError("Something went wrong. Please try again."); }
    setLoading(false);
  }

  const isEmergencyScreen = !!emergency;

  return (
    <div style={{
      ...fontStyle,
      minHeight: "100vh",
      background: isEmergencyScreen ? "#7f0000" : C.bg,
      color: C.text,
      transition: "background 0.6s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        textarea:focus, input:focus { outline: none; border-color: ${C.accentText} !important; box-shadow: 0 0 0 3px ${C.accentDim} !important; }
        .sym-card:hover { border-color: ${C.accentText} !important; background: ${C.accentDim} !important; }
        .home-card:hover { border-color: ${C.borderHover} !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; }
        .dept-card:hover { border-color: ${C.borderHover} !important; }
        .admin-row:hover { background: ${C.surface} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes emergPulse { from { background: rgba(180,0,0,0.95); } to { background: rgba(220,0,0,1); } }
        @keyframes emergBounce { from { transform: scale(1); } to { transform: scale(1.1); } }
        .answer-pill { cursor: pointer; transition: all 0.15s; }
        .answer-pill:hover { transform: translateY(-1px); }
        .admin-corner { position: fixed; bottom: 22px; right: 22px; z-index: 100; }
        .admin-corner-btn {
          width: 44px; height: 44px; border-radius: 50%;
          background: #1A1A1E; border: 1px solid #3A3A40;
          color: #F59E0B; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: all 0.2s;
        }
        .admin-corner-btn:hover { background: #F59E0B18; border-color: #F59E0B60; transform: scale(1.08); }
      `}</style>

      {/* EMERGENCY OVERLAY */}
      {emergency && (
        <EmergencyOverlay conditionName={emergency} onClose={() => setEmergency(null)} />
      )}

      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px", borderBottom: "1px solid " + (isEmergencyScreen ? "#ff000040" : C.border),
        position: "sticky", top: 0, zIndex: 50,
        background: isEmergencyScreen ? "rgba(100,0,0,0.9)" : C.bg,
        backdropFilter: "blur(20px)",
        transition: "all 0.6s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #34D399, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>+</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: C.text }}>MedMatch</span>
        </div>
        {screen !== "home" && (
          <button onClick={() => { setScreen("home"); reset(); setEditDept(null); setAdminAuthed(false); setAdminPass(""); }}
            style={{ ...fontStyle, fontSize: 13, color: C.muted, cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            ← Home
          </button>
        )}
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px 60px" }} className="fade-up">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentText, marginBottom: 20 }}>Medical Intelligence</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14, color: C.text }}>
            Know exactly<br />what you need.
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 48 }}>
            Find the right tests and doctors — without unnecessary costs or confusion.
          </p>

          {/* Two main cards: Patient & Staff */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 0 }}>
            {/* Patient Card */}
            <div className="home-card"
              onClick={() => setScreen("patient")}
              style={{
                background: C.card,
                border: "1px solid " + C.border,
                borderRadius: 20,
                padding: "28px 20px 24px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}>
              {/* Patient SVG Icon */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg, #34D39920, #059669)",
                  border: "1.5px solid #34D39940",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="11" r="6" fill="#34D399" opacity="0.9"/>
                    <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                    <rect x="15" y="19" width="6" height="10" rx="1" fill="#34D39930"/>
                    {/* stethoscope hint */}
                    <circle cx="26" cy="22" r="3" stroke="#34D39970" strokeWidth="1.5" fill="none"/>
                    <path d="M23 22c-2 0-3-1-3-3" stroke="#34D39970" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Patient</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>Find tests & right doctor</div>
            </div>

            {/* Staff Card */}
            <div className="home-card"
              onClick={() => setScreen("hospital")}
              style={{
                background: C.card,
                border: "1px solid " + C.border,
                borderRadius: 20,
                padding: "28px 20px 24px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}>
              {/* Staff SVG Icon */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg, #818CF820, #6366F1)",
                  border: "1.5px solid #818CF840",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    {/* two staff figures */}
                    <circle cx="13" cy="10" r="4.5" fill="#818CF8" opacity="0.85"/>
                    <circle cx="23" cy="10" r="4.5" fill="#818CF8" opacity="0.55"/>
                    <path d="M4 29c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85"/>
                    <path d="M22 20c2.21 0 4.24.9 5.7 2.35" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
                    {/* clipboard */}
                    <rect x="22" y="21" width="10" height="12" rx="2" fill="#818CF820" stroke="#818CF870" strokeWidth="1.2"/>
                    <line x1="24.5" y1="25" x2="29.5" y2="25" stroke="#818CF8" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="24.5" y1="28" x2="29.5" y2="28" stroke="#818CF8" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Staff</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>View dept. availability</div>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT */}
      {screen === "patient" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 6 }}>Your Health Check</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Choose how you'd like to proceed</p>
          <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, marginBottom: 28, gap: 4, border: "1px solid " + C.border }}>
            {[["symptom", "I have symptoms"], ["disease", "I know my condition"]].map(([val, lbl]) => (
              <button key={val} onClick={() => { setMode(val); reset(); }}
                style={{ ...fontStyle, flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  background: mode === val ? C.card : "transparent", color: mode === val ? C.text : C.muted,
                  boxShadow: mode === val ? "0 1px 6px rgba(0,0,0,0.4)" : "none", transition: "all 0.18s" }}>
                {lbl}
              </button>
            ))}
          </div>

          {mode === "symptom" && (
            <>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Select what's bothering you</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SYMPTOMS.map(s => {
                  const isSelected = picked?.id === s.id;
                  return (
                    <div key={s.id} className={isSelected ? "" : "sym-card"}
                      onClick={() => {
                        setPicked(s);
                        setSymptomAnswers({});
                        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                      }}
                      style={{ background: isSelected ? C.accentDim : C.card, border: "1px solid " + (isSelected ? C.accentText : C.border), borderRadius: 14, padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.18s" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? C.accentText : C.text, lineHeight: 1.35 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-up" style={{ marginTop: 24 }}>
                  {/* Follow-up questions */}
                  <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, padding: "20px 22px", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accentText, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10 }}>
                      Tell us more — be specific
                    </div>
                    {picked.followUps.map((fq, qi) => (
                      <div key={qi} style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>{fq.q}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {fq.options.map((opt, oi) => {
                            const isChosen = symptomAnswers[qi] === oi;
                            return (
                              <div key={oi} className="answer-pill"
                                onClick={() => setSymptomAnswers(prev => ({ ...prev, [qi]: oi }))}
                                style={{
                                  padding: "7px 14px", borderRadius: 100,
                                  background: isChosen ? C.accentDim : C.surface,
                                  border: "1px solid " + (isChosen ? C.accentText : C.border),
                                  color: isChosen ? C.accentText : C.muted,
                                  fontSize: 12, fontWeight: isChosen ? 600 : 400,
                                  cursor: "pointer",
                                }}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Immediate action */}
                  {picked.immediateAction && (
                    <div style={{ padding: "14px 18px", background: "#78350F18", border: "1px solid #92400E50", borderRadius: 14, marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", marginBottom: 6 }}>Immediate Action</div>
                        <div style={{ fontSize: 13, color: "#FCD34D", lineHeight: 1.65 }}>{picked.immediateAction}</div>
                      </div>
                    </div>
                  )}

                  {/* Main result card */}
                  <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, overflow: "hidden" }}>
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
                      <DoctorList dept={pickedDept} deptKey={picked.dept} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "disease" && (
            <>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Describe your condition or reason for visit</p>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
                Be specific — include <span style={{ color: C.accentText }}>location, duration, severity, and any other symptoms</span> for better results.
              </div>
              <textarea
                value={disease}
                onChange={e => setDisease(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); } }}
                placeholder="e.g. Severe chest pain radiating to left arm for 2 hours, with shortness of breath and sweating — or — Type 2 Diabetes 3-month checkup, last HbA1c was 8.2, on Metformin..."
                style={{ ...fontStyle, width: "100%", padding: "14px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 12, fontSize: 14, color: C.text, resize: "none", minHeight: 110, lineHeight: 1.65, transition: "border-color 0.2s, box-shadow 0.2s" }}
              />
              <button onClick={analyze} disabled={loading || !disease.trim()}
                style={{ ...fontStyle, width: "100%", padding: "14px", marginTop: 10, background: loading || !disease.trim() ? C.muted2 : "linear-gradient(135deg, #34D399, #059669)", border: "none", borderRadius: 12, color: loading || !disease.trim() ? C.muted : "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !disease.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                {loading ? <span><span className="spin">◌</span> &nbsp;Analyzing...</span> : "Analyze & check what you need →"}
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
                <div ref={resultRef} className="fade-up" style={{ marginTop: 24 }}>
                  {/* Immediate Action from AI */}
                  {aiData.immediate_action && (
                    <div style={{ padding: "14px 18px", background: "#78350F18", border: "1px solid #92400E50", borderRadius: 14, marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", marginBottom: 6 }}>Immediate Action</div>
                        <div style={{ fontSize: 13, color: "#FCD34D", lineHeight: 1.65 }}>{aiData.immediate_action}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, overflow: "hidden" }}>
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
                      <DoctorList dept={aiData.dept} deptKey={aiData.deptKey} />
                      {aiData.advice && (
                        <>
                          <Divider />
                          <div style={{ padding: "14px 16px", background: "#1E3A5F30", border: "1px solid #3B82F640", borderRadius: 11, fontSize: 13, color: "#93C5FD", lineHeight: 1.65 }}>
                            💡 {aiData.advice}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* HOSPITAL */}
      {screen === "hospital" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 4 }}>{HOSPITAL.name}</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Live department availability</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { num: activeDepts, label: "Active", color: C.accentText },
              { num: totalDepts - activeDepts, label: "Unavailable", color: C.red },
              { num: totalDocs, label: "Doctors", color: C.purple },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(depts).map(([key, d]) => {
              const isOpen = expandedDept === key;
              return (
                <div key={key} className={d.available ? "dept-card" : ""}
                  onClick={() => d.available && setExpandedDept(isOpen ? null : key)}
                  style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px", cursor: d.available ? "pointer" : "default", transition: "all 0.18s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{d.label}</span>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.available ? C.accentText : C.red, display: "inline-block", marginTop: 3, flexShrink: 0, boxShadow: d.available ? "0 0 6px " + C.accentText + "80" : "none" }} />
                  </div>
                  <div style={{ fontSize: 11, color: d.available ? C.accentText : C.red, fontWeight: 500, marginBottom: isOpen ? 10 : 0 }}>
                    {d.available ? (d.doctors.length > 0 ? `${d.doctors.length} doctor${d.doctors.length !== 1 ? "s" : ""}` : "Coming soon") : "Unavailable"}
                  </div>
                  {d.available && isOpen && (
                    <div style={{ borderTop: "1px solid " + C.border, paddingTop: 10 }}>
                      {d.doctors.length > 0 ? d.doctors.map((doc, i) => (
                        <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: C.muted2 }}>–</span> {doc}
                        </div>
                      )) : (
                        <div style={{ fontSize: 11, color: C.purple }}>🕐 Doctor info coming soon</div>
                      )}
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

      {/* ADMIN — now accessed via corner button */}
      {screen === "admin" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 100px" }} className="fade-up">
          {!adminAuthed ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 6 }}>Admin Panel</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Enter password to continue</p>
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Password</div>
                <input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && adminLogin()}
                  placeholder="Enter admin password"
                  style={{ ...fontStyle, width: "100%", padding: "13px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, fontSize: 14, color: C.text, transition: "border-color 0.2s" }}
                />
                {adminError && <div style={{ marginTop: 10, fontSize: 13, color: C.red }}>{adminError}</div>}
                <button onClick={adminLogin}
                  style={{ ...fontStyle, width: "100%", padding: "13px", marginTop: 14, background: "linear-gradient(135deg, #F59E0B, #D97706)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Login →
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px" }}>Admin Panel</h2>
                <button onClick={() => { setAdminAuthed(false); setAdminPass(""); setEditDept(null); }}
                  style={{ ...fontStyle, fontSize: 12, color: C.red, background: C.redDim, border: "1px solid " + C.red + "40", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                  Logout
                </button>
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Manage doctors and department availability</p>

              {adminSuccess && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: C.accentDim, border: "1px solid " + C.accentText + "40", borderRadius: 10, fontSize: 13, color: C.accentText }}>
                  ✓ {adminSuccess}
                </div>
              )}

              {Object.entries(depts).map(([key, d]) => {
                const isEditing = editDept === key;
                return (
                  <div key={key} style={{ background: C.card, border: "1px solid " + (isEditing ? "#F59E0B40" : C.border), borderRadius: 16, marginBottom: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <div className="admin-row"
                      style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => setEditDept(isEditing ? null : key)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.available ? C.accentText : C.red, display: "inline-block", boxShadow: d.available ? "0 0 6px " + C.accentText + "80" : "none" }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{d.label}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{d.doctors.length} doctor{d.doctors.length !== 1 ? "s" : ""}</span>
                      </div>
                      <span style={{ fontSize: 18, color: C.muted2, lineHeight: 1 }}>{isEditing ? "↑" : "↓"}</span>
                    </div>

                    {isEditing && (
                      <div style={{ borderTop: "1px solid " + C.border, padding: "20px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Department availability</span>
                          <button onClick={() => toggleAvail(key)}
                            style={{ ...fontStyle, padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                              background: d.available ? C.redDim : C.accentDim,
                              color: d.available ? C.red : C.accentText }}>
                            {d.available ? "Mark Unavailable" : "Mark Available"}
                          </button>
                        </div>

                        {d.doctors.length > 0 && (
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Current Doctors</div>
                            {d.doctors.map((doc, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.surface, borderRadius: 10, marginBottom: 6, border: "1px solid " + C.border }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.text }}>
                                  <span>👤</span> {doc}
                                </div>
                                <button onClick={() => removeDoctor(key, i)}
                                  style={{ ...fontStyle, background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px", borderRadius: 6 }}>
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginBottom: 18 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Add Doctor</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              value={newDocName}
                              onChange={e => setNewDocName(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && addDoctor(key)}
                              placeholder="Dr. Full Name"
                              style={{ ...fontStyle, flex: 1, padding: "11px 14px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, fontSize: 13, color: C.text, transition: "border-color 0.2s" }}
                            />
                            <button onClick={() => addDoctor(key)}
                              style={{ ...fontStyle, padding: "11px 18px", background: "linear-gradient(135deg, #34D399, #059669)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                              + Add
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Availability Slots</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              value={newSlots}
                              onChange={e => setNewSlots(e.target.value)}
                              placeholder="e.g. Mon–Fri, 9AM–5PM"
                              style={{ ...fontStyle, flex: 1, padding: "11px 14px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, fontSize: 13, color: C.text, transition: "border-color 0.2s" }}
                            />
                            <button onClick={() => saveSlots(key)}
                              style={{ ...fontStyle, padding: "11px 18px", background: C.purpleDim, border: "1px solid " + C.purple + "40", borderRadius: 10, color: C.purple, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ADMIN CORNER BUTTON — always visible */}
      {screen !== "admin" && (
        <div className="admin-corner">
          <button
            className="admin-corner-btn"
            onClick={() => setScreen("admin")}
            title="Admin Panel"
          >
            ⚙
          </button>
        </div>
      )}
    </div>
  );
}
