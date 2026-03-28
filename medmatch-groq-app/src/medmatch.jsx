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
  return data.record;
}

async function dbSet(record) {
  const r = await fetch(BIN_URL, { method: "PUT", headers: BIN_HEADS, body: JSON.stringify(record) });
  if (!r.ok) throw new Error("dbSet failed: " + r.status);
  return r.json();
}

async function dbInit(defaultTests, defaultDepts) {
  try {
    const record = await dbGet();
    if (!record || (!record.bookings && !record.tests && !record.depts)) {
      await dbSet({ bookings: [], tests: defaultTests, depts: defaultDepts });
      return { bookings: [], tests: defaultTests, depts: defaultDepts };
    }
    return record;
  } catch {
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

const DEFAULT_TESTS = [
  { id: "t1",  name: "Complete Blood Count (CBC)",    price: 250,  category: "Blood Tests",    popular: true  },
  { id: "t2",  name: "Blood Sugar Fasting",           price: 80,   category: "Blood Tests",    popular: true  },
  { id: "t3",  name: "HbA1c",                        price: 350,  category: "Blood Tests",    popular: true  },
  { id: "t4",  name: "Lipid Profile",                price: 400,  category: "Blood Tests",    popular: true  },
  { id: "t5",  name: "Thyroid Profile (TSH/T3/T4)",  price: 500,  category: "Thyroid",        popular: true  },
  { id: "t6",  name: "Liver Function Test (LFT)",    price: 450,  category: "Organ Function", popular: true  },
  { id: "t7",  name: "Kidney Function Test (KFT)",   price: 420,  category: "Organ Function", popular: true  },
  { id: "t8",  name: "Serum Creatinine",             price: 150,  category: "Organ Function", popular: false },
  { id: "t9",  name: "ECG",                          price: 200,  category: "Cardiac",        popular: true  },
  { id: "t10", name: "Echocardiogram",               price: 1200, category: "Cardiac",        popular: false },
  { id: "t11", name: "Chest X-Ray",                  price: 300,  category: "Radiology",      popular: true  },
  { id: "t12", name: "Ultrasound Abdomen",           price: 800,  category: "Radiology",      popular: true  },
  { id: "t13", name: "MRI Brain",                    price: 4500, category: "Radiology",      popular: false },
  { id: "t14", name: "CT Scan",                      price: 3000, category: "Radiology",      popular: false },
  { id: "t15", name: "Urine Routine",                price: 120,  category: "Urine Tests",    popular: true  },
  { id: "t16", name: "Vitamin D3",                   price: 600,  category: "Vitamins",       popular: true  },
  { id: "t17", name: "Vitamin B12",                  price: 500,  category: "Vitamins",       popular: true  },
  { id: "t18", name: "CRP (C-Reactive Protein)",     price: 350,  category: "Inflammation",   popular: false },
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

// ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────────
const C = {
  bg:         "#F7F4EF",
  bg2:        "#EDE9E1",
  bgStrong:   "#E5E0D6",
  card:       "#FFFFFF",
  cardWarm:   "#FFFCF8",
  border:     "#E0D9CF",
  borderMid:  "#C8BFB2",
  accent:     "#E8380D",
  accentDim:  "rgba(232,56,13,0.07)",
  accentMid:  "rgba(232,56,13,0.15)",
  accentText: "#C42D08",
  accentDeep: "#9E2006",
  navy:       "#0B1826",
  navyMid:    "#1A3048",
  text:       "#0B1826",
  textMid:    "#3D4F60",
  muted:      "#7A7060",
  muted2:     "#C0B8AE",
  green:      "#00795A",
  greenDim:   "rgba(0,121,90,0.08)",
  greenText:  "#005A42",
  red:        "#CC2222",
  redDim:     "rgba(204,34,34,0.08)",
  blue:       "#0A4FCC",
  blueDim:    "rgba(10,79,204,0.07)",
  blueText:   "#0A4FCC",
  gold:       "#B87A00",
  goldDim:    "rgba(184,122,0,0.08)",
  purple:     "#5A35A0",
  purpleDim:  "rgba(90,53,160,0.08)",
  shadow:     "0 1px 8px rgba(11,24,38,0.07), 0 4px 20px rgba(11,24,38,0.05)",
  shadowMd:   "0 4px 24px rgba(11,24,38,0.1), 0 1px 6px rgba(11,24,38,0.06)",
  shadowLg:   "0 12px 48px rgba(11,24,38,0.14), 0 2px 12px rgba(11,24,38,0.08)",
  shadowXl:   "0 24px 80px rgba(11,24,38,0.18)",
};

const F  = { fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif" };
const FB = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ─── DEPT → TEST KEYWORD MAP (for smart search) ────────────────────────────────
const DEPT_SEARCH_MAP = {
  cardiology:       ["ecg","echo","echocardiogram","cardiac","heart","lipid","troponin","cardiology","cholesterol"],
  neurology:        ["mri","brain","ct scan","eeg","neurology","nerve","epilepsy","migraine"],
  pulmonology:      ["chest","x-ray","spirometry","sputum","abg","lung","pulmonology","respiratory"],
  gastroenterology: ["ultrasound","abdomen","lft","liver","h. pylori","endoscopy","gastro","stomach","gut"],
  orthopedics:      ["x-ray","mri","joint","crp","esr","ra factor","ortho","bone","spine","knee"],
  nephrology:       ["creatinine","egfr","urine","renal","kidney","nephrology","dialysis"],
  endocrinology:    ["hba1c","sugar","fasting","tsh","thyroid","t3","t4","insulin","endocrine"],
  oncology:         ["cect","pet scan","tumor","biopsy","cancer","oncology","malignant","lymphoma"],
  dermatology:      ["biopsy","koh","patch","skin","rash","dermatology","acne","fungal"],
  general_medicine: ["cbc","crp","blood culture","urine routine","fever","general","medicine"],
  blood:            ["cbc","complete blood","blood sugar","hba1c","lipid","crp","troponin","blood"],
  radiology:        ["x-ray","ultrasound","mri","ct scan","echo","scan","radiology","imaging"],
  vitamins:         ["vitamin","d3","b12","vitamins"],
  thyroid:          ["tsh","t3","t4","thyroid"],
  urine:            ["urine","urine routine","urine test","urine tests"],
  inflammation:     ["crp","esr","inflammation","c-reactive"],
  cardiac:          ["ecg","echo","echocardiogram","cardiac","heart","troponin"],
};

// ─── EMERGENCY OVERLAY ─────────────────────────────────────────────────────────
function EmergencyOverlay({ name, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"#B00000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center",animation:"emergPulse 1.4s ease-in-out infinite alternate" }}>
      <div style={{ fontSize:72,marginBottom:16,animation:"emergBounce 0.7s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ ...F,fontSize:28,fontWeight:800,color:"#fff",marginBottom:8,letterSpacing:"-0.5px" }}>Emergency Alert</div>
      <div style={{ ...FB,fontSize:14,color:"rgba(255,255,255,0.8)",marginBottom:6 }}>Possible serious condition detected:</div>
      <div style={{ ...F,fontSize:20,fontWeight:700,color:"#FFE066",marginBottom:28,textTransform:"uppercase",letterSpacing:"0.06em" }}>{name}</div>
      <div style={{ ...FB,fontSize:14,color:"rgba(255,255,255,0.85)",lineHeight:1.75,maxWidth:300,marginBottom:32 }}>
        This may require <strong style={{ color:"#fff" }}>immediate medical attention</strong>.<br/>
        Call <strong style={{ color:"#FFE066",fontSize:16 }}>112</strong> or go to your nearest emergency room now.
      </div>
      <a href="tel:112" style={{ display:"block",padding:"16px 48px",background:"#fff",borderRadius:16,color:"#B00000",...F,fontWeight:800,fontSize:18,textDecoration:"none",marginBottom:14,boxShadow:"0 8px 32px rgba(0,0,0,0.25)" }}>📞 Call 112 Now</a>
      <button onClick={onClose} style={{ ...FB,background:"none",border:"1px solid rgba(255,255,255,0.35)",color:"rgba(255,255,255,0.75)",padding:"10px 28px",borderRadius:12,fontSize:13,cursor:"pointer" }}>I understand, dismiss</button>
    </div>
  );
}

// ─── BOOK TEST MODAL ───────────────────────────────────────────────────────────
function BookTestModal({ selectedTests, allTests, onClose, onBooked }) {
  const [phone, setPhone]     = useState("");
  const [name, setName]       = useState("");
  const [step, setStep]       = useState("form");
  const [err, setErr]         = useState("");
  const [booking, setBooking] = useState(false);

  const chosen = allTests.filter(t => selectedTests.includes(t.id));
  const total  = chosen.reduce((s, t) => s + t.price, 0);

  async function handleBook() {
    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setErr("Enter a valid 10-digit Indian mobile number."); return; }
    setErr(""); setBooking(true);
    const bk = {
      id: "BK" + Date.now(), name: name.trim(), phone: phone.trim(),
      tests: chosen.map(t => ({ name: t.name, price: t.price })), total,
      bookedAt: new Date().toLocaleString("en-IN", { timeZone:"Asia/Kolkata" }), status: "Pending",
    };
    try {
      const record = await dbGet();
      await dbSet({ ...record, bookings: [bk, ...(record.bookings||[])] });
    } catch { setErr("Cloud sync failed. Try again."); setBooking(false); return; }
    onBooked(bk); setStep("success"); setBooking(false);
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:5000,background:"rgba(11,24,38,0.55)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%",maxWidth:500,background:C.card,borderRadius:"28px 28px 0 0",padding:"28px 22px 40px",animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 -20px 60px rgba(11,24,38,0.2)" }}>
        {step === "form" ? (
          <>
            <div style={{ width:40,height:4,borderRadius:4,background:C.border,margin:"0 auto 24px" }} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22 }}>
              <div>
                <div style={{ ...F,fontSize:20,fontWeight:800,color:C.navy,letterSpacing:"-0.5px" }}>Confirm Booking</div>
                <div style={{ ...FB,fontSize:13,color:C.muted,marginTop:3 }}>{chosen.length} test{chosen.length!==1?"s":""} selected</div>
              </div>
              <button onClick={onClose} style={{ ...FB,background:C.bg2,border:"none",color:C.muted,fontSize:20,cursor:"pointer",width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
            </div>

            <div style={{ background:C.bg,border:"1px solid "+C.border,borderRadius:16,padding:"16px",marginBottom:20 }}>
              {chosen.map((t,i) => (
                <div key={t.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<chosen.length-1?"1px solid "+C.border:"none" }}>
                  <span style={{ ...FB,fontSize:13,color:C.textMid }}>{t.name}</span>
                  <span style={{ ...F,fontSize:13,fontWeight:700,color:C.navy }}>₹{t.price}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,paddingTop:12,borderTop:"2px solid "+C.border }}>
                <span style={{ ...F,fontSize:14,fontWeight:700,color:C.navy }}>Total</span>
                <span style={{ ...F,fontSize:18,fontWeight:800,color:C.accent }}>₹{total}</span>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:8 }}>Your Name</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"
                style={{ ...FB,width:"100%",padding:"13px 16px",background:C.bg,border:"1.5px solid "+C.border,borderRadius:12,fontSize:14,color:C.text,outline:"none",boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:8 }}>Mobile Number</div>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number" type="tel" maxLength={10}
                style={{ ...FB,width:"100%",padding:"13px 16px",background:C.bg,border:"1.5px solid "+C.border,borderRadius:12,fontSize:14,color:C.text,outline:"none",boxSizing:"border-box" }} />
            </div>
            {err && <div style={{ ...FB,marginBottom:14,padding:"11px 14px",background:C.redDim,border:"1px solid rgba(204,34,34,0.2)",borderRadius:10,fontSize:13,color:C.red }}>{err}</div>}
            <button onClick={handleBook} disabled={booking}
              style={{ ...F,width:"100%",padding:"15px",background:booking?"#C0B8AE":"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:700,cursor:booking?"not-allowed":"pointer",boxShadow:booking?"none":"0 6px 24px rgba(232,56,13,0.35)",transition:"all 0.2s",letterSpacing:"-0.2px" }}>
              {booking ? "Saving…" : "Confirm Booking →"}
            </button>
          </>
        ) : (
          <div style={{ textAlign:"center",padding:"20px 0 10px" }}>
            <div style={{ width:72,height:72,borderRadius:"50%",background:C.greenDim,border:"2px solid "+C.green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36 }}>✓</div>
            <div style={{ ...F,fontSize:22,fontWeight:800,color:C.navy,marginBottom:8,letterSpacing:"-0.5px" }}>Booking Confirmed!</div>
            <div style={{ ...FB,fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:6 }}>
              We'll contact you at <strong style={{ color:C.navy }}>+91 {phone}</strong> soon.
            </div>
            <div style={{ ...FB,fontSize:13,color:C.muted,marginBottom:28 }}>Total paid: <strong style={{ color:C.accent }}>₹{total}</strong></div>
            <button onClick={onClose} style={{ ...F,padding:"13px 40px",background:C.navy,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>
              Done ✓
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
  const [searchQuery, setSearchQuery]     = useState("");

  const categories = ["Popular", ...Array.from(new Set(tests.map(t => t.category)))];

  const filtered = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return filterCat === "Popular"
        ? tests.filter(t => t.popular)
        : tests.filter(t => t.category === filterCat);
    }
    const deptKeywords = DEPT_SEARCH_MAP[q] || Object.entries(DEPT_SEARCH_MAP).find(([key]) => key.startsWith(q))?.[1];
    const partialDeptEntry = Object.entries(DEPT_SEARCH_MAP).find(([key]) => key.includes(q));
    const deptKws = deptKeywords || partialDeptEntry?.[1] || [];
    return tests.filter(t => {
      const name = t.name.toLowerCase(), cat = t.category.toLowerCase();
      if (name.startsWith(q)) return true;
      if (name.includes(q)) return true;
      if (cat.includes(q)) return true;
      if (deptKws.some(kw => name.includes(kw) || cat.includes(kw))) return true;
      return false;
    });
  })();

  function toggleTest(id) {
    setSelectedTests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const total = tests.filter(t => selectedTests.includes(t.id)).reduce((s,t) => s+t.price, 0);

  return (
    <div>
      {/* Search bar */}
      <div style={{ position:"relative",marginBottom:16 }}>
        <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",color:C.muted }}>🔍</span>
        <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
          placeholder="Search by name or specialty (e.g. E, cardiology…)"
          style={{ ...FB,width:"100%",padding:"12px 40px 12px 42px",background:C.card,border:"1.5px solid "+(searchQuery?C.accent:C.border),borderRadius:14,fontSize:13,color:C.text,outline:"none",boxSizing:"border-box",boxShadow:C.shadow,transition:"border-color 0.2s" }} />
        {searchQuery && (
          <button onClick={()=>setSearchQuery("")}
            style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer",lineHeight:1,padding:"2px 5px" }}>×</button>
        )}
      </div>

      {!searchQuery && (
        <div style={{ display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:18 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ ...F,flexShrink:0,padding:"7px 15px",borderRadius:100,border:"1.5px solid "+(filterCat===cat?C.accent:C.border),fontSize:12,fontWeight:filterCat===cat?700:500,background:filterCat===cat?C.accent:C.card,color:filterCat===cat?"#fff":C.textMid,cursor:"pointer",transition:"all 0.18s",boxShadow:filterCat===cat?"0 4px 14px rgba(232,56,13,0.25)":C.shadow,whiteSpace:"nowrap" }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {searchQuery && (
        <div style={{ ...FB,fontSize:12,color:C.muted,marginBottom:14,paddingLeft:2 }}>
          {filtered.length > 0
            ? <span><span style={{ color:C.accent,fontWeight:700 }}>{filtered.length}</span> result{filtered.length!==1?"s":""} for "<span style={{ color:C.navy }}>{searchQuery}</span>"</span>
            : <span>No tests found for "<span style={{ color:C.red }}>{searchQuery}</span>"</span>
          }
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:16 }}>
        {filtered.length === 0 && searchQuery && (
          <div style={{ textAlign:"center",padding:"40px 20px",background:C.card,border:"1px solid "+C.border,borderRadius:18,boxShadow:C.shadow }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🔬</div>
            <div style={{ ...F,fontSize:15,color:C.navy,fontWeight:700,marginBottom:6 }}>No tests found</div>
            <div style={{ ...FB,fontSize:13,color:C.muted }}>Try "cardiology", "blood", or "radiology"</div>
          </div>
        )}
        {filtered.map(t => {
          const sel = selectedTests.includes(t.id);
          return (
            <div key={t.id} onClick={() => toggleTest(t.id)}
              style={{ background:sel?"linear-gradient(135deg,rgba(232,56,13,0.04),rgba(232,56,13,0.08))":C.card,border:"1.5px solid "+(sel?C.accent:C.border),borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.18s",gap:12,boxShadow:sel?"0 4px 20px rgba(232,56,13,0.15)":C.shadow }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0 }}>
                <div style={{ width:22,height:22,borderRadius:7,border:"2px solid "+(sel?C.accent:C.muted2),background:sel?"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s" }}>
                  {sel && <span style={{ color:"#fff",fontSize:11,fontWeight:800 }}>✓</span>}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ ...F,fontSize:13,fontWeight:700,color:sel?C.accentText:C.navy,lineHeight:1.3,marginBottom:2 }}>{t.name}</div>
                  <div style={{ ...FB,fontSize:11,color:C.muted }}>{t.category}</div>
                </div>
              </div>
              <div style={{ ...F,fontSize:15,fontWeight:800,color:sel?C.accentText:C.navy,flexShrink:0 }}>₹{t.price}</div>
            </div>
          );
        })}
      </div>

      {selectedTests.length > 0 && (
        <div style={{ position:"sticky",bottom:80,background:C.navy,borderRadius:20,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 8px 40px rgba(11,24,38,0.35)" }}>
          <div>
            <div style={{ ...FB,fontSize:12,color:"rgba(255,255,255,0.6)" }}>{selectedTests.length} test{selectedTests.length!==1?"s":""} selected</div>
            <div style={{ ...F,fontSize:18,fontWeight:800,color:"#fff" }}>₹{total}</div>
          </div>
          <button onClick={() => setShowBookModal(true)}
            style={{ ...F,padding:"12px 24px",background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(232,56,13,0.5)",letterSpacing:"-0.2px" }}>
            Book Now →
          </button>
        </div>
      )}

      {showBookModal && (
        <BookTestModal selectedTests={selectedTests} allTests={tests} onClose={() => setShowBookModal(false)} onBooked={() => setSelectedTests([])} />
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

  const [adminAuthed, setAdminAuthed]   = useState(false);
  const [adminPass, setAdminPass]       = useState("");
  const [adminError, setAdminError]     = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminTab, setAdminTab]         = useState("depts");
  const [editDept, setEditDept]         = useState(null);
  const [newDocName, setNewDocName]     = useState("");
  const [newSlots, setNewSlots]         = useState("");
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
  const dbRecord = useRef({ bookings:[], tests:DEFAULT_TESTS, depts:DEFAULT_DEPTS });

  useEffect(() => {
    (async () => {
      try {
        const record = await dbInit(DEFAULT_TESTS, DEFAULT_DEPTS);
        dbRecord.current = record;
        if (record.bookings) setBookings(record.bookings);
        if (record.tests)    setTests(record.tests);
        if (record.depts)    setDepts(record.depts);
      } catch { setDbError("Cloud sync failed — running offline."); }
      finally  { setDbLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (adminAuthed && adminTab === "bookings") {
      (async () => {
        try { const r = await dbGet(); dbRecord.current = r; setBookings(r.bookings||[]); } catch {}
      })();
    }
  }, [adminAuthed, adminTab]);

  const saveDepts = async d => {
    setDepts(d);
    try { const rec={...dbRecord.current,depts:d}; await dbSet(rec); dbRecord.current=rec; } catch {}
  };
  const saveTests = async t => {
    setTests(t);
    try { const rec={...dbRecord.current,tests:t}; await dbSet(rec); dbRecord.current=rec; } catch {}
  };
  const resetPatient = () => { setPicked(null); setDisease(""); setAiData(null); setAiError(""); setSymAnswers({}); };
  const goHome = () => { setScreen("home"); resetPatient(); setEditDept(null); setAdminAuthed(false); setAdminPass(""); };

  // ── Android / browser back button ──────────────────────────────────────────
  useEffect(() => {
    if (screen !== "home") window.history.pushState({ medmatch: true }, "");
  }, [screen, picked, aiData, mode]);

  useEffect(() => {
    function handlePopState() {
      if (screen === "admin") { goHome(); return; }
      if (screen === "hospital") {
        if (expandedDept) { setExpandedDept(null); window.history.pushState({ medmatch: true }, ""); return; }
        goHome(); return;
      }
      if (screen === "patient") {
        if (aiData) { setAiData(null); setAiError(""); window.history.pushState({ medmatch: true }, ""); return; }
        if (picked) { setPicked(null); setSymAnswers({}); window.history.pushState({ medmatch: true }, ""); return; }
        if (mode === "disease" && disease) { setDisease(""); window.history.pushState({ medmatch: true }, ""); return; }
        goHome(); return;
      }
      goHome();
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, picked, aiData, mode, disease, expandedDept]);

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
    const newT = { id:"t"+Date.now(), name:newTestName.trim(), price:parseInt(newTestPrice)||0, category:newTestCat.trim()||"Other", popular:newTestPopular };
    saveTests([...tests, newT]);
    setNewTestName(""); setNewTestPrice(""); setNewTestCat(""); setNewTestPopular(false);
    flash("Test added.");
  }
  function removeTest(id) { saveTests(tests.filter(t => t.id !== id)); if (editTestId===id) { setEditTestId(null); setEditTestData({}); } flash("Test removed."); }
  function startEditTest(t) { setEditTestId(t.id); setEditTestData({ name:t.name, price:String(t.price), category:t.category, popular:t.popular }); }
  function saveEditTest(id) {
    if (!editTestData.name?.trim()||!editTestData.price?.trim()) { flash("⚠ Name and price required."); return; }
    saveTests(tests.map(t => t.id===id ? {...t, name:editTestData.name.trim(), price:parseInt(editTestData.price)||0, category:editTestData.category?.trim()||"Other", popular:!!editTestData.popular} : t));
    setEditTestId(null); setEditTestData({}); flash("Test updated.");
  }
  function startEditDoctor(key, idx) { setEditDocIdx({key,idx}); setEditDocName(depts[key].doctors[idx]); }
  function saveEditDoctor() {
    if (!editDocName.trim()||!editDocIdx) return;
    const {key,idx} = editDocIdx;
    const doctors = depts[key].doctors.map((d,i) => i===idx ? editDocName.trim() : d);
    saveDepts({ ...depts, [key]: { ...depts[key], doctors } });
    setEditDocIdx(null); setEditDocName(""); flash("Doctor updated.");
  }
  function updateBookingStatus(id, status) {
    (async () => {
      try {
        const record = await dbGet();
        const updated = (record.bookings||[]).map(b => b.id===id ? {...b,status} : b);
        const rec = {...record, bookings:updated};
        await dbSet(rec); dbRecord.current=rec; setBookings(updated); flash("Status updated.");
      } catch { flash("⚠ Cloud sync failed."); }
    })();
  }
  function deleteBooking(id) {
    (async () => {
      try {
        const record = await dbGet();
        const updated = (record.bookings||[]).filter(b => b.id!==id);
        const rec = {...record, bookings:updated};
        await dbSet(rec); dbRecord.current=rec; setBookings(updated); flash("Booking deleted.");
      } catch { flash("⚠ Cloud sync failed."); }
    })();
  }

  // ─── SHARED INPUT STYLE ──────────────────────────────────────────────────────
  const inputSt = { ...FB,width:"100%",padding:"12px 15px",background:C.card,border:"1.5px solid "+C.border,borderRadius:12,fontSize:14,color:C.text,outline:"none",boxSizing:"border-box",boxShadow:C.shadow };
  const btnPrimary = { ...F,padding:"13px",background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 22px rgba(232,56,13,0.3)",transition:"all 0.2s" };

  return (
    <div style={{ ...FB, minHeight:"100vh", background:C.bg, color:C.text, position:"relative" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:${C.bg};}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:${C.bg2};}::-webkit-scrollbar-thumb{background:${C.muted2};border-radius:4px;}
        textarea:focus,input:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px ${C.accentMid}!important;}
        .sym-card{transition:all 0.18s;cursor:pointer;}
        .sym-card:hover{border-color:${C.accent}!important;transform:translateY(-2px);box-shadow:0 6px 24px rgba(232,56,13,0.12)!important;}
        .home-card{transition:all 0.22s;cursor:pointer;}
        .home-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(11,24,38,0.16)!important;border-color:${C.borderMid}!important;}
        .dept-row{transition:all 0.16s;cursor:pointer;}
        .dept-row:hover{background:${C.bg}!important;}
        .admin-corner{position:fixed;bottom:22px;right:22px;z-index:100;}
        .admin-btn{width:46px;height:46px;border-radius:50%;background:${C.navy};border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(11,24,38,0.3);transition:all 0.2s;font-family:'DM Sans',system-ui;}
        .admin-btn:hover{transform:scale(1.1);background:${C.accent};}
        .pill-btn{cursor:pointer;transition:all 0.14s;}.pill-btn:hover{transform:translateY(-1px);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes emergPulse{from{background:#B00000;}to{background:#D00000;}}
        @keyframes emergBounce{from{transform:scale(1);}to{transform:scale(1.1);}}
        @keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        .fade-in{animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards;}
        .test-row:hover{border-color:${C.borderMid}!important;}
        .booking-card{transition:box-shadow 0.16s;}.booking-card:hover{box-shadow:${C.shadowMd}!important;}
      `}</style>

      {emergency && <EmergencyOverlay name={emergency} onClose={() => setEmergency(null)} />}

      {/* DB loading */}
      {dbLoading && (
        <div style={{ position:"fixed",inset:0,zIndex:9000,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20 }}>
          <div style={{ width:48,height:48,border:"3px solid "+C.border,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
          <div style={{ ...F,fontSize:16,fontWeight:700,color:C.navy }}>MedMatch</div>
          <div style={{ ...FB,fontSize:13,color:C.muted }}>Connecting to cloud…</div>
        </div>
      )}

      {/* DB error */}
      {dbError && !dbLoading && (
        <div style={{ position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:8000,background:C.card,border:"1px solid rgba(204,34,34,0.3)",borderRadius:12,padding:"10px 20px",...FB,fontSize:12,color:C.red,maxWidth:360,textAlign:"center",boxShadow:C.shadowMd }}>
          ⚠ {dbError}
        </div>
      )}

      {/* ─── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:50,background:"rgba(247,244,239,0.92)",backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",boxShadow:"0 4px 14px rgba(232,56,13,0.4)",fontFamily:"'Syne',system-ui" }}>+</div>
          <div>
            <span style={{ ...F,fontSize:16,fontWeight:800,color:C.navy,letterSpacing:"-0.5px" }}>MedMatch</span>
            <span style={{ ...FB,fontSize:10,padding:"2px 6px",borderRadius:6,background:C.accentDim,color:C.accentText,border:"1px solid rgba(232,56,13,0.15)",fontWeight:700,marginLeft:6,letterSpacing:"0.05em",textTransform:"uppercase" }}>AI</span>
          </div>
        </div>
        {screen !== "home" && (
          <button onClick={goHome}
            style={{ ...FB,fontSize:13,color:C.textMid,cursor:"pointer",background:C.card,border:"1px solid "+C.border,padding:"7px 14px",borderRadius:10,fontWeight:500,boxShadow:C.shadow,transition:"all 0.15s" }}>
            ← Home
          </button>
        )}
      </nav>

      {/* ─── LOCATION BANNER ──────────────────────────────────────────────────── */}
      <div style={{ background:"linear-gradient(90deg,#FFF8ED,#FFF3E0)",borderBottom:"1px solid #FFE0A0",padding:"9px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,textAlign:"center",flexWrap:"wrap" }}>
        <span style={{ fontSize:13 }}>📍</span>
        <span style={{ ...F,fontSize:12,color:C.gold,fontWeight:700 }}>Currently serving Hajipur, Bihar only.</span>
        <span style={{ ...FB,fontSize:12,color:"rgba(184,122,0,0.65)" }}>Expanding to more cities soon.</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HOME SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "home" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",padding:"0 0 80px" }} className="fade-in">

          {/* ── HERO ── */}
          <div style={{ padding:"44px 22px 36px",textAlign:"center",borderBottom:"1px solid "+C.border,background:"linear-gradient(180deg,#FFFDF9 0%,"+C.bg+" 100%)" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:100,background:C.accentDim,border:"1px solid rgba(232,56,13,0.15)",marginBottom:22 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:C.accent,animation:"pulse 2s infinite",display:"inline-block",flexShrink:0 }} />
              <span style={{ ...F,fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.accentText }}>AI Medical Intelligence · Live</span>
            </div>
            <h1 style={{ ...F,fontSize:36,fontWeight:800,letterSpacing:"-1.5px",lineHeight:1.1,marginBottom:16,color:C.navy }}>
              Know exactly<br />
              <span style={{ background:"linear-gradient(90deg,"+C.accent+" 0%,#FF7043 50%,#FF9800 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>what you need.</span>
            </h1>
            <p style={{ ...FB,fontSize:15,color:C.muted,lineHeight:1.7,maxWidth:300,margin:"0 auto 28px" }}>
              Right tests. Right doctor.<br/>No unnecessary costs or confusion.
            </p>
            {/* Trust badges */}
            <div style={{ display:"flex",justifyContent:"center",gap:18 }}>
              {[["🏥","10 Depts"],["🧪","Tests Online"],["⚡","AI-Powered"]].map(([e,l],i)=>(
                <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                  <span style={{ fontSize:18 }}>{e}</span>
                  <span style={{ ...FB,fontSize:11,color:C.muted,fontWeight:500 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN CARDS ── */}
          <div style={{ padding:"24px 20px 0" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
              {/* Patient Card */}
              <div className="home-card" onClick={()=>setScreen("patient")}
                style={{ background:C.card,border:"1px solid "+C.border,borderRadius:22,padding:"24px 16px 22px",textAlign:"center",boxShadow:C.shadow,position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",top:0,right:0,width:80,height:80,borderRadius:"0 22px 0 100%",background:"linear-gradient(135deg,rgba(232,56,13,0.06),rgba(232,56,13,0.12))" }} />
                <div style={{ width:56,height:56,borderRadius:18,background:"linear-gradient(135deg,rgba(232,56,13,0.08),rgba(232,56,13,0.15))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:26 }}>🩺</div>
                <div style={{ ...F,fontSize:15,fontWeight:800,color:C.navy,marginBottom:5,letterSpacing:"-0.3px" }}>I'm a Patient</div>
                <div style={{ ...FB,fontSize:12,color:C.muted,lineHeight:1.5 }}>Find tests & right specialist</div>
              </div>

              {/* Hospital Card */}
              <div className="home-card" onClick={()=>setScreen("hospital")}
                style={{ background:C.card,border:"1px solid "+C.border,borderRadius:22,padding:"24px 16px 22px",textAlign:"center",boxShadow:C.shadow,position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",top:0,right:0,width:80,height:80,borderRadius:"0 22px 0 100%",background:"linear-gradient(135deg,rgba(10,79,204,0.06),rgba(10,79,204,0.12))" }} />
                <div style={{ width:56,height:56,borderRadius:18,background:"linear-gradient(135deg,rgba(10,79,204,0.08),rgba(10,79,204,0.15))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:26 }}>🏥</div>
                <div style={{ ...F,fontSize:15,fontWeight:800,color:C.navy,marginBottom:5,letterSpacing:"-0.3px" }}>Hospitals</div>
                <div style={{ ...FB,fontSize:12,color:C.muted,lineHeight:1.5 }}>Dept. availability & doctors</div>
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ background:C.navy,borderRadius:20,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:C.shadowLg }}>
              {[[activeDepts,"Active Depts",C.green],[totalDocs||"—","Doctors",C.blue],["24/7","Available","#FF9800"]].map(([n,l,clr],i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ ...F,fontSize:20,fontWeight:800,color:clr,letterSpacing:"-0.5px" }}>{n}</div>
                  <div style={{ ...FB,fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Feature highlights */}
            <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:10 }}>
              {[
                { icon:"🎯", title:"Honest AI Advice", sub:"We tell you exactly what tests you need — and what to skip.", clr:C.accentDim, bdr:"rgba(232,56,13,0.12)" },
                { icon:"💊", title:"No Upselling", sub:"Zero pressure. Pure medical accuracy.", clr:C.blueDim, bdr:"rgba(10,79,204,0.1)" },
                { icon:"⚡", title:"Instant Diagnosis", sub:"AI analysis in seconds. Book tests right here.", clr:C.greenDim, bdr:"rgba(0,121,90,0.1)" },
              ].map((f,i) => (
                <div key={i} style={{ background:C.card,border:"1px solid "+f.bdr,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:14,boxShadow:C.shadow }}>
                  <div style={{ width:42,height:42,borderRadius:13,background:f.clr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ ...F,fontSize:14,fontWeight:700,color:C.navy,marginBottom:3 }}>{f.title}</div>
                    <div style={{ ...FB,fontSize:12,color:C.muted,lineHeight:1.5 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PATIENT SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "patient" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"28px 20px 100px" }} className="fade-in">
          <div style={{ marginBottom:24 }}>
            <h2 style={{ ...F,fontSize:24,fontWeight:800,letterSpacing:"-0.8px",color:C.navy,marginBottom:4 }}>Your Health Check</h2>
            <p style={{ ...FB,fontSize:14,color:C.muted }}>Choose how to get diagnosed</p>
          </div>

          {/* Mode tabs */}
          <div style={{ display:"flex",gap:8,marginBottom:28,overflowX:"auto",paddingBottom:2 }}>
            {[["symptom","⚕️","Symptoms"],["disease","📝","Condition"],["tests","🧪","Book Tests"]].map(([v,ico,lbl]) => (
              <button key={v} onClick={() => { setMode(v); resetPatient(); }}
                style={{ ...F,flexShrink:0,padding:"9px 16px",borderRadius:12,border:"1.5px solid "+(mode===v?C.accent:C.border),cursor:"pointer",fontSize:13,fontWeight:700,background:mode===v?"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")":C.card,color:mode===v?"#fff":C.textMid,boxShadow:mode===v?"0 4px 18px rgba(232,56,13,0.28)":C.shadow,transition:"all 0.18s",display:"flex",alignItems:"center",gap:6,letterSpacing:"-0.1px" }}>
                <span>{ico}</span> {lbl}
              </button>
            ))}
          </div>

          {/* ── SYMPTOMS MODE ── */}
          {mode === "symptom" && (
            <>
              <p style={{ ...FB,fontSize:13,color:C.muted,marginBottom:14 }}>Tap what's bothering you most</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {SYMPTOMS.map(s => {
                  const sel = picked?.id===s.id;
                  return (
                    <div key={s.id} className={sel?"":"sym-card"}
                      onClick={() => { setPicked(s); setSymAnswers({}); setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100); }}
                      style={{ background:sel?"linear-gradient(135deg,rgba(232,56,13,0.05),rgba(232,56,13,0.1))":C.card,border:"1.5px solid "+(sel?C.accent:C.border),borderRadius:16,padding:"15px 13px",display:"flex",alignItems:"center",gap:11,boxShadow:sel?"0 6px 24px rgba(232,56,13,0.15)":C.shadow,transition:"all 0.18s" }}>
                      <span style={{ fontSize:22,flexShrink:0 }}>{s.icon}</span>
                      <span style={{ ...F,fontSize:13,fontWeight:700,color:sel?C.accentText:C.navy,lineHeight:1.3 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-in" style={{ marginTop:24 }}>
                  {/* Action box */}
                  {picked.action && (
                    <div style={{ background:"linear-gradient(135deg,#FFF8ED,#FFF3DC)",border:"1px solid #F5C840",borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",gap:13,alignItems:"flex-start" }}>
                      <span style={{ fontSize:22,flexShrink:0 }}>⚠️</span>
                      <div>
                        <div style={{ ...F,fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.gold,marginBottom:5 }}>Immediate Action</div>
                        <div style={{ ...FB,fontSize:13,color:"#7A5A00",lineHeight:1.65 }}>{picked.action}</div>
                      </div>
                    </div>
                  )}

                  {/* Follow-up questions */}
                  <div style={{ background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:"20px",marginBottom:14,boxShadow:C.shadowMd }}>
                    <div style={{ ...F,fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.accent,marginBottom:16 }}>Tell us more</div>
                    {picked.followUps.map((fq,qi) => (
                      <div key={qi} style={{ marginBottom:18 }}>
                        <div style={{ ...F,fontSize:14,fontWeight:700,color:C.navy,marginBottom:10 }}>{fq.q}</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                          {fq.opts.map((opt,oi) => {
                            const ch = symAnswers[qi]===oi;
                            return (
                              <button key={oi} className="pill-btn" onClick={() => setSymAnswers(p=>({...p,[qi]:oi}))}
                                style={{ ...FB,padding:"8px 14px",borderRadius:100,background:ch?"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")":C.bg,border:"1.5px solid "+(ch?C.accent:C.border),color:ch?"#fff":C.textMid,fontSize:12,fontWeight:ch?700:500,cursor:"pointer",boxShadow:ch?"0 3px 12px rgba(232,56,13,0.25)":"none",transition:"all 0.15s" }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Results card */}
                  <div style={{ background:C.card,border:"1px solid "+C.border,borderRadius:20,overflow:"hidden",boxShadow:C.shadowMd }}>
                    <div style={{ padding:"18px 20px",background:"linear-gradient(135deg,"+C.navy+","+C.navyMid+")",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ ...F,fontSize:17,fontWeight:800,color:"#fff",letterSpacing:"-0.3px" }}>{pickedDept.label}</div>
                        <div style={{ ...FB,fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2 }}>Recommended department</div>
                      </div>
                      <div style={{ padding:"5px 12px",borderRadius:100,...FB,fontSize:12,fontWeight:700,background:pickedDept.available?"rgba(0,255,170,0.15)":"rgba(255,92,92,0.15)",color:pickedDept.available?"#00FFB0":"#FF8080",border:"1px solid "+(pickedDept.available?"rgba(0,255,170,0.3)":"rgba(255,92,92,0.3)") }}>
                        {pickedDept.available ? "● Available" : "● Unavailable"}
                      </div>
                    </div>
                    <div style={{ padding:"20px" }}>
                      <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:12 }}>Recommended Tests</div>
                      {picked.tests.map((t,i) => (
                        <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<picked.tests.length-1?"1px solid "+C.border:"none" }}>
                          <div style={{ width:6,height:6,borderRadius:"50%",background:C.accent,flexShrink:0 }} />
                          <span style={{ ...FB,fontSize:14,color:C.textMid }}>{t}</span>
                        </div>
                      ))}

                      {(pickedDept.doctors.length > 0 || pickedDept.slots) && (
                        <>
                          <div style={{ height:1,background:C.border,margin:"16px 0" }} />
                          <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:12 }}>Doctors Available</div>
                          {pickedDept.doctors.map((d,i) => (
                            <div key={i} style={{ ...FB,display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:C.bg,borderRadius:10,marginBottom:7,fontSize:13,color:C.textMid,fontWeight:500 }}>
                              <span style={{ fontSize:16 }}>👤</span> {d}
                            </div>
                          ))}
                          {pickedDept.slots && <div style={{ ...FB,fontSize:12,color:C.green,background:C.greenDim,border:"1px solid rgba(0,121,90,0.15)",padding:"7px 13px",borderRadius:10,marginTop:5 }}>⏰ {pickedDept.slots}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CONDITION MODE ── */}
          {mode === "disease" && (
            <>
              <div style={{ ...FB,padding:"12px 16px",background:C.blueDim,border:"1px solid rgba(10,79,204,0.15)",borderRadius:14,marginBottom:16,fontSize:13,color:C.blueText,lineHeight:1.65 }}>
                💡 Describe your condition. Include location, duration &amp; severity for better results.
              </div>
              <textarea value={disease} onChange={e=>setDisease(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();analyzeDisease();}}}
                placeholder={"e.g. Chest pain for 2 hours, spreading to left arm...\nor: Type 2 diabetes checkup, HbA1c 8.2, on Metformin..."}
                style={{ ...FB,width:"100%",padding:"14px 16px",background:C.card,border:"1.5px solid "+C.border,borderRadius:16,fontSize:14,color:C.text,resize:"none",minHeight:120,lineHeight:1.65,outline:"none",boxShadow:C.shadow }} />
              <button onClick={analyzeDisease} disabled={loading||!disease.trim()}
                style={{ ...F,width:"100%",padding:"14px",marginTop:12,...(loading||!disease.trim()?{background:C.bg2,border:"1px solid "+C.border,color:C.muted,cursor:"not-allowed"}:{background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",color:"#fff",cursor:"pointer",boxShadow:"0 6px 24px rgba(232,56,13,0.3)"}),borderRadius:14,fontSize:15,fontWeight:700,transition:"all 0.2s",letterSpacing:"-0.2px" }}>
                {loading ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><span style={{ display:"inline-block",animation:"spin 0.7s linear infinite" }}>◌</span> Analyzing…</span> : "Analyze & see what you need →"}
              </button>
              <div style={{ ...FB,marginTop:12,padding:"10px 14px",background:"#FFFBF0",border:"1px solid #F5D87A",borderRadius:11,fontSize:12,color:"#8A6500",lineHeight:1.65 }}>
                If a hospital recommends extra tests not listed, ask your doctor to justify each one.
              </div>
              {aiError && <div style={{ ...FB,marginTop:12,padding:"12px 15px",background:C.redDim,border:"1px solid rgba(204,34,34,0.2)",borderRadius:11,fontSize:13,color:C.red }}>{aiError}</div>}

              {aiData && (
                <div ref={resultRef} className="fade-in" style={{ marginTop:24 }}>
                  {aiData.immediate_action && (
                    <div style={{ background:"linear-gradient(135deg,#FFF8ED,#FFF3DC)",border:"1px solid #F5C840",borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",gap:13,alignItems:"flex-start" }}>
                      <span style={{ fontSize:22,flexShrink:0 }}>⚠️</span>
                      <div>
                        <div style={{ ...F,fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.gold,marginBottom:5 }}>Immediate Action</div>
                        <div style={{ ...FB,fontSize:13,color:"#7A5A00",lineHeight:1.65 }}>{aiData.immediate_action}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background:C.card,border:"1px solid "+C.border,borderRadius:20,overflow:"hidden",boxShadow:C.shadowMd }}>
                    <div style={{ padding:"20px 22px",background:"linear-gradient(135deg,"+C.navy+","+C.navyMid+")",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                      <div>
                        <div style={{ ...F,fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.4px",marginBottom:4 }}>{aiData.name}</div>
                        <div style={{ ...FB,fontSize:12,color:"rgba(255,255,255,0.6)" }}>Specialist: {aiData.specialist}</div>
                      </div>
                      <div style={{ padding:"5px 12px",borderRadius:100,...FB,fontSize:12,fontWeight:700,background:aiData.dept?.available?"rgba(0,255,170,0.15)":"rgba(255,92,92,0.15)",color:aiData.dept?.available?"#00FFB0":"#FF8080",border:"1px solid "+(aiData.dept?.available?"rgba(0,255,170,0.3)":"rgba(255,92,92,0.3)"),flexShrink:0 }}>
                        {aiData.dept?.available ? "● Available" : "● Unavailable"}
                      </div>
                    </div>
                    <div style={{ padding:"20px 22px" }}>
                      <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.green,marginBottom:12 }}>Tests You Need</div>
                      {aiData.needed?.map((t,i) => (
                        <div key={i} style={{ padding:"13px 15px",background:C.greenDim,border:"1px solid rgba(0,121,90,0.12)",borderRadius:13,marginBottom:8 }}>
                          <div style={{ ...F,fontSize:13,fontWeight:700,color:C.greenText,marginBottom:4 }}>{t.test}</div>
                          <div style={{ ...FB,fontSize:12,color:C.muted,lineHeight:1.55 }}>{t.reason}</div>
                        </div>
                      ))}
                      {aiData.skip?.length > 0 && (
                        <>
                          <div style={{ height:1,background:C.border,margin:"16px 0" }} />
                          <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.red,marginBottom:12 }}>Question or Skip</div>
                          {aiData.skip.map((t,i) => (
                            <div key={i} style={{ padding:"13px 15px",background:C.redDim,border:"1px solid rgba(204,34,34,0.12)",borderRadius:13,marginBottom:8 }}>
                              <div style={{ ...F,fontSize:13,fontWeight:700,color:C.red,marginBottom:4 }}>✕ {t.test}</div>
                              <div style={{ ...FB,fontSize:12,color:C.muted,lineHeight:1.55 }}>{t.reason}</div>
                            </div>
                          ))}
                        </>
                      )}
                      <div style={{ height:1,background:C.border,margin:"16px 0" }} />
                      <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:12 }}>Department</div>
                      {aiData.dept?.available ? (
                        <>
                          {aiData.dept.doctors.length>0 ? aiData.dept.doctors.map((d,i)=>(
                            <div key={i} style={{ ...FB,display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:C.bg,borderRadius:10,marginBottom:7,fontSize:13,color:C.textMid }}>
                              <span>👤</span> {d}
                            </div>
                          )) : <div style={{ ...FB,fontSize:13,color:C.muted,padding:"9px 0" }}>Doctor info coming soon.</div>}
                          {aiData.dept.slots && <div style={{ ...FB,fontSize:12,color:C.green,background:C.greenDim,border:"1px solid rgba(0,121,90,0.15)",padding:"7px 13px",borderRadius:10,marginTop:5 }}>⏰ {aiData.dept.slots}</div>}
                        </>
                      ) : (
                        <div style={{ ...FB,padding:"13px 15px",background:C.redDim,border:"1px solid rgba(204,34,34,0.12)",borderRadius:13,fontSize:13,color:C.red }}>No specialist available. Contact reception.</div>
                      )}
                      {aiData.advice && (
                        <>
                          <div style={{ height:1,background:C.border,margin:"16px 0" }} />
                          <div style={{ ...FB,padding:"14px 16px",background:C.blueDim,border:"1px solid rgba(10,79,204,0.1)",borderRadius:13,fontSize:13,color:C.blueText,lineHeight:1.65 }}>
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

          {/* ── BOOK TESTS MODE ── */}
          {mode === "tests" && <TestsSection tests={tests} />}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HOSPITAL SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "hospital" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"28px 20px 100px" }} className="fade-in">
          <div style={{ marginBottom:22 }}>
            <h2 style={{ ...F,fontSize:24,fontWeight:800,letterSpacing:"-0.8px",color:C.navy,marginBottom:4 }}>Departments</h2>
            <p style={{ ...FB,fontSize:14,color:C.muted }}>Live availability · {activeDepts} active departments</p>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22 }}>
            {[[activeDepts,"Active",C.green,C.greenDim],[Object.keys(depts).length-activeDepts,"Unavailable",C.red,C.redDim],[totalDocs||"—","Doctors",C.blue,C.blueDim]].map(([n,l,clr,dim],i) => (
              <div key={i} style={{ background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"14px 12px",textAlign:"center",boxShadow:C.shadow }}>
                <div style={{ ...F,fontSize:22,fontWeight:800,color:clr,letterSpacing:"-0.5px",lineHeight:1 }}>{n}</div>
                <div style={{ ...FB,fontSize:11,color:C.muted,marginTop:5 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Dept cards */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {Object.entries(depts).map(([key,d]) => {
              const open = expandedDept===key;
              return (
                <div key={key}
                  style={{ background:C.card,border:"1.5px solid "+(open?C.accent:C.border),borderRadius:18,overflow:"hidden",boxShadow:open?C.shadowMd:C.shadow,transition:"all 0.2s" }}>
                  <div className={d.available?"dept-row":""} onClick={()=>d.available&&setExpandedDept(open?null:key)}
                    style={{ padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:d.available?"pointer":"default" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:10,height:10,borderRadius:"50%",background:d.available?C.green:C.red,flexShrink:0,boxShadow:d.available?"0 0 8px rgba(0,121,90,0.6)":"none" }} />
                      <div>
                        <div style={{ ...F,fontSize:14,fontWeight:700,color:C.navy,letterSpacing:"-0.2px" }}>{d.label}</div>
                        <div style={{ ...FB,fontSize:12,color:d.available?C.green:C.red,fontWeight:500,marginTop:2 }}>
                          {d.available ? (d.doctors.length>0 ? `${d.doctors.length} doctor${d.doctors.length!==1?"s":""}` : "Available · No doctors yet") : "Unavailable"}
                        </div>
                      </div>
                    </div>
                    {d.available && <span style={{ ...FB,fontSize:18,color:C.muted2,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"none" }}>⌄</span>}
                  </div>
                  {d.available && open && (
                    <div style={{ borderTop:"1px solid "+C.border,padding:"16px 18px",background:C.bg }}>
                      {d.doctors.length>0 ? d.doctors.map((doc,i)=>(
                        <div key={i} style={{ ...FB,display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:i<d.doctors.length-1?"1px solid "+C.border:"none",fontSize:13,color:C.textMid }}>
                          <span style={{ fontSize:15 }}>👤</span> {doc}
                        </div>
                      )) : <div style={{ ...FB,fontSize:13,color:C.muted,padding:"4px 0" }}>🕐 Doctor info coming soon.</div>}
                      {d.slots && <div style={{ ...FB,fontSize:12,color:C.green,background:C.greenDim,border:"1px solid rgba(0,121,90,0.15)",padding:"7px 13px",borderRadius:10,marginTop:10,display:"inline-block" }}>⏰ {d.slots}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADMIN SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "admin" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"28px 20px 100px" }} className="fade-in">
          {!adminAuthed ? (
            <>
              <h2 style={{ ...F,fontSize:24,fontWeight:800,color:C.navy,marginBottom:4 }}>Admin Panel</h2>
              <p style={{ ...FB,fontSize:14,color:C.muted,marginBottom:24 }}>Enter password to continue</p>
              <div style={{ background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:"28px 22px",boxShadow:C.shadowMd }}>
                <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Password</div>
                <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()} placeholder="Enter admin password"
                  style={{ ...inputSt,marginBottom:adminError?10:14 }} />
                {adminError && <div style={{ ...FB,marginBottom:14,fontSize:13,color:C.red }}>{adminError}</div>}
                <button onClick={adminLogin}
                  style={{ ...F,width:"100%",padding:"13px",background:"linear-gradient(135deg,"+C.navy+","+C.navyMid+")",border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 22px rgba(11,24,38,0.3)" }}>
                  Login →
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                <h2 style={{ ...F,fontSize:24,fontWeight:800,color:C.navy }}>Admin Panel</h2>
                <button onClick={()=>{setAdminAuthed(false);setAdminPass("");setEditDept(null);}}
                  style={{ ...FB,fontSize:12,color:C.red,background:C.redDim,border:"1px solid rgba(204,34,34,0.2)",borderRadius:8,padding:"6px 13px",cursor:"pointer",fontWeight:600 }}>Logout</button>
              </div>
              <p style={{ ...FB,fontSize:14,color:C.muted,marginBottom:16 }}>Full control over MedMatch</p>

              {adminSuccess && (
                <div style={{ ...FB,marginBottom:16,padding:"12px 16px",background:C.greenDim,border:"1px solid rgba(0,121,90,0.2)",borderRadius:11,fontSize:13,color:C.greenText,fontWeight:500 }}>✓ {adminSuccess}</div>
              )}

              {/* Admin tabs */}
              <div style={{ display:"flex",gap:8,marginBottom:22 }}>
                {[["depts","🏥","Departments"],["tests","🧪","Tests"],["bookings","📋","Bookings"]].map(([tab,ico,lbl]) => (
                  <button key={tab} onClick={()=>setAdminTab(tab)}
                    style={{ ...F,padding:"9px 14px",borderRadius:12,border:"1.5px solid "+(adminTab===tab?C.navy:C.border),fontSize:12,fontWeight:700,background:adminTab===tab?C.navy:C.card,color:adminTab===tab?"#fff":C.textMid,cursor:"pointer",transition:"all 0.16s",boxShadow:adminTab===tab?"0 4px 16px rgba(11,24,38,0.2)":C.shadow,display:"flex",alignItems:"center",gap:5 }}>
                    {ico} {lbl} {tab==="bookings"&&bookings.length>0 && <span style={{ padding:"1px 6px",borderRadius:100,background:C.accent,color:"#fff",fontSize:10,fontWeight:700,marginLeft:2 }}>{bookings.length}</span>}
                  </button>
                ))}
              </div>

              {/* ── DEPARTMENTS TAB ── */}
              {adminTab === "depts" && (
                <>
                  {Object.entries(depts).map(([key,d]) => {
                    const isEd = editDept===key;
                    return (
                      <div key={key} style={{ background:C.card,border:"1.5px solid "+(isEd?C.accent:C.border),borderRadius:18,marginBottom:10,overflow:"hidden",boxShadow:isEd?C.shadowMd:C.shadow,transition:"all 0.18s" }}>
                        <div className="dept-row" style={{ padding:"15px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }}
                          onClick={()=>{ setEditDept(isEd?null:key); setNewDocName(""); setNewSlots(d.slots||""); }}>
                          <div style={{ display:"flex",alignItems:"center",gap:11 }}>
                            <span style={{ width:8,height:8,borderRadius:"50%",background:d.available?C.green:C.red,display:"inline-block",boxShadow:d.available?"0 0 6px rgba(0,121,90,0.5)":"none" }} />
                            <span style={{ ...F,fontSize:14,fontWeight:700,color:C.navy }}>{d.label}</span>
                            <span style={{ ...FB,fontSize:12,color:C.muted }}>{d.doctors.length} doc{d.doctors.length!==1?"s":""}</span>
                          </div>
                          <span style={{ ...FB,fontSize:18,color:C.muted2,transition:"transform 0.2s",display:"inline-block",transform:isEd?"rotate(180deg)":"none" }}>⌄</span>
                        </div>
                        {isEd && (
                          <div style={{ borderTop:"1px solid "+C.border,padding:"18px" }}>
                            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
                              <span style={{ ...FB,fontSize:13,color:C.textMid }}>Availability</span>
                              <button onClick={()=>toggleAvail(key)} style={{ ...FB,padding:"7px 14px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:d.available?C.redDim:C.greenDim,color:d.available?C.red:C.greenText }}>
                                {d.available ? "Mark Unavailable" : "Mark Available"}
                              </button>
                            </div>
                            {d.doctors.length>0 && (
                              <div style={{ marginBottom:16 }}>
                                <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Current Doctors</div>
                                {d.doctors.map((doc,i)=>(
                                  <div key={i} style={{ marginBottom:7 }}>
                                    {editDocIdx?.key===key && editDocIdx?.idx===i ? (
                                      <div style={{ display:"flex",gap:7 }}>
                                        <input value={editDocName} onChange={e=>setEditDocName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEditDoctor()}
                                          style={{ ...inputSt,flex:1 }} autoFocus />
                                        <button onClick={saveEditDoctor} style={{ ...F,padding:"10px 14px",background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>Save</button>
                                        <button onClick={()=>setEditDocIdx(null)} style={{ ...FB,padding:"10px 12px",background:C.bg2,border:"1px solid "+C.border,borderRadius:10,color:C.muted,fontSize:12,cursor:"pointer" }}>✕</button>
                                      </div>
                                    ) : (
                                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:C.bg,borderRadius:11,border:"1px solid "+C.border }}>
                                        <div style={{ ...FB,display:"flex",alignItems:"center",gap:9,fontSize:13,color:C.textMid }}>👤 {doc}</div>
                                        <div style={{ display:"flex",gap:6 }}>
                                          <button onClick={()=>startEditDoctor(key,i)} style={{ ...FB,background:C.blueDim,border:"1px solid rgba(10,79,204,0.15)",color:C.blue,cursor:"pointer",fontSize:11,padding:"4px 10px",borderRadius:7,fontWeight:600 }}>Edit</button>
                                          <button onClick={()=>removeDoctor(key,i)} style={{ ...FB,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,padding:"2px 6px",borderRadius:6 }}>×</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ marginBottom:16 }}>
                              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Add Doctor</div>
                              <div style={{ display:"flex",gap:8 }}>
                                <input value={newDocName} onChange={e=>setNewDocName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDoctor(key)} placeholder="Dr. Full Name"
                                  style={{ ...inputSt,flex:1 }} />
                                <button onClick={()=>addDoctor(key)} style={{ ...F,padding:"12px 16px",background:"linear-gradient(135deg,"+C.green+",#006044)",border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ Add</button>
                              </div>
                            </div>
                            <div>
                              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Slot Timings</div>
                              <div style={{ display:"flex",gap:8 }}>
                                <input value={newSlots} onChange={e=>setNewSlots(e.target.value)} placeholder="e.g. Mon–Fri 9AM–5PM"
                                  style={{ ...inputSt,flex:1 }} />
                                <button onClick={()=>saveSlots(key)} style={{ ...F,padding:"12px 16px",background:"linear-gradient(135deg,"+C.navy+","+C.navyMid+")",border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Save</button>
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
                  <div style={{ background:C.card,border:"1px solid "+C.border,borderRadius:18,padding:"18px",marginBottom:16,boxShadow:C.shadow }}>
                    <div style={{ ...F,fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.accent,marginBottom:14 }}>Add New Test</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                      <div>
                        <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:7 }}>Test Name</div>
                        <input value={newTestName} onChange={e=>setNewTestName(e.target.value)} placeholder="e.g. Blood Culture"
                          style={inputSt} />
                      </div>
                      <div>
                        <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:7 }}>Price (₹)</div>
                        <input value={newTestPrice} onChange={e=>setNewTestPrice(e.target.value.replace(/\D/g,""))} placeholder="e.g. 350"
                          style={inputSt} type="number" />
                      </div>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:7 }}>Category</div>
                      <input value={newTestCat} onChange={e=>setNewTestCat(e.target.value)} placeholder="e.g. Blood Tests"
                        style={inputSt} />
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14,cursor:"pointer" }} onClick={()=>setNewTestPopular(p=>!p)}>
                      <div style={{ width:18,height:18,borderRadius:5,border:"2px solid "+(newTestPopular?C.accent:C.muted2),background:newTestPopular?"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {newTestPopular && <span style={{ color:"#fff",fontSize:10,fontWeight:800 }}>✓</span>}
                      </div>
                      <span style={{ ...FB,fontSize:13,color:newTestPopular?C.accent:C.muted,fontWeight:newTestPopular?600:400 }}>Mark as Popular</span>
                    </div>
                    <button onClick={addTest} style={{ ...F,width:"100%",padding:"13px",background:"linear-gradient(135deg,"+C.navy+","+C.navyMid+")",border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                      + Add Test
                    </button>
                  </div>

                  {tests.map(t => (
                    <div key={t.id} className="test-row" style={{ background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"14px 16px",marginBottom:9,boxShadow:C.shadow,transition:"border-color 0.15s" }}>
                      {editTestId===t.id ? (
                        <div>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                            <div>
                              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Name</div>
                              <input value={editTestData.name||""} onChange={e=>setEditTestData(p=>({...p,name:e.target.value}))} style={inputSt} />
                            </div>
                            <div>
                              <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Price</div>
                              <input value={editTestData.price||""} onChange={e=>setEditTestData(p=>({...p,price:e.target.value.replace(/\D/g,"")}))} style={inputSt} type="number" />
                            </div>
                          </div>
                          <div style={{ marginBottom:10 }}>
                            <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:6 }}>Category</div>
                            <input value={editTestData.category||""} onChange={e=>setEditTestData(p=>({...p,category:e.target.value}))} style={inputSt} />
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,cursor:"pointer" }} onClick={()=>setEditTestData(p=>({...p,popular:!p.popular}))}>
                            <div style={{ width:18,height:18,borderRadius:5,border:"2px solid "+(editTestData.popular?C.accent:C.muted2),background:editTestData.popular?"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                              {editTestData.popular && <span style={{ color:"#fff",fontSize:10,fontWeight:800 }}>✓</span>}
                            </div>
                            <span style={{ ...FB,fontSize:13,color:editTestData.popular?C.accent:C.muted,fontWeight:editTestData.popular?600:400 }}>Popular</span>
                          </div>
                          <div style={{ display:"flex",gap:8 }}>
                            <button onClick={()=>saveEditTest(t.id)} style={{ ...F,flex:1,padding:"11px",background:"linear-gradient(135deg,"+C.accent+","+C.accentDeep+")",border:"none",borderRadius:11,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Save Changes</button>
                            <button onClick={()=>{setEditTestId(null);setEditTestData({});}} style={{ ...FB,padding:"11px 16px",background:C.bg2,border:"1px solid "+C.border,borderRadius:11,color:C.muted,fontSize:13,cursor:"pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:4 }}>
                              <span style={{ ...F,fontSize:13,fontWeight:700,color:C.navy }}>{t.name}</span>
                              {t.popular && <span style={{ ...FB,fontSize:10,padding:"2px 7px",borderRadius:100,background:C.accentDim,color:C.accentText,border:"1px solid rgba(232,56,13,0.15)",fontWeight:600 }}>Popular</span>}
                            </div>
                            <div style={{ ...FB,display:"flex",alignItems:"center",gap:9,fontSize:11,color:C.muted }}>
                              <span>{t.category}</span>
                              <span style={{ color:C.accent,fontWeight:700 }}>₹{t.price}</span>
                            </div>
                          </div>
                          <div style={{ display:"flex",gap:7,flexShrink:0 }}>
                            <button onClick={()=>startEditTest(t)} style={{ ...FB,background:C.blueDim,border:"1px solid rgba(10,79,204,0.15)",color:C.blue,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600 }}>Edit</button>
                            <button onClick={()=>removeTest(t.id)} style={{ ...FB,background:C.redDim,border:"1px solid rgba(204,34,34,0.15)",color:C.red,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600 }}>Remove</button>
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
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                    <div style={{ ...F,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted }}>
                      Total: {bookings.length} booking{bookings.length!==1?"s":""}
                    </div>
                    <button onClick={()=>{ (async()=>{ try{ const r=await dbGet(); setBookings(r.bookings||[]); flash("Refreshed!"); }catch{} })(); }}
                      style={{ ...FB,fontSize:12,color:C.blue,background:C.blueDim,border:"1px solid rgba(10,79,204,0.15)",borderRadius:8,padding:"6px 13px",cursor:"pointer",fontWeight:600 }}>⟳ Refresh</button>
                  </div>

                  {bookings.length === 0 ? (
                    <div style={{ textAlign:"center",padding:"44px 20px",background:C.card,border:"1px solid "+C.border,borderRadius:20,boxShadow:C.shadow }}>
                      <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
                      <div style={{ ...F,fontSize:15,color:C.navy,fontWeight:700 }}>No bookings yet</div>
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="booking-card" style={{ background:C.card,border:"1px solid "+C.border,borderRadius:18,padding:"18px",marginBottom:12,boxShadow:C.shadow }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                          <div>
                            <div style={{ ...F,fontSize:15,fontWeight:800,color:C.navy,marginBottom:3 }}>{b.name}</div>
                            <div style={{ ...FB,fontSize:12,color:C.muted }}>📞 +91 {b.phone}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ ...FB,fontSize:10,color:C.muted,marginBottom:5 }}>{b.id}</div>
                            <span style={{ ...FB,fontSize:11,padding:"4px 10px",borderRadius:100,fontWeight:700,
                              background: b.status==="Confirmed"?C.greenDim : b.status==="Completed"?C.purpleDim : b.status==="Cancelled"?C.redDim : C.goldDim,
                              color: b.status==="Confirmed"?C.greenText : b.status==="Completed"?C.purple : b.status==="Cancelled"?C.red : C.gold,
                              border: "1px solid "+(b.status==="Confirmed"?C.green : b.status==="Completed"?C.purple : b.status==="Cancelled"?C.red : C.gold)+"30"
                            }}>{b.status}</span>
                          </div>
                        </div>
                        <div style={{ background:C.bg,border:"1px solid "+C.border,borderRadius:12,padding:"12px",marginBottom:12 }}>
                          {b.tests.map((t,i) => (
                            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<b.tests.length-1?"1px solid "+C.border:"none" }}>
                              <span style={{ ...FB,fontSize:12,color:C.textMid }}>{t.name}</span>
                              <span style={{ ...F,fontSize:12,color:C.accent,fontWeight:700 }}>₹{t.price}</span>
                            </div>
                          ))}
                          <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"2px solid "+C.border }}>
                            <span style={{ ...F,fontSize:13,fontWeight:700,color:C.navy }}>Total</span>
                            <span style={{ ...F,fontSize:14,fontWeight:800,color:C.accent }}>₹{b.total}</span>
                          </div>
                        </div>
                        <div style={{ ...FB,fontSize:11,color:C.muted,marginBottom:12 }}>🕐 {b.bookedAt}</div>
                        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                          {["Pending","Confirmed","Completed","Cancelled"].map(s => (
                            <button key={s} onClick={()=>updateBookingStatus(b.id,s)}
                              style={{ ...FB,padding:"6px 13px",borderRadius:8,border:"1.5px solid "+(b.status===s?C.navy:C.border),fontSize:11,fontWeight:b.status===s?700:500,background:b.status===s?C.navy:C.card,color:b.status===s?"#fff":C.muted,cursor:"pointer",transition:"all 0.14s" }}>
                              {s}
                            </button>
                          ))}
                          <button onClick={()=>deleteBooking(b.id)}
                            style={{ ...FB,marginLeft:"auto",padding:"6px 13px",borderRadius:8,border:"1px solid rgba(204,34,34,0.2)",fontSize:11,fontWeight:600,background:C.redDim,color:C.red,cursor:"pointer" }}>
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

      {/* Admin corner button */}
      {screen !== "admin" && (
        <div className="admin-corner">
          <button className="admin-btn" onClick={()=>setScreen("admin")} title="Admin Panel">⚙</button>
        </div>
      )}
    </div>
  );
}
