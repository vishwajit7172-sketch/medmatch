import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Vishu@226";

// ─── JSONBIN CONFIG ────────────────────────────────────────────────────────────
const BIN_ID    = "69c3a24fc3097a1dd55a25c4";
const API_KEY   = "$2a$10$ZkemuE63fLP0.nS4U0yW2ugz04.Pvu/58LeHfNXX4t6fETRq59kIi";
const BIN_URL   = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const BIN_HEADS = { "Content-Type": "application/json", "X-Master-Key": API_KEY };

async function dbGet() {
  const r = await fetch(BIN_URL + "/latest", { headers: { "X-Master-Key": API_KEY } });
  if (!r.ok) throw new Error("dbGet failed: " + r.status);
  const data = await r.json();
  return data.record; // { bookings: [], tests: [], depts: {} }
}

async function dbSet(record) {
  const r = await fetch(BIN_URL, { method: "PUT", headers: BIN_HEADS, body: JSON.stringify(record) });
  if (!r.ok) throw new Error("dbSet failed: " + r.status);
  return r.json();
}

// Initialise bin if it's empty / first run
async function dbInit(defaultTests, defaultDepts) {
  try {
    const record = await dbGet();
    // If bin has no keys, seed it
    if (!record || (!record.bookings && !record.tests && !record.depts)) {
      await dbSet({ bookings: [], tests: defaultTests, depts: defaultDepts });
      return { bookings: [], tests: defaultTests, depts: defaultDepts };
    }
    return record;
  } catch {
    // Bin empty / first time — seed it
    await dbSet({ bookings: [], tests: defaultTests, depts: defaultDepts });
    return { bookings: [], tests: defaultTests, depts: defaultDepts };
  }
}

const SERIOUS_CONDITIONS = [
  "heart attack","myocardial infarction","stroke","cardiac arrest","pulmonary embolism",
  "aortic aneurysm","sepsis","anaphylaxis","meningitis","severe chest pain",
  "subarachnoid hemorrhage","eclampsia","respiratory failure","diabetic ketoacidosis",
  "acute kidney failure","internal bleeding","severe allergic","epiglottitis",
  "testicular torsion","ruptured appendix","acute appendicitis","ectopic pregnancy",
  "spinal cord injury","brain tumor","acute liver failure","blood clot","dvt",
  "leukemia","lymphoma","cancer","tumor","malignant","overdose","poisoning",
  "unconscious","unresponsive","seizure","epilepsy",
];

const DEFAULT_DEPTS = {
  cardiology:       { label: "Cardiology",       available: true,  doctors: [], slots: "" },
  neurology:        { label: "Neurology",         available: true,  doctors: [], slots: "" },
  pulmonology:      { label: "Pulmonology",       available: false, doctors: [], slots: "" },
  gastroenterology: { label: "Gastroenterology",  available: true,  doctors: [], slots: "" },
  orthopedics:      { label: "Orthopedics",       available: true,  doctors: [], slots: "" },
  nephrology:       { label: "Nephrology",        available: true,  doctors: [], slots: "" },
  endocrinology:    { label: "Endocrinology",     available: false, doctors: [], slots: "" },
  oncology:         { label: "Oncology",          available: true,  doctors: [], slots: "" },
  general_medicine: { label: "General Medicine",  available: true,  doctors: [], slots: "" },
  dermatology:      { label: "Dermatology",       available: true,  doctors: [], slots: "" },
};

const DEPT_KEYS = Object.keys(DEFAULT_DEPTS);

// Default popular tests with prices
const DEFAULT_TESTS = [
  { id: "t1", name: "Complete Blood Count (CBC)", price: 250, category: "Blood Tests", popular: true },
  { id: "t2", name: "Blood Sugar Fasting", price: 80, category: "Blood Tests", popular: true },
  { id: "t3", name: "HbA1c", price: 350, category: "Blood Tests", popular: true },
  { id: "t4", name: "Lipid Profile", price: 400, category: "Blood Tests", popular: true },
  { id: "t5", name: "Thyroid Profile (TSH/T3/T4)", price: 500, category: "Thyroid", popular: true },
  { id: "t6", name: "Liver Function Test (LFT)", price: 450, category: "Organ Function", popular: true },
  { id: "t7", name: "Kidney Function Test (KFT)", price: 420, category: "Organ Function", popular: true },
  { id: "t8", name: "Serum Creatinine", price: 150, category: "Organ Function", popular: false },
  { id: "t9", name: "ECG", price: 200, category: "Cardiac", popular: true },
  { id: "t10", name: "Echocardiogram", price: 1200, category: "Cardiac", popular: false },
  { id: "t11", name: "Chest X-Ray", price: 300, category: "Radiology", popular: true },
  { id: "t12", name: "Ultrasound Abdomen", price: 800, category: "Radiology", popular: true },
  { id: "t13", name: "MRI Brain", price: 4500, category: "Radiology", popular: false },
  { id: "t14", name: "CT Scan", price: 3000, category: "Radiology", popular: false },
  { id: "t15", name: "Urine Routine", price: 120, category: "Urine Tests", popular: true },
  { id: "t16", name: "Vitamin D3", price: 600, category: "Vitamins", popular: true },
  { id: "t17", name: "Vitamin B12", price: 500, category: "Vitamins", popular: true },
  { id: "t18", name: "CRP (C-Reactive Protein)", price: 350, category: "Inflammation", popular: false },
];

const SYMPTOMS = [
  { id:"chest",   label:"Chest Pain",        icon:"🫀", dept:"cardiology",
    tests:["ECG","Troponin Blood Test","Echocardiogram","Lipid Profile"],
    followUps:[
      {q:"Pain severity?",        opts:["Mild (1–3)","Moderate (4–6)","Severe (7–10)"]},
      {q:"Spreads to arm/jaw?",   opts:["Yes","No","Not sure"]},
      {q:"Shortness of breath?",  opts:["Yes","No"]},
      {q:"How long?",             opts:["Just started","Few hours","Days","Weeks+"]},
    ],
    action:"Sit comfortably, avoid exertion. Spreading to arm/jaw → call 112 now.",
  },
  { id:"head",    label:"Headache",           icon:"🧠", dept:"neurology",
    tests:["MRI Brain","CT Scan Head","BP Check","EEG"],
    followUps:[
      {q:"Headache type?",  opts:["Throbbing","Pressure","Sharp/stabbing","Dull ache"]},
      {q:"Pain location?",  opts:["Forehead","Back of head","One side","Whole head"]},
      {q:"Vision/nausea?",  opts:["Yes","No"]},
      {q:"Duration?",       opts:["Minutes","Hours","Days","On and off"]},
    ],
    action:"Rest in dark quiet room. Stay hydrated. Worst-ever headache = emergency.",
  },
  { id:"breath",  label:"Breathlessness",     icon:"🫁", dept:"pulmonology",
    tests:["Chest X-Ray","Spirometry","ABG Test","Sputum Culture"],
    followUps:[
      {q:"When does it occur?",   opts:["At rest","Light activity","Heavy exertion","Lying flat"]},
      {q:"Wheezing?",             opts:["Yes","No"]},
      {q:"Cough or fever?",       opts:["Cough","Fever","Both","Neither"]},
      {q:"Duration?",             opts:["Just started","Days","Weeks","Months+"]},
    ],
    action:"Sit upright, breathe slowly. Blue lips/fingers = call 112.",
  },
  { id:"stomach", label:"Stomach Pain",       icon:"🫃", dept:"gastroenterology",
    tests:["Ultrasound Abdomen","H. Pylori Test","LFT","Endoscopy"],
    followUps:[
      {q:"Pain location?",   opts:["Upper abdomen","Lower abdomen","Right side","Left side"]},
      {q:"Vomiting?",        opts:["With blood","Without blood","No"]},
      {q:"Stool changes?",   opts:["Dark/tarry","Loose","Normal"]},
      {q:"After meals?",     opts:["Worse","Better","No relation"]},
    ],
    action:"Avoid spicy foods, stay upright after eating. Blood in vomit = emergency.",
  },
  { id:"joint",   label:"Joint / Back Pain",  icon:"🦴", dept:"orthopedics",
    tests:["X-Ray","MRI Joint","CRP & ESR","RA Factor"],
    followUps:[
      {q:"Area affected?",  opts:["Knee","Back/spine","Shoulder","Hip/ankle"]},
      {q:"Injury or fall?", opts:["Yes","No, gradual"]},
      {q:"Swelling?",       opts:["Yes","No"]},
      {q:"Mobility?",       opts:["Can't move","Limited","Painful but moving"]},
    ],
    action:"Rest, apply ice 20 min intervals. Snap sound during injury = urgent care.",
  },
  { id:"kidney",  label:"Kidney / Urine",     icon:"🫘", dept:"nephrology",
    tests:["Serum Creatinine","eGFR","Urine Test","Renal Ultrasound"],
    followUps:[
      {q:"Issue type?",      opts:["Swelling","Frequent urination","Burning urination","Little/no urine"]},
      {q:"Blood in urine?",  opts:["Yes","No"]},
      {q:"Flank pain?",      opts:["Yes","No"]},
      {q:"Duration?",        opts:["Today","Few days","Weeks","Months"]},
    ],
    action:"Drink water unless severe swelling. No urine or blood = urgent eval today.",
  },
  { id:"sugar",   label:"Sugar / Thyroid",    icon:"🔬", dept:"endocrinology",
    tests:["HbA1c","Fasting Blood Sugar","TSH / T3 / T4","Lipid Profile"],
    followUps:[
      {q:"Main concern?",     opts:["High blood sugar","Low sugar episodes","Thyroid","Weight changes"]},
      {q:"Excessive thirst?", opts:["Yes","No"]},
      {q:"Unusual fatigue?",  opts:["Very much","Somewhat","No"]},
      {q:"Family history?",   opts:["Diabetes","Thyroid","Both","None"]},
    ],
    action:"Low sugar + shakiness: eat glucose/juice now. High sugar + unwell = doctor today.",
  },
  { id:"lump",    label:"Lump / Weight Loss", icon:"🔴", dept:"oncology",
    tests:["CECT Scan","PET Scan","Tumor Markers","Biopsy"],
    followUps:[
      {q:"Lump nature?",       opts:["Hard & immovable","Soft & movable","Painful","No pain"]},
      {q:"How long?",          opts:["<1 month","1–3 months","3–6 months","6+ months"]},
      {q:"Weight loss?",       opts:["Significant","Slight","No change"]},
      {q:"Night sweats?",      opts:["Yes","No"]},
    ],
    action:"Do not squeeze or massage. Lump 2+ weeks + weight loss = urgent evaluation.",
  },
  { id:"skin",    label:"Skin Issues",        icon:"🩹", dept:"dermatology",
    tests:["Skin Biopsy","KOH Test","Patch Test","Blood CBC"],
    followUps:[
      {q:"Type?",      opts:["Rash/redness","Itching","Acne","Discoloration"]},
      {q:"Duration?",  opts:["Days","Weeks","Months","Years"]},
      {q:"Spreading?", opts:["Rapidly","Slowly","No change"]},
      {q:"Triggers?",  opts:["Food","Contact","Stress","Unknown"]},
    ],
    action:"Avoid scratching. Rapid rash with fever = see doctor today.",
  },
  { id:"fever",   label:"Fever / General",    icon:"🌡️", dept:"general_medicine",
    tests:["CBC","CRP","Blood Culture","Urine Routine"],
    followUps:[
      {q:"Temperature?",      opts:["Low-grade 99–100°F","Moderate 101–102°F","High 103°F+","Not measured"]},
      {q:"Chills/sweating?",  opts:["Chills","Sweating","Both","Neither"]},
      {q:"Body pain?",        opts:["Severe","Mild","No"]},
      {q:"Duration?",         opts:["1 day","2–3 days","A week","1 week+"]},
    ],
    action:"Stay hydrated, paracetamol if >101°F. 103°F+ not reducing = same-day doctor.",
  },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function isSerious(text, name = "") {
  const t = (text + " " + name).toLowerCase();
  return SERIOUS_CONDITIONS.some(k => t.includes(k));
}

function matchDept(text) {
  const t = text.toLowerCase();
  const map = {
    cardiology:       ["heart","cardiac","hypertension","bp","cholesterol","angina"],
    neurology:        ["brain","stroke","epilepsy","seizure","migraine","nerve","vertigo"],
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

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

// ─── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  bg:         "#080A0E",
  card:       "rgba(19,23,32,0.82)",
  border:     "#1E2533",
  borderHov:  "#2E3A4F",
  accent:     "#00D4AA",
  accentDim:  "rgba(0,212,170,0.1)",
  accentText: "#00D4AA",
  red:        "#FF5C6C",
  redDim:     "rgba(255,92,108,0.1)",
  text:       "#E8ECF4",
  muted:      "#5A6478",
  muted2:     "#2A3042",
  purple:     "#8B8BFF",
  purpleDim:  "rgba(139,139,255,0.1)",
  blue:       "#4DA6FF",
  blueDim:    "rgba(77,166,255,0.1)",
  gold:       "#FFB800",
  goldDim:    "rgba(255,184,0,0.1)",
};

const F = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ─── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
function AnimatedBG() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const N = Math.min(55, Math.floor(window.innerWidth / 20));
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      o: Math.random() * 0.45 + 0.08, c: ["#00D4AA","#4DA6FF","#8B8BFF"][Math.floor(Math.random() * 3)],
    }));
    let tick = 0;
    function draw() {
      tick++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 0.4;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 92) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(0,212,170,${(1 - d/92) * 0.1})`; ctx.stroke(); }
        }
      }
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.o * 200).toString(16).padStart(2, "0"); ctx.fill();
      });
      const sy = (tick * 0.22) % (H + 80) - 40;
      const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      sg.addColorStop(0, "transparent"); sg.addColorStop(0.5, "rgba(0,212,170,0.012)"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(0, sy - 40, W, 80);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"linear-gradient(135deg,#080A0E 0%,#0A0F1A 60%,#07090F 100%)" }} />;
}

// ─── EMERGENCY OVERLAY ─────────────────────────────────────────────────────────
function EmergencyOverlay({ name, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(150,0,0,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center",animation:"emergPulse 1.2s ease-in-out infinite alternate" }}>
      <div style={{ fontSize:68,marginBottom:14,animation:"emergBounce 0.6s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ fontSize:26,fontWeight:700,color:"#fff",marginBottom:10 }}>Emergency Alert</div>
      <div style={{ fontSize:14,color:"#FFCDD2",marginBottom:6 }}>Possible serious condition detected:</div>
      <div style={{ fontSize:18,fontWeight:700,color:"#FFEB3B",marginBottom:24,textTransform:"uppercase",letterSpacing:"0.04em" }}>{name}</div>
      <div style={{ fontSize:14,color:"#FFCDD2",lineHeight:1.7,maxWidth:320,marginBottom:28 }}>
        This may require <strong style={{ color:"#fff" }}>immediate medical attention</strong>.<br />
        Please call <strong style={{ color:"#FFEB3B" }}>112</strong> or go to your nearest emergency room now.
      </div>
      <a href="tel:112" style={{ display:"block",padding:"15px 40px",background:"#fff",borderRadius:14,color:"#CC0000",fontWeight:800,fontSize:18,textDecoration:"none",marginBottom:14,letterSpacing:"0.04em",fontFamily:"'DM Sans',system-ui" }}>📞 Call 112 Now</a>
      <button onClick={onClose} style={{ ...F,background:"none",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)",padding:"10px 28px",borderRadius:10,fontSize:13,cursor:"pointer" }}>I understand, dismiss</button>
    </div>
  );
}

// ─── SMALL REUSABLE COMPONENTS ─────────────────────────────────────────────────
const SecLabel = ({ children, color }) => (
  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color: color || C.muted,marginBottom:10 }}>{children}</div>
);
const Divider = () => <div style={{ height:1,background:C.border,margin:"16px 0" }} />;
const AvailBadge = ({ ok, label }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:ok?C.accentText:C.red,background:ok?C.accentDim:C.redDim,border:"1px solid "+(ok?C.accent:C.red)+"40",padding:"4px 11px",borderRadius:100 }}>
    {ok ? "● Available" : "● Unavailable"}{label ? `: ${label}` : ""}
  </span>
);
const ActionBox = ({ text }) => (
  <div style={{ padding:"13px 16px",background:"rgba(120,53,15,0.18)",border:"1px solid rgba(146,64,14,0.45)",borderRadius:13,marginBottom:13,display:"flex",gap:11,alignItems:"flex-start" }}>
    <span style={{ fontSize:17,flexShrink:0 }}>⚡</span>
    <div>
      <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#F59E0B",marginBottom:5 }}>Immediate Action</div>
      <div style={{ fontSize:13,color:"#FCD34D",lineHeight:1.65 }}>{text}</div>
    </div>
  </div>
);
const DoctorList = ({ dept }) => {
  if (!dept?.available) return <div style={{ padding:"13px 15px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red }}>No specialist available. Contact reception.</div>;
  if (dept.doctors.length === 0) return <div style={{ padding:"13px 15px",background:C.purpleDim,border:"1px solid "+C.purple+"40",borderRadius:10,fontSize:13,color:C.purple }}>🕐 Doctor info will be added soon.</div>;
  return (
    <>
      {dept.doctors.map((d,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:i<dept.doctors.length-1?"1px solid "+C.border:"none",fontSize:14,color:C.text }}>👤 {d}</div>
      ))}
      {dept.slots && <div style={{ marginTop:11,fontSize:12,color:C.accentText,background:C.accentDim,border:"1px solid "+C.accent+"40",padding:"5px 11px",borderRadius:7,display:"inline-flex",alignItems:"center",gap:6 }}>⏰ {dept.slots}</div>}
    </>
  );
};

// ─── BOOK TEST MODAL ───────────────────────────────────────────────────────────
function BookTestModal({ selectedTests, allTests, onClose, onBooked }) {
  const [phone, setPhone]   = useState("");
  const [name, setName]     = useState("");
  const [step, setStep]     = useState("form"); // form | success
  const [err, setErr]       = useState("");
  const [booking, setBooking] = useState(false);

  const chosen = allTests.filter(t => selectedTests.includes(t.id));
  const total  = chosen.reduce((s, t) => s + t.price, 0);

  async function handleBook() {
    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setErr("Enter a valid 10-digit Indian mobile number."); return; }
    setErr("");
    setBooking(true);
    const booking = {
      id: "BK" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      tests: chosen.map(t => ({ name: t.name, price: t.price })),
      total,
      bookedAt: new Date().toLocaleString("en-IN", { timeZone:"Asia/Kolkata" }),
      status: "Pending",
    };
    try {
      const record = await dbGet();
      const updatedBookings = [booking, ...(record.bookings || [])];
      await dbSet({ ...record, bookings: updatedBookings });
    } catch {
      setErr("Cloud sync failed. Try again.");
      setBooking(false);
      return;
    }
    onBooked(booking);
    setStep("success");
    setBooking(false);
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:5000,background:"rgba(4,6,10,0.88)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%",maxWidth:500,background:"#0D1018",border:"1px solid "+C.border,borderRadius:"22px 22px 0 0",padding:"28px 22px 36px",animation:"fadeUp 0.28s ease" }}>
        {step === "form" ? (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div>
                <div style={{ fontSize:17,fontWeight:700,color:C.text }}>Book Your Tests</div>
                <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{chosen.length} test{chosen.length!==1?"s":""} selected</div>
              </div>
              <button onClick={onClose} style={{ ...F,background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:"4px 8px" }}>×</button>
            </div>

            {/* Selected tests summary */}
            <div style={{ background:"rgba(13,18,30,0.7)",border:"1px solid "+C.border,borderRadius:13,padding:"14px",marginBottom:18 }}>
              {chosen.map((t,i) => (
                <div key={t.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<chosen.length-1?"1px solid "+C.muted2:"none" }}>
                  <span style={{ fontSize:13,color:C.text }}>{t.name}</span>
                  <span style={{ fontSize:13,fontWeight:600,color:C.accentText }}>₹{t.price}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,paddingTop:10,borderTop:"1px solid "+C.border }}>
                <span style={{ fontSize:13,fontWeight:700,color:C.text }}>Total</span>
                <span style={{ fontSize:16,fontWeight:800,color:C.gold }}>₹{total}</span>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:7 }}>Your Name</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"
                style={{ ...F,width:"100%",padding:"11px 14px",background:"rgba(13,18,30,0.8)",border:"1px solid "+C.border,borderRadius:10,fontSize:14,color:C.text }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:7 }}>Mobile Number</div>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number" type="tel" maxLength={10}
                style={{ ...F,width:"100%",padding:"11px 14px",background:"rgba(13,18,30,0.8)",border:"1px solid "+C.border,borderRadius:10,fontSize:14,color:C.text }} />
            </div>
            {err && <div style={{ marginBottom:12,padding:"10px 13px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:9,fontSize:13,color:C.red }}>{err}</div>}
            <button onClick={handleBook} disabled={booking} style={{ ...F,width:"100%",padding:"14px",background:booking?"rgba(0,212,170,0.35)":"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:booking?"not-allowed":"pointer",boxShadow:"0 4px 18px rgba(0,212,170,0.3)",transition:"all 0.2s" }}>
              {booking ? "Saving to cloud…" : "Confirm Booking →"}
            </button>
          </>
        ) : (
          <div style={{ textAlign:"center",padding:"10px 0 10px" }}>
            <div style={{ fontSize:56,marginBottom:16 }}>✅</div>
            <div style={{ fontSize:19,fontWeight:700,color:C.text,marginBottom:8 }}>Booking Confirmed!</div>
            <div style={{ fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:6 }}>
              We'll contact you at <strong style={{ color:C.accentText }}>+91 {phone}</strong> soon.
            </div>
            <div style={{ fontSize:12,color:C.muted,marginBottom:24 }}>Total: <strong style={{ color:C.gold }}>₹{total}</strong></div>
            <button onClick={onClose} style={{ ...F,padding:"12px 32px",background:C.accentDim,border:"1px solid "+C.accent+"40",borderRadius:11,color:C.accentText,fontSize:14,fontWeight:600,cursor:"pointer" }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TESTS SECTION ─────────────────────────────────────────────────────────────
function TestsSection({ tests }) {
  const [selectedTests, setSelectedTests] = useState([]);
  const [filterCat, setFilterCat]         = useState("Popular");
  const [showBookModal, setShowBookModal] = useState(false);

  const categories = ["Popular", ...Array.from(new Set(tests.map(t => t.category)))];

  const filtered = filterCat === "Popular"
    ? tests.filter(t => t.popular)
    : tests.filter(t => t.category === filterCat);

  function toggleTest(id) {
    setSelectedTests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const total = tests.filter(t => selectedTests.includes(t.id)).reduce((s,t) => s+t.price, 0);

  return (
    <div>
      <div style={{ padding:"11px 14px",background:C.blueDim,border:"1px solid "+C.blue+"28",borderRadius:11,marginBottom:18,fontSize:13,color:C.blue,lineHeight:1.6 }}>
        🧪 Browse and select tests. Tap a test to select it, then click <strong>Book Now</strong>.
      </div>

      {/* Category filter tabs */}
      <div style={{ display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:18 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ ...F,flexShrink:0,padding:"7px 14px",borderRadius:100,border:"1px solid "+(filterCat===cat?C.accent+"55":C.border),fontSize:12,fontWeight:filterCat===cat?600:400,background:filterCat===cat?C.accentDim:"rgba(13,18,30,0.6)",color:filterCat===cat?C.accentText:C.muted,cursor:"pointer",transition:"all 0.15s",backdropFilter:"blur(10px)" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Test cards */}
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
        {filtered.map(t => {
          const sel = selectedTests.includes(t.id);
          return (
            <div key={t.id} onClick={() => toggleTest(t.id)}
              style={{ background:sel?C.accentDim:C.card,backdropFilter:"blur(10px)",border:"1px solid "+(sel?C.accent:C.border),borderRadius:13,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.17s",gap:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:11,flex:1,minWidth:0 }}>
                <div style={{ width:20,height:20,borderRadius:6,border:"2px solid "+(sel?C.accent:C.muted2),background:sel?"linear-gradient(135deg,#00D4AA,#00956E)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.17s" }}>
                  {sel && <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>✓</span>}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:sel?C.accentText:C.text,lineHeight:1.3,marginBottom:2 }}>{t.name}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{t.category}</div>
                </div>
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:sel?C.accentText:C.gold,flexShrink:0 }}>₹{t.price}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      {selectedTests.length > 0 && (
        <div style={{ position:"sticky",bottom:90,background:"rgba(8,10,14,0.94)",backdropFilter:"blur(16px)",border:"1px solid "+C.border,borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 -4px 24px rgba(0,0,0,0.5)" }}>
          <div>
            <div style={{ fontSize:12,color:C.muted }}>{selectedTests.length} test{selectedTests.length!==1?"s":""} selected</div>
            <div style={{ fontSize:16,fontWeight:800,color:C.gold }}>₹{total}</div>
          </div>
          <button onClick={() => setShowBookModal(true)}
            style={{ ...F,padding:"11px 22px",background:"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(0,212,170,0.3)" }}>
            Book Now →
          </button>
        </div>
      )}

      {showBookModal && (
        <BookTestModal
          selectedTests={selectedTests}
          allTests={tests}
          onClose={() => setShowBookModal(false)}
          onBooked={() => { setSelectedTests([]); }}
        />
      )}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function MedMatch() {
  const [screen, setScreen]         = useState("home");
  const [mode, setMode]             = useState("symptom");
  const [picked, setPicked]         = useState(null);
  const [symAnswers, setSymAnswers] = useState({});
  const [disease, setDisease]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [aiData, setAiData]         = useState(null);
  const [aiError, setAiError]       = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [emergency, setEmergency]   = useState(null);
  const resultRef = useRef(null);

  // Admin state
  const [adminAuthed, setAdminAuthed]   = useState(false);
  const [adminPass, setAdminPass]       = useState("");
  const [adminError, setAdminError]     = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminTab, setAdminTab]         = useState("depts"); // depts | tests | bookings
  const [editDept, setEditDept]         = useState(null);
  const [newDocName, setNewDocName]     = useState("");
  const [newSlots, setNewSlots]         = useState("");

  // Test management in admin
  const [newTestName, setNewTestName]     = useState("");
  const [newTestPrice, setNewTestPrice]   = useState("");
  const [newTestCat, setNewTestCat]       = useState("");
  const [newTestPopular, setNewTestPopular] = useState(false);
  const [editTestId, setEditTestId]       = useState(null);
  const [editTestData, setEditTestData]   = useState({});
  const [editDocIdx, setEditDocIdx]       = useState(null);
  const [editDocName, setEditDocName]     = useState("");

  const [depts,     setDepts]     = useState(DEFAULT_DEPTS);
  const [tests,     setTests]     = useState(DEFAULT_TESTS);
  const [bookings,  setBookings]  = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError,   setDbError]   = useState("");
  const dbRecord = useRef({ bookings: [], tests: DEFAULT_TESTS, depts: DEFAULT_DEPTS });

  // ── Boot: load everything from JSONbin once ──
  useEffect(() => {
    (async () => {
      try {
        const record = await dbInit(DEFAULT_TESTS, DEFAULT_DEPTS);
        dbRecord.current = record;
        if (record.bookings) setBookings(record.bookings);
        if (record.tests)    setTests(record.tests);
        if (record.depts)    setDepts(record.depts);
      } catch {
        setDbError("Cloud sync failed — running offline.");
      } finally {
        setDbLoading(false);
      }
    })();
  }, []);

  // ── Refresh bookings from cloud when admin opens bookings tab ──
  useEffect(() => {
    if (adminAuthed && adminTab === "bookings") {
      (async () => {
        try {
          const record = await dbGet();
          dbRecord.current = record;
          setBookings(record.bookings || []);
        } catch {}
      })();
    }
  }, [adminAuthed, adminTab]);

  const saveDepts = async d => {
    setDepts(d);
    try { const rec = { ...dbRecord.current, depts: d }; await dbSet(rec); dbRecord.current = rec; } catch {}
  };
  const saveTests = async t => {
    setTests(t);
    try { const rec = { ...dbRecord.current, tests: t }; await dbSet(rec); dbRecord.current = rec; } catch {}
  };
  const resetPatient = () => { setPicked(null); setDisease(""); setAiData(null); setAiError(""); setSymAnswers({}); };
  const goHome = () => { setScreen("home"); resetPatient(); setEditDept(null); setAdminAuthed(false); setAdminPass(""); };

  const activeDepts = Object.values(depts).filter(d => d.available).length;
  const totalDocs   = Object.values(depts).reduce((a,d) => a + d.doctors.length, 0);
  const pickedDept  = picked ? depts[picked.dept] : null;

  async function analyzeDisease() {
    if (!disease.trim()) return;
    setLoading(true); setAiData(null); setAiError("");
    try {
      const parsed = await callGroq(
        `Patient condition: "${disease}". You are an honest medical advisor. Reply ONLY in valid JSON (no markdown):\n{"name":"clean condition name","dept_key":"one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology","specialist":"doctor type","needed":[{"test":"name","reason":"why"}],"skip":[{"test":"name","reason":"why hospitals push but not needed"}],"advice":"one honest patient tip","immediate_action":"1-2 sentence action right now","is_serious":false}`
      );
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(disease);
      setAiData({ ...parsed, dept: depts[key], deptKey: key });
      if (parsed.is_serious || isSerious(disease, parsed.name)) setEmergency(parsed.name || disease);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 120);
    } catch { setAiError("Analysis failed. Please try again."); }
    setLoading(false);
  }

  function adminLogin() {
    if (adminPass === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); }
    else setAdminError("Incorrect password.");
  }
  function addDoctor(key) {
    if (!newDocName.trim()) return;
    saveDepts({ ...depts, [key]: { ...depts[key], doctors: [...depts[key].doctors, newDocName.trim()], available: true } });
    setNewDocName(""); flash("Doctor added.");
  }
  function removeDoctor(key, idx) {
    const doctors = depts[key].doctors.filter((_,i) => i!==idx);
    saveDepts({ ...depts, [key]: { ...depts[key], doctors, available: doctors.length>0 } });
  }
  function saveSlots(key) { saveDepts({ ...depts, [key]: { ...depts[key], slots: newSlots } }); flash("Slots updated."); }
  function toggleAvail(key) { saveDepts({ ...depts, [key]: { ...depts[key], available: !depts[key].available } }); }
  function flash(msg) { setAdminSuccess(msg); setTimeout(() => setAdminSuccess(""), 2500); }

  function addTest() {
    if (!newTestName.trim() || !newTestPrice.trim()) { flash("⚠ Name and price required."); return; }
    const newT = {
      id: "t" + Date.now(),
      name: newTestName.trim(),
      price: parseInt(newTestPrice) || 0,
      category: newTestCat.trim() || "Other",
      popular: newTestPopular,
    };
    saveTests([...tests, newT]);
    setNewTestName(""); setNewTestPrice(""); setNewTestCat(""); setNewTestPopular(false);
    flash("Test added.");
  }

  function removeTest(id) {
    saveTests(tests.filter(t => t.id !== id));
    if (editTestId === id) { setEditTestId(null); setEditTestData({}); }
    flash("Test removed.");
  }

  function startEditTest(t) {
    setEditTestId(t.id);
    setEditTestData({ name: t.name, price: String(t.price), category: t.category, popular: t.popular });
  }

  function saveEditTest(id) {
    if (!editTestData.name?.trim() || !editTestData.price?.trim()) { flash("⚠ Name and price required."); return; }
    saveTests(tests.map(t => t.id === id ? { ...t, name: editTestData.name.trim(), price: parseInt(editTestData.price)||0, category: editTestData.category?.trim()||"Other", popular: !!editTestData.popular } : t));
    setEditTestId(null); setEditTestData({});
    flash("Test updated.");
  }

  function startEditDoctor(key, idx) {
    setEditDocIdx({ key, idx });
    setEditDocName(depts[key].doctors[idx]);
  }

  function saveEditDoctor() {
    if (!editDocName.trim() || !editDocIdx) return;
    const { key, idx } = editDocIdx;
    const doctors = depts[key].doctors.map((d,i) => i===idx ? editDocName.trim() : d);
    saveDepts({ ...depts, [key]: { ...depts[key], doctors } });
    setEditDocIdx(null); setEditDocName("");
    flash("Doctor updated.");
  }

  function updateBookingStatus(id, status) {
    (async () => {
      try {
        const record = await dbGet();
        const updated = (record.bookings || []).map(b => b.id === id ? { ...b, status } : b);
        const rec = { ...record, bookings: updated };
        await dbSet(rec);
        dbRecord.current = rec;
        setBookings(updated);
        flash("Status updated.");
      } catch { flash("⚠ Cloud sync failed."); }
    })();
  }

  function deleteBooking(id) {
    (async () => {
      try {
        const record = await dbGet();
        const updated = (record.bookings || []).filter(b => b.id !== id);
        const rec = { ...record, bookings: updated };
        await dbSet(rec);
        dbRecord.current = rec;
        setBookings(updated);
        flash("Booking deleted.");
      } catch { flash("⚠ Cloud sync failed."); }
    })();
  }

  return (
    <div style={{ ...F, minHeight:"100vh", color:C.text, position:"relative" }}>
      <AnimatedBG />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#080A0E;}::-webkit-scrollbar-thumb{background:#1E2533;border-radius:4px;}
        textarea:focus,input:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px ${C.accentDim}!important;}
        .sym-card:hover{border-color:${C.accent}!important;background:${C.accentDim}!important;transform:translateY(-1px);}
        .home-card:hover{border-color:rgba(0,212,170,0.4)!important;transform:translateY(-3px);box-shadow:0 14px 42px rgba(0,212,170,0.09)!important;}
        .dept-card:hover{border-color:${C.borderHov}!important;}
        .admin-row:hover{background:rgba(13,18,30,0.45)!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.32s ease forwards;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes emergPulse{from{background:rgba(150,0,0,0.95);}to{background:rgba(200,0,0,1);}}
        @keyframes emergBounce{from{transform:scale(1);}to{transform:scale(1.1);}}
        .answer-pill{cursor:pointer;transition:all 0.13s;}.answer-pill:hover{transform:translateY(-1px);}
        .admin-corner{position:fixed;bottom:22px;right:22px;z-index:100;}
        .admin-corner-btn{width:44px;height:44px;border-radius:50%;background:rgba(19,23,32,0.9);border:1px solid #2E3A4F;color:${C.gold};font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,0.45);transition:all 0.2s;backdrop-filter:blur(12px);font-family:'DM Sans',system-ui,sans-serif;}
        .admin-corner-btn:hover{background:rgba(255,184,0,0.1);border-color:rgba(255,184,0,0.5);transform:scale(1.08);}
        .test-row:hover{border-color:${C.borderHov}!important;}
        .booking-card:hover{border-color:${C.borderHov}!important;}
      `}</style>

      {emergency && <EmergencyOverlay name={emergency} onClose={() => setEmergency(null)} />}

      {/* DB loading splash */}
      {dbLoading && (
        <div style={{ position:"fixed",inset:0,zIndex:9000,background:"rgba(8,10,14,0.92)",backdropFilter:"blur(12px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16 }}>
          <div style={{ width:42,height:42,border:"3px solid "+C.border,borderTopColor:C.accentText,borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
          <div style={{ fontSize:14,color:C.muted }}>Connecting to cloud…</div>
        </div>
      )}

      {/* DB error banner */}
      {dbError && !dbLoading && (
        <div style={{ position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:8000,background:"rgba(255,92,108,0.12)",border:"1px solid rgba(255,92,108,0.4)",borderRadius:10,padding:"9px 18px",fontSize:12,color:C.red,maxWidth:360,textAlign:"center",backdropFilter:"blur(10px)" }}>
          ⚠ {dbError}
        </div>
      )}

      {/* NAV */}
      <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 24px",borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:50,backdropFilter:"blur(22px)",background:"rgba(8,10,14,0.86)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#00D4AA,#008F72)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 13px rgba(0,212,170,0.35)" }}>+</div>
          <span style={{ fontSize:15,fontWeight:700,letterSpacing:"-0.3px" }}>MedMatch</span>
          <span style={{ fontSize:10,padding:"2px 7px",borderRadius:100,background:C.accentDim,color:C.accentText,border:"1px solid "+C.accent+"28",fontWeight:600,letterSpacing:"0.06em" }}>AI</span>
        </div>
        {screen !== "home" && (
          <button onClick={goHome} style={{ ...F,fontSize:13,color:C.muted,cursor:"pointer",background:"none",border:"none",padding:"6px 10px",borderRadius:8,transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.text} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
            ← Home
          </button>
        )}
      </nav>

      {/* ── LOCATION NOTICE BANNER ── */}
      <div style={{ background:"linear-gradient(90deg,rgba(255,184,0,0.08),rgba(255,184,0,0.04))",borderBottom:"1px solid rgba(255,184,0,0.18)",padding:"9px 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:9,textAlign:"center",flexWrap:"wrap" }}>
        <span style={{ fontSize:14 }}>📍</span>
        <span style={{ fontSize:12,color:"#FFB800",fontWeight:600 }}>Currently serving Hajipur, Bihar only.</span>
        <span style={{ fontSize:12,color:"rgba(255,184,0,0.6)" }}>More cities coming soon — we're expanding fast.</span>
      </div>

      {/* ══ HOME ══ */}
      {screen === "home" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:440,margin:"0 auto",padding:"70px 22px 80px" }} className="fade-up">
          <div style={{ textAlign:"center",marginBottom:50 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 13px",borderRadius:100,background:C.accentDim,border:"1px solid rgba(0,212,170,0.2)",marginBottom:20 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:C.accentText,boxShadow:"0 0 7px "+C.accentText,display:"inline-block" }} />
              <span style={{ fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:C.accentText }}>AI-Powered Medical Intelligence</span>
            </div>
            <h1 style={{ fontSize:32,fontWeight:800,letterSpacing:"-1.3px",lineHeight:1.14,marginBottom:14,color:C.text }}>
              Know exactly<br />
              <span style={{ background:"linear-gradient(90deg,#00D4AA,#4DA6FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>what you need.</span>
            </h1>
            <p style={{ fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:290,margin:"0 auto" }}>
              Right tests. Right doctor. No unnecessary costs or confusion.
            </p>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:16 }}>
            {[
              { label:"I'm a Patient", sub:"Find tests & right specialist", onClick:()=>setScreen("patient"), emoji:"🩺", clr:"rgba(0,212,170,0.12)", bdr:"rgba(0,212,170,0.22)" },
              { label:"Hospitals",     sub:"Dept. availability & doctors",  onClick:()=>setScreen("hospital"), emoji:"🏥", clr:"rgba(139,139,255,0.12)", bdr:"rgba(139,139,255,0.22)" },
            ].map((c,i) => (
              <div key={i} className="home-card" onClick={c.onClick} style={{ background:C.card,backdropFilter:"blur(18px)",border:`1px solid ${c.bdr}`,borderRadius:20,padding:"24px 16px 22px",cursor:"pointer",textAlign:"center",transition:"all 0.22s" }}>
                <div style={{ width:56,height:56,borderRadius:"50%",background:c.clr,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px",fontSize:24 }}>{c.emoji}</div>
                <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:4 }}>{c.label}</div>
                <div style={{ fontSize:12,color:C.muted,lineHeight:1.45 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:"13px 18px",background:C.card,backdropFilter:"blur(18px)",border:"1px solid "+C.border,borderRadius:14,display:"flex",justifyContent:"space-around",textAlign:"center" }}>
            {[["10",C.accentText,"Depts"],["Tests",C.purple,"Book Online"],["24/7",C.blue,"Available"]].map(([n,clr,l],i) => (
              <div key={i}><div style={{ fontSize:15,fontWeight:700,color:clr }}>{n}</div><div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PATIENT ══ */}
      {screen === "patient" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"34px 22px 100px" }} className="fade-up">
          <h2 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.5px",marginBottom:5 }}>Your Health Check</h2>
          <p style={{ fontSize:13,color:C.muted,marginBottom:20 }}>Choose how to get diagnosed</p>

          {/* Mode tabs */}
          <div style={{ display:"flex",gap:8,marginBottom:26,overflowX:"auto",paddingBottom:2 }}>
            {[["symptom","⚕","Symptoms"],["disease","📝","Condition"],["tests","🧪","Book Tests"]].map(([v,ico,lbl]) => (
              <button key={v} onClick={() => { setMode(v); resetPatient(); }} style={{ ...F,flexShrink:0,padding:"9px 15px",borderRadius:11,border:"1px solid "+(mode===v?C.accent+"55":C.border),cursor:"pointer",fontSize:13,fontWeight:mode===v?600:400,background:mode===v?C.accentDim:"rgba(13,18,30,0.6)",color:mode===v?C.accentText:C.muted,backdropFilter:"blur(10px)",transition:"all 0.17s",display:"flex",alignItems:"center",gap:6 }}>
                {ico} {lbl}
              </button>
            ))}
          </div>

          {/* SYMPTOMS */}
          {mode === "symptom" && (
            <>
              <p style={{ fontSize:13,color:C.muted,marginBottom:13 }}>Tap what's bothering you</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {SYMPTOMS.map(s => (
                  <div key={s.id} className={picked?.id===s.id?"":"sym-card"}
                    onClick={() => { setPicked(s); setSymAnswers({}); setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100); }}
                    style={{ background:picked?.id===s.id?C.accentDim:C.card,backdropFilter:"blur(10px)",border:"1px solid "+(picked?.id===s.id?C.accent:C.border),borderRadius:13,padding:"13px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.17s" }}>
                    <span style={{ fontSize:19,flexShrink:0 }}>{s.icon}</span>
                    <span style={{ fontSize:13,fontWeight:500,color:picked?.id===s.id?C.accentText:C.text,lineHeight:1.35 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:22 }}>
                  <div style={{ background:C.card,backdropFilter:"blur(18px)",border:"1px solid "+C.border,borderRadius:17,padding:"18px 20px",marginBottom:13 }}>
                    <SecLabel color={C.accentText}>Tell us more</SecLabel>
                    {picked.followUps.map((fq,qi) => (
                      <div key={qi} style={{ marginBottom:15 }}>
                        <div style={{ fontSize:13,fontWeight:500,color:C.text,marginBottom:8 }}>{fq.q}</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                          {fq.opts.map((opt,oi) => {
                            const ch = symAnswers[qi]===oi;
                            return (
                              <button key={oi} className="answer-pill" onClick={() => setSymAnswers(p=>({...p,[qi]:oi}))}
                                style={{ ...F,padding:"6px 12px",borderRadius:100,background:ch?C.accentDim:"rgba(13,18,30,0.65)",border:"1px solid "+(ch?C.accent:C.border),color:ch?C.accentText:C.muted,fontSize:12,fontWeight:ch?600:400,cursor:"pointer" }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {picked.action && <ActionBox text={picked.action} />}

                  <div style={{ background:C.card,backdropFilter:"blur(18px)",border:"1px solid "+C.border,borderRadius:17,overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:15,fontWeight:700 }}>{pickedDept.label}</div>
                      </div>
                      <AvailBadge ok={pickedDept.available} />
                    </div>
                    <div style={{ padding:"16px 20px" }}>
                      <SecLabel>Recommended Tests</SecLabel>
                      {picked.tests.map((t,i) => (
                        <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:i<picked.tests.length-1?"1px solid "+C.border:"none" }}>
                          <div style={{ width:5,height:5,borderRadius:"50%",background:C.accentText,flexShrink:0 }} />
                          <span style={{ fontSize:14,color:C.text }}>{t}</span>
                        </div>
                      ))}
                      <Divider />
                      <SecLabel>Doctor</SecLabel>
                      <DoctorList dept={pickedDept} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CONDITION */}
          {mode === "disease" && (
            <>
              <div style={{ padding:"11px 14px",background:C.blueDim,border:"1px solid "+C.blue+"28",borderRadius:11,marginBottom:13,fontSize:13,color:C.blue,lineHeight:1.6 }}>
                💡 Describe your condition. Include location, duration &amp; severity for better results.
              </div>
              <textarea value={disease} onChange={e=>setDisease(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();analyzeDisease();}}}
                placeholder={"e.g. Chest pain for 2 hours, spreading to left arm...\nor: Type 2 diabetes checkup, HbA1c 8.2, on Metformin..."}
                style={{ ...F,width:"100%",padding:"13px 15px",background:"rgba(13,18,30,0.8)",backdropFilter:"blur(10px)",border:"1px solid "+C.border,borderRadius:13,fontSize:14,color:C.text,resize:"none",minHeight:110,lineHeight:1.65,transition:"border-color 0.18s" }}
              />
              <button onClick={analyzeDisease} disabled={loading||!disease.trim()}
                style={{ ...F,width:"100%",padding:"13px",marginTop:10,background:loading||!disease.trim()?"#2A3042":"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:12,color:loading||!disease.trim()?C.muted:"#fff",fontSize:14,fontWeight:600,cursor:loading||!disease.trim()?"not-allowed":"pointer",transition:"all 0.18s" }}>
                {loading ? <span><span style={{ display:"inline-block",animation:"spin 0.7s linear infinite" }}>◌</span> &nbsp;Analyzing…</span> : "Analyze & see what you need →"}
              </button>
              <div style={{ marginTop:9,padding:"9px 13px",background:"rgba(120,53,15,0.18)",border:"1px solid rgba(146,64,14,0.38)",borderRadius:9,fontSize:12,color:"#D97706",lineHeight:1.6 }}>
                If a hospital recommends extra tests not listed, ask your doctor to justify each one.
              </div>
              {aiError && <div style={{ marginTop:9,padding:"11px 14px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:9,fontSize:13,color:C.red }}>{aiError}</div>}

              {aiData && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:22 }}>
                  {aiData.immediate_action && <ActionBox text={aiData.immediate_action} />}
                  <div style={{ background:C.card,backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:17,overflow:"hidden" }}>
                    <div style={{ padding:"18px 22px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                      <div>
                        <div style={{ fontSize:16,fontWeight:700,marginBottom:3 }}>{aiData.name}</div>
                        <div style={{ fontSize:12,color:C.muted }}>Specialist: {aiData.specialist}</div>
                      </div>
                      <AvailBadge ok={aiData.dept?.available} />
                    </div>
                    <div style={{ padding:"18px 22px" }}>
                      <SecLabel>Tests you need</SecLabel>
                      {aiData.needed?.map((t,i) => (
                        <div key={i} style={{ padding:"11px 13px",background:C.accentDim,border:"1px solid "+C.accent+"28",borderRadius:10,marginBottom:7 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:C.accentText,marginBottom:3 }}>{t.test}</div>
                          <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{t.reason}</div>
                        </div>
                      ))}
                      {aiData.skip?.length > 0 && (
                        <>
                          <Divider />
                          <SecLabel>Question or skip</SecLabel>
                          {aiData.skip.map((t,i) => (
                            <div key={i} style={{ padding:"11px 13px",background:C.redDim,border:"1px solid "+C.red+"28",borderRadius:10,marginBottom:7 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:C.red,marginBottom:3 }}>✕ {t.test}</div>
                              <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{t.reason}</div>
                            </div>
                          ))}
                        </>
                      )}
                      <Divider />
                      <SecLabel>Department</SecLabel>
                      <DoctorList dept={aiData.dept} />
                      {aiData.advice && (
                        <>
                          <Divider />
                          <div style={{ padding:"13px 15px",background:C.blueDim,border:"1px solid "+C.blue+"35",borderRadius:10,fontSize:13,color:"#93C5FD",lineHeight:1.65 }}>
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

          {/* BOOK TESTS */}
          {mode === "tests" && <TestsSection tests={tests} />}
        </div>
      )}

      {/* ══ HOSPITAL ══ */}
      {screen === "hospital" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"34px 22px 100px" }} className="fade-up">
          <h2 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.5px",marginBottom:4 }}>Hospitals</h2>
          <p style={{ fontSize:13,color:C.muted,marginBottom:20 }}>Live department availability</p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20 }}>
            {[{n:activeDepts,l:"Active",c:C.accentText},{n:Object.keys(depts).length-activeDepts,l:"Unavailable",c:C.red},{n:totalDocs,l:"Doctors",c:C.purple}].map((s,i) => (
              <div key={i} style={{ background:C.card,backdropFilter:"blur(14px)",border:"1px solid "+C.border,borderRadius:13,padding:"13px 10px",textAlign:"center" }}>
                <div style={{ fontSize:22,fontWeight:700,color:s.c,letterSpacing:"-0.8px",lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {Object.entries(depts).map(([key,d]) => {
              const open = expandedDept===key;
              return (
                <div key={key} className={d.available?"dept-card":""} onClick={()=>d.available&&setExpandedDept(open?null:key)}
                  style={{ background:C.card,backdropFilter:"blur(10px)",border:"1px solid "+C.border,borderRadius:13,padding:"14px",cursor:d.available?"pointer":"default",transition:"all 0.17s" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7 }}>
                    <span style={{ fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3 }}>{d.label}</span>
                    <span style={{ width:7,height:7,borderRadius:"50%",background:d.available?C.accentText:C.red,display:"inline-block",marginTop:3,flexShrink:0,boxShadow:d.available?"0 0 6px "+C.accentText+"80":"none" }} />
                  </div>
                  <div style={{ fontSize:11,color:d.available?C.accentText:C.red,fontWeight:500,marginBottom:open?9:0 }}>
                    {d.available?(d.doctors.length>0?`${d.doctors.length} doctor${d.doctors.length!==1?"s":""}`:"Coming soon"):"Unavailable"}
                  </div>
                  {d.available&&open&&(
                    <div style={{ borderTop:"1px solid "+C.border,paddingTop:9 }}>
                      {d.doctors.length>0?d.doctors.map((doc,i)=>(
                        <div key={i} style={{ fontSize:11,color:C.muted,marginBottom:3,display:"flex",alignItems:"center",gap:5 }}><span style={{ color:C.muted2 }}>–</span>{doc}</div>
                      )):<div style={{ fontSize:11,color:C.purple }}>🕐 Doctor info coming soon</div>}
                      {d.slots&&<div style={{ fontSize:11,color:C.accentText,marginTop:7 }}>⏰ {d.slots}</div>}
                    </div>
                  )}
                  {d.available&&<div style={{ fontSize:10,color:C.muted2,marginTop:7 }}>{open?"↑ less":"↓ details"}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ADMIN ══ */}
      {screen === "admin" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"34px 22px 100px" }} className="fade-up">
          {!adminAuthed ? (
            <>
              <h2 style={{ fontSize:21,fontWeight:700,marginBottom:5 }}>Admin Panel</h2>
              <p style={{ fontSize:13,color:C.muted,marginBottom:24 }}>Enter password to continue</p>
              <div style={{ background:C.card,backdropFilter:"blur(18px)",border:"1px solid "+C.border,borderRadius:16,padding:"26px 22px" }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:9 }}>Password</div>
                <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()} placeholder="Enter admin password"
                  style={{ ...F,width:"100%",padding:"12px 14px",background:"rgba(13,18,30,0.7)",border:"1px solid "+C.border,borderRadius:11,fontSize:14,color:C.text }} />
                {adminError&&<div style={{ marginTop:9,fontSize:13,color:C.red }}>{adminError}</div>}
                <button onClick={adminLogin} style={{ ...F,width:"100%",padding:"13px",marginTop:13,background:"linear-gradient(135deg,#FFB800,#E09000)",border:"none",borderRadius:11,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                  Login →
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Admin header */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                <h2 style={{ fontSize:21,fontWeight:700 }}>Admin Panel</h2>
                <button onClick={()=>{setAdminAuthed(false);setAdminPass("");setEditDept(null);}}
                  style={{ ...F,fontSize:12,color:C.red,background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:7,padding:"5px 11px",cursor:"pointer" }}>Logout</button>
              </div>
              <p style={{ fontSize:13,color:C.muted,marginBottom:16 }}>Full control over MedMatch</p>
              {adminSuccess&&<div style={{ marginBottom:13,padding:"11px 15px",background:C.accentDim,border:"1px solid "+C.accent+"40",borderRadius:9,fontSize:13,color:C.accentText }}>✓ {adminSuccess}</div>}

              {/* Admin tabs */}
              <div style={{ display:"flex",gap:7,marginBottom:22,borderBottom:"1px solid "+C.border,paddingBottom:0 }}>
                {[["depts","🏥","Departments"],["tests","🧪","Tests"],["bookings","📋","Bookings"]].map(([tab,ico,lbl]) => (
                  <button key={tab} onClick={()=>setAdminTab(tab)}
                    style={{ ...F,padding:"9px 16px",borderRadius:"10px 10px 0 0",border:"1px solid "+(adminTab===tab?C.border:"transparent"),borderBottom:adminTab===tab?"1px solid #0D1018":"1px solid transparent",fontSize:13,fontWeight:adminTab===tab?700:400,background:adminTab===tab?"#0D1018":"transparent",color:adminTab===tab?C.gold:C.muted,cursor:"pointer",transition:"all 0.15s",marginBottom:-1 }}>
                    {ico} {lbl} {tab==="bookings"&&bookings.length>0&&<span style={{ marginLeft:4,padding:"1px 6px",borderRadius:100,background:C.red,color:"#fff",fontSize:10,fontWeight:700 }}>{bookings.length}</span>}
                  </button>
                ))}
              </div>

              {/* ── DEPARTMENTS TAB ── */}
              {adminTab === "depts" && (
                <>
                  {Object.entries(depts).map(([key,d]) => {
                    const isEd = editDept===key;
                    return (
                      <div key={key} style={{ background:C.card,backdropFilter:"blur(14px)",border:"1px solid "+(isEd?"rgba(255,184,0,0.35)":C.border),borderRadius:14,marginBottom:9,overflow:"hidden",transition:"border-color 0.2s" }}>
                        <div className="admin-row" style={{ padding:"14px 17px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"background 0.14s" }}
                          onClick={()=>{ setEditDept(isEd?null:key); setNewDocName(""); setNewSlots(d.slots||""); }}>
                          <div style={{ display:"flex",alignItems:"center",gap:11 }}>
                            <span style={{ width:7,height:7,borderRadius:"50%",background:d.available?C.accentText:C.red,display:"inline-block",boxShadow:d.available?"0 0 6px "+C.accentText+"80":"none" }} />
                            <span style={{ fontSize:14,fontWeight:600,color:C.text }}>{d.label}</span>
                            <span style={{ fontSize:11,color:C.muted }}>{d.doctors.length} doctor{d.doctors.length!==1?"s":""}</span>
                          </div>
                          <span style={{ fontSize:17,color:C.muted2 }}>{isEd?"↑":"↓"}</span>
                        </div>
                        {isEd && (
                          <div style={{ borderTop:"1px solid "+C.border,padding:"18px 17px" }}>
                            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
                              <span style={{ fontSize:13,color:C.muted }}>Availability</span>
                              <button onClick={()=>toggleAvail(key)} style={{ ...F,padding:"6px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:d.available?C.redDim:C.accentDim,color:d.available?C.red:C.accentText }}>
                                {d.available?"Mark Unavailable":"Mark Available"}
                              </button>
                            </div>
                            {d.doctors.length>0&&(
                              <div style={{ marginBottom:16 }}>
                                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:9 }}>Current Doctors</div>
                                {d.doctors.map((doc,i)=>(
                                  <div key={i} style={{ marginBottom:5 }}>
                                    {editDocIdx?.key===key && editDocIdx?.idx===i ? (
                                      <div style={{ display:"flex",gap:7,alignItems:"center" }}>
                                        <input value={editDocName} onChange={e=>setEditDocName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEditDoctor()}
                                          style={{ ...F,flex:1,padding:"8px 12px",background:"rgba(13,18,30,0.7)",border:"1px solid "+C.gold+"50",borderRadius:9,fontSize:13,color:C.text }} autoFocus />
                                        <button onClick={saveEditDoctor} style={{ ...F,padding:"8px 13px",background:"linear-gradient(135deg,#FFB800,#E09000)",border:"none",borderRadius:8,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer" }}>Save</button>
                                        <button onClick={()=>setEditDocIdx(null)} style={{ ...F,padding:"8px 11px",background:"none",border:"1px solid "+C.border,borderRadius:8,color:C.muted,fontSize:12,cursor:"pointer" }}>✕</button>
                                      </div>
                                    ) : (
                                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",background:"rgba(13,18,30,0.5)",borderRadius:9,border:"1px solid "+C.border }}>
                                        <div style={{ display:"flex",alignItems:"center",gap:9,fontSize:13,color:C.text }}>👤 {doc}</div>
                                        <div style={{ display:"flex",gap:6 }}>
                                          <button onClick={()=>startEditDoctor(key,i)} style={{ ...F,background:"rgba(255,184,0,0.1)",border:"1px solid rgba(255,184,0,0.25)",color:C.gold,cursor:"pointer",fontSize:11,padding:"3px 9px",borderRadius:6,fontWeight:600 }}>Edit</button>
                                          <button onClick={()=>removeDoctor(key,i)} style={{ ...F,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,padding:"2px 5px",borderRadius:5 }}>×</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ marginBottom:16 }}>
                              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:9 }}>Add Doctor</div>
                              <div style={{ display:"flex",gap:8 }}>
                                <input value={newDocName} onChange={e=>setNewDocName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDoctor(key)} placeholder="Dr. Full Name"
                                  style={{ ...F,flex:1,padding:"10px 13px",background:"rgba(13,18,30,0.5)",border:"1px solid "+C.border,borderRadius:9,fontSize:13,color:C.text }} />
                                <button onClick={()=>addDoctor(key)} style={{ ...F,padding:"10px 16px",background:"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>+ Add</button>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:9 }}>Availability Slots</div>
                              <div style={{ display:"flex",gap:8 }}>
                                <input value={newSlots} onChange={e=>setNewSlots(e.target.value)} placeholder="e.g. Mon–Fri, 9AM–5PM"
                                  style={{ ...F,flex:1,padding:"10px 13px",background:"rgba(13,18,30,0.5)",border:"1px solid "+C.border,borderRadius:9,fontSize:13,color:C.text }} />
                                <button onClick={()=>saveSlots(key)} style={{ ...F,padding:"10px 16px",background:C.purpleDim,border:"1px solid "+C.purple+"40",borderRadius:9,color:C.purple,fontSize:13,fontWeight:600,cursor:"pointer" }}>Save</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── TESTS TAB ── */}
              {adminTab === "tests" && (
                <>
                  {/* Add new test form */}
                  <div style={{ background:C.card,border:"1px solid rgba(255,184,0,0.25)",borderRadius:14,padding:"18px 17px",marginBottom:16 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:C.gold,marginBottom:14 }}>➕ Add New Test</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9 }}>
                      <div>
                        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Test Name</div>
                        <input value={newTestName} onChange={e=>setNewTestName(e.target.value)} placeholder="e.g. CBC"
                          style={{ ...F,width:"100%",padding:"9px 12px",background:"rgba(13,18,30,0.7)",border:"1px solid "+C.border,borderRadius:9,fontSize:13,color:C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Price (₹)</div>
                        <input value={newTestPrice} onChange={e=>setNewTestPrice(e.target.value.replace(/\D/g,""))} placeholder="e.g. 350" type="text"
                          style={{ ...F,width:"100%",padding:"9px 12px",background:"rgba(13,18,30,0.7)",border:"1px solid "+C.border,borderRadius:9,fontSize:13,color:C.text }} />
                      </div>
                    </div>
                    <div style={{ marginBottom:11 }}>
                      <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Category</div>
                      <input value={newTestCat} onChange={e=>setNewTestCat(e.target.value)} placeholder="e.g. Blood Tests, Radiology, Cardiac…"
                        style={{ ...F,width:"100%",padding:"9px 12px",background:"rgba(13,18,30,0.7)",border:"1px solid "+C.border,borderRadius:9,fontSize:13,color:C.text }} />
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:13,cursor:"pointer" }} onClick={()=>setNewTestPopular(p=>!p)}>
                      <div style={{ width:18,height:18,borderRadius:5,border:"2px solid "+(newTestPopular?C.gold:C.muted2),background:newTestPopular?"linear-gradient(135deg,#FFB800,#E09000)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",flexShrink:0 }}>
                        {newTestPopular&&<span style={{ color:"#000",fontSize:11,fontWeight:700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:13,color:newTestPopular?C.gold:C.muted }}>Mark as Popular</span>
                    </div>
                    <button onClick={addTest} style={{ ...F,width:"100%",padding:"11px",background:"linear-gradient(135deg,#FFB800,#E09000)",border:"none",borderRadius:10,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                      Add Test
                    </button>
                  </div>

                  {/* Existing tests list */}
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:11 }}>
                    All Tests ({tests.length})
                  </div>
                  {tests.map(t => (
                    <div key={t.id} className="test-row" style={{ background:C.card,border:"1px solid "+(editTestId===t.id?"rgba(255,184,0,0.35)":C.border),borderRadius:11,padding:"12px 15px",marginBottom:7,transition:"border-color 0.15s" }}>
                      {editTestId === t.id ? (
                        <div>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                            <div>
                              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:5 }}>Test Name</div>
                              <input value={editTestData.name||""} onChange={e=>setEditTestData(p=>({...p,name:e.target.value}))}
                                style={{ ...F,width:"100%",padding:"8px 11px",background:"rgba(13,18,30,0.8)",border:"1px solid "+C.gold+"40",borderRadius:8,fontSize:13,color:C.text }} autoFocus />
                            </div>
                            <div>
                              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:5 }}>Price (₹)</div>
                              <input value={editTestData.price||""} onChange={e=>setEditTestData(p=>({...p,price:e.target.value.replace(/\D/g,"")}))}
                                style={{ ...F,width:"100%",padding:"8px 11px",background:"rgba(13,18,30,0.8)",border:"1px solid "+C.gold+"40",borderRadius:8,fontSize:13,color:C.text }} />
                            </div>
                          </div>
                          <div style={{ marginBottom:8 }}>
                            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:5 }}>Category</div>
                            <input value={editTestData.category||""} onChange={e=>setEditTestData(p=>({...p,category:e.target.value}))}
                              style={{ ...F,width:"100%",padding:"8px 11px",background:"rgba(13,18,30,0.8)",border:"1px solid "+C.gold+"40",borderRadius:8,fontSize:13,color:C.text }} />
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:11,cursor:"pointer" }} onClick={()=>setEditTestData(p=>({...p,popular:!p.popular}))}>
                            <div style={{ width:16,height:16,borderRadius:4,border:"2px solid "+(editTestData.popular?C.gold:C.muted2),background:editTestData.popular?"linear-gradient(135deg,#FFB800,#E09000)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                              {editTestData.popular&&<span style={{ color:"#000",fontSize:10,fontWeight:700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize:12,color:editTestData.popular?C.gold:C.muted }}>Popular</span>
                          </div>
                          <div style={{ display:"flex",gap:8 }}>
                            <button onClick={()=>saveEditTest(t.id)} style={{ ...F,flex:1,padding:"9px",background:"linear-gradient(135deg,#FFB800,#E09000)",border:"none",borderRadius:8,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>Save Changes</button>
                            <button onClick={()=>{setEditTestId(null);setEditTestData({});}} style={{ ...F,padding:"9px 14px",background:"none",border:"1px solid "+C.border,borderRadius:8,color:C.muted,fontSize:13,cursor:"pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3 }}>
                              <span style={{ fontSize:13,fontWeight:600,color:C.text }}>{t.name}</span>
                              {t.popular && <span style={{ fontSize:10,padding:"1px 6px",borderRadius:100,background:C.goldDim,color:C.gold,border:"1px solid "+C.gold+"30",fontWeight:600 }}>Popular</span>}
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:9,fontSize:11,color:C.muted }}>
                              <span>{t.category}</span>
                              <span style={{ color:C.accentText,fontWeight:600 }}>₹{t.price}</span>
                            </div>
                          </div>
                          <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                            <button onClick={()=>startEditTest(t)} style={{ ...F,background:"rgba(255,184,0,0.1)",border:"1px solid rgba(255,184,0,0.25)",color:C.gold,borderRadius:7,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:600 }}>Edit</button>
                            <button onClick={()=>removeTest(t.id)} style={{ ...F,background:C.redDim,border:"1px solid "+C.red+"30",color:C.red,borderRadius:7,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:600 }}>Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* ── BOOKINGS TAB ── */}
              {adminTab === "bookings" && (
                <>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13 }}>
                    <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted }}>
                      Total Bookings: {bookings.length}
                    </div>
                    <button onClick={()=>{ (async()=>{ try{ const r=await dbGet(); setBookings(r.bookings||[]); flash("Refreshed!"); }catch{} })(); }}
                      style={{ ...F,fontSize:12,color:C.blue,background:C.blueDim,border:"1px solid "+C.blue+"30",borderRadius:7,padding:"5px 11px",cursor:"pointer" }}>⟳ Refresh</button>
                  </div>

                  {bookings.length === 0 ? (
                    <div style={{ textAlign:"center",padding:"40px 20px",background:C.card,border:"1px solid "+C.border,borderRadius:14 }}>
                      <div style={{ fontSize:36,marginBottom:10 }}>📭</div>
                      <div style={{ fontSize:14,color:C.muted }}>No bookings yet</div>
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="booking-card" style={{ background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"16px",marginBottom:10,transition:"border-color 0.15s" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                          <div>
                            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:2 }}>{b.name}</div>
                            <div style={{ fontSize:12,color:C.muted }}>📞 +91 {b.phone}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>{b.id}</div>
                            <span style={{ fontSize:11,padding:"3px 9px",borderRadius:100,fontWeight:600,
                              background: b.status==="Confirmed"?C.accentDim : b.status==="Completed"?C.purpleDim : b.status==="Cancelled"?C.redDim : C.goldDim,
                              color: b.status==="Confirmed"?C.accentText : b.status==="Completed"?C.purple : b.status==="Cancelled"?C.red : C.gold,
                              border: "1px solid "+(b.status==="Confirmed"?C.accent : b.status==="Completed"?C.purple : b.status==="Cancelled"?C.red : C.gold)+"30"
                            }}>{b.status}</span>
                          </div>
                        </div>
                        {/* Tests */}
                        <div style={{ background:"rgba(13,18,30,0.6)",border:"1px solid "+C.border,borderRadius:9,padding:"10px 12px",marginBottom:10 }}>
                          {b.tests.map((t,i) => (
                            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<b.tests.length-1?"1px solid "+C.muted2:"none" }}>
                              <span style={{ fontSize:12,color:C.text }}>{t.name}</span>
                              <span style={{ fontSize:12,color:C.accentText,fontWeight:600 }}>₹{t.price}</span>
                            </div>
                          ))}
                          <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border }}>
                            <span style={{ fontSize:12,fontWeight:700,color:C.text }}>Total</span>
                            <span style={{ fontSize:13,fontWeight:800,color:C.gold }}>₹{b.total}</span>
                          </div>
                        </div>
                        <div style={{ fontSize:11,color:C.muted,marginBottom:11 }}>🕐 {b.bookedAt}</div>
                        {/* Status controls */}
                        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                          {["Pending","Confirmed","Completed","Cancelled"].map(s => (
                            <button key={s} onClick={()=>updateBookingStatus(b.id,s)}
                              style={{ ...F,padding:"5px 11px",borderRadius:7,border:"1px solid "+C.border,fontSize:11,fontWeight:b.status===s?700:400,background:b.status===s?"rgba(255,184,0,0.12)":"rgba(13,18,30,0.5)",color:b.status===s?C.gold:C.muted,cursor:"pointer",transition:"all 0.13s" }}>
                              {s}
                            </button>
                          ))}
                          <button onClick={()=>deleteBooking(b.id)}
                            style={{ ...F,marginLeft:"auto",padding:"5px 11px",borderRadius:7,border:"1px solid "+C.red+"30",fontSize:11,fontWeight:600,background:C.redDim,color:C.red,cursor:"pointer" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {screen !== "admin" && (
        <div className="admin-corner">
          <button className="admin-corner-btn" onClick={()=>setScreen("admin")} title="Admin Panel">⚙</button>
        </div>
      )}
    </div>
  );
}
