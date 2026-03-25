import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const HOSPITAL_NAME = "Hospitals will be added in future update";
const ADMIN_PASSWORD = "Vishu@226";

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
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      o: Math.random() * 0.45 + 0.08,
      c: ["#00D4AA","#4DA6FF","#8B8BFF"][Math.floor(Math.random() * 3)],
    }));

    let tick = 0;
    function draw() {
      tick++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Connections
      ctx.lineWidth = 0.4;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 92) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,212,170,${(1 - d/92) * 0.1})`;
            ctx.stroke();
          }
        }
      }

      // Particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.o * 200).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Scan line
      const sy = (tick * 0.22) % (H + 80) - 40;
      const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(0,212,170,0.012)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 40, W, 80);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      background: "linear-gradient(135deg,#080A0E 0%,#0A0F1A 60%,#07090F 100%)",
    }} />
  );
}

// ─── EMERGENCY OVERLAY ─────────────────────────────────────────────────────────
function EmergencyOverlay({ name, onClose }) {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:"rgba(150,0,0,0.97)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"32px 24px",textAlign:"center",
      animation:"emergPulse 1.2s ease-in-out infinite alternate",
    }}>
      <div style={{ fontSize:68,marginBottom:14,animation:"emergBounce 0.6s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ fontSize:26,fontWeight:700,color:"#fff",marginBottom:10 }}>Emergency Alert</div>
      <div style={{ fontSize:14,color:"#FFCDD2",marginBottom:6 }}>Possible serious condition detected:</div>
      <div style={{ fontSize:18,fontWeight:700,color:"#FFEB3B",marginBottom:24,textTransform:"uppercase",letterSpacing:"0.04em" }}>{name}</div>
      <div style={{ fontSize:14,color:"#FFCDD2",lineHeight:1.7,maxWidth:320,marginBottom:28 }}>
        This condition may require <strong style={{ color:"#fff" }}>immediate medical attention</strong>. Do not delay.
      </div>
      <a href="tel:112" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px 32px",borderRadius:14,background:"#fff",color:"#C62828",fontSize:18,fontWeight:700,textDecoration:"none",marginBottom:10,width:"100%",maxWidth:300,boxShadow:"0 0 32px rgba(255,255,255,0.25)" }}>
        📞 Call 112 — Emergency
      </a>
      <a href="tel:108" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 28px",borderRadius:12,background:"rgba(255,255,255,0.14)",color:"#fff",fontSize:16,fontWeight:600,textDecoration:"none",border:"2px solid rgba(255,255,255,0.35)",marginBottom:24,width:"100%",maxWidth:300 }}>
        🏥 Call 108 — Ambulance
      </a>
      <button onClick={onClose} style={{ ...F,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)",padding:"9px 22px",borderRadius:9,fontSize:13,cursor:"pointer" }}>
        I understand — Continue
      </button>
    </div>
  );
}

// ─── VOICE SECTION ─────────────────────────────────────────────────────────────
function VoiceSection({ depts, onEmergency }) {
  const [state, setState] = useState("idle"); // idle | listening | processing | result
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice not supported. Please use Chrome browser."); return; }
    setTranscript(""); setResult(null); setError("");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    recRef.current = rec;
    rec.onstart = () => setState("listening");
    rec.onresult = e => setTranscript(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onerror = () => { setError("Couldn't hear you. Try again."); setState("idle"); };
    rec.onend = () => setState(s => s === "listening" ? "processing" : s);
    rec.start();
  }, []);

  const stopListening = useCallback(() => recRef.current?.stop(), []);

  useEffect(() => {
    if (state !== "processing") return;
    if (!transcript.trim()) { setError("Nothing detected. Tap mic and speak clearly."); setState("idle"); return; }
    (async () => {
      try {
        const parsed = await callGroq(
          `Patient said: "${transcript}". Reply ONLY in valid JSON (no markdown):\n{"name":"likely condition","dept_key":"one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology","specialist":"doctor type","summary":"2-sentence explanation","needed":[{"test":"name","reason":"why"}],"immediate_action":"1-2 sentence action","is_serious":false}`
        );
        const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(transcript);
        setResult({ ...parsed, dept: depts[key] });
        if (parsed.is_serious || isSerious(transcript, parsed.name)) onEmergency(parsed.name || transcript);
        setState("result");
      } catch {
        setError("Analysis failed. Please try again.");
        setState("idle");
      }
    })();
  }, [state]);

  const reset = () => { setState("idle"); setTranscript(""); setResult(null); setError(""); };

  const micIcon = state === "listening" ? "⏹" : state === "processing" ? "◌" : "🎙";
  const micBg   = state === "listening" ? "linear-gradient(135deg,#FF5C6C,#FF8F6C)"
                : state === "processing" ? "linear-gradient(135deg,#FFB800,#E5A000)"
                : "linear-gradient(135deg,#8B8BFF,#5F5FDD)";

  return (
    <div>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <div style={{ fontSize:19,fontWeight:700,color:C.text,marginBottom:8 }}>Just speak. We diagnose.</div>
        <div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>Describe how you feel — AI analyzes instantly.</div>
      </div>

      {state !== "result" && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
          <button
            onClick={state === "listening" ? stopListening : startListening}
            style={{
              width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",
              background:micBg,
              boxShadow: state === "listening"
                ? "0 0 0 0 rgba(255,92,108,0.4),0 8px 28px rgba(255,92,108,0.35)"
                : "0 0 22px rgba(139,139,255,0.3),0 4px 14px rgba(0,0,0,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:28,transition:"all 0.3s",
              animation: state === "listening" ? "voicePulse 1.2s ease-in-out infinite" : "none",
              ...F,
            }}
          >
            <span style={{ display:"inline-block", animation: state==="processing" ? "spin 0.7s linear infinite" : "none" }}>
              {micIcon}
            </span>
          </button>

          {state === "listening" && (
            <div style={{ display:"flex",alignItems:"center",gap:3,height:32 }}>
              {Array.from({length:14}).map((_,i) => (
                <div key={i} style={{
                  width:3,borderRadius:3,background:"#FF5C6C",
                  animation:`waveBar${i%5} ${0.45+(i%5)*0.1}s ease-in-out infinite alternate`,
                  height:`${12+(i%7)*3}px`,
                }} />
              ))}
            </div>
          )}

          <div style={{ fontSize:13,color: state==="listening" ? C.red : C.muted,textAlign:"center",minHeight:20,transition:"color 0.3s" }}>
            {state==="idle" && "Tap mic and describe your symptoms"}
            {state==="listening" && "🔴 Listening… tap to stop"}
            {state==="processing" && "Analyzing your symptoms…"}
          </div>

          {transcript && (
            <div style={{ width:"100%",padding:"13px 15px",background:"rgba(13,18,30,0.7)",backdropFilter:"blur(12px)",border:"1px solid "+C.border,borderRadius:12,fontSize:13,color:C.muted,fontStyle:"italic",textAlign:"center",lineHeight:1.6 }}>
              "{transcript}"
            </div>
          )}
          {error && <div style={{ width:"100%",padding:"11px 14px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red,textAlign:"center" }}>{error}</div>}
        </div>
      )}

      {state === "result" && result && (
        <div style={{ animation:"fadeUp 0.3s ease" }}>
          {result.immediate_action && <ActionBox text={result.immediate_action} />}
          <div style={{ background:C.card,backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:18,overflow:"hidden",marginBottom:12 }}>
            <div style={{ padding:"18px 20px",borderBottom:"1px solid "+C.border }}>
              <SecLabel color={C.purple}>🎙 Voice Diagnosis</SecLabel>
              <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>{result.name}</div>
              <div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>{result.summary}</div>
            </div>
            <div style={{ padding:"18px 20px" }}>
              <SecLabel>Recommended Tests</SecLabel>
              {result.needed?.map((t,i) => (
                <div key={i} style={{ padding:"11px 13px",background:C.accentDim,border:"1px solid "+C.accent+"28",borderRadius:10,marginBottom:7 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.accentText,marginBottom:3 }}>{t.test}</div>
                  <div style={{ fontSize:12,color:C.muted }}>{t.reason}</div>
                </div>
              ))}
              <Divider />
              <SecLabel>Specialist</SecLabel>
              <div style={{ fontSize:13,color:C.text,padding:"8px 0",marginBottom:8 }}>{result.specialist}</div>
              {result.dept && (
                <AvailBadge ok={result.dept.available} label={result.dept.label} />
              )}
            </div>
          </div>
          <button onClick={reset} style={{ ...F,width:"100%",padding:"11px",background:"transparent",border:"1px solid "+C.border,borderRadius:12,color:C.muted,fontSize:13,cursor:"pointer",backdropFilter:"blur(10px)" }}>
            🎙 Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SMALL REUSABLE COMPONENTS ─────────────────────────────────────────────────
const SecLabel = ({ children, color }) => (
  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color: color || C.muted,marginBottom:10 }}>{children}</div>
);
const Divider = () => <div style={{ height:1,background:C.border,margin:"16px 0" }} />;
const AvailBadge = ({ ok, label }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,
    color: ok ? C.accentText : C.red,
    background: ok ? C.accentDim : C.redDim,
    border:"1px solid "+(ok ? C.accent : C.red)+"40",
    padding:"4px 11px",borderRadius:100 }}>
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
  if (!dept?.available) return (
    <div style={{ padding:"13px 15px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red }}>
      No specialist available. Contact reception.
    </div>
  );
  if (dept.doctors.length === 0) return (
    <div style={{ padding:"13px 15px",background:C.purpleDim,border:"1px solid "+C.purple+"40",borderRadius:10,fontSize:13,color:C.purple }}>
      🕐 Doctor info will be added soon.
    </div>
  );
  return (
    <>
      {dept.doctors.map((d,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom: i<dept.doctors.length-1?"1px solid "+C.border:"none",fontSize:14,color:C.text }}>
          👤 {d}
        </div>
      ))}
      {dept.slots && (
        <div style={{ marginTop:11,fontSize:12,color:C.accentText,background:C.accentDim,border:"1px solid "+C.accent+"40",padding:"5px 11px",borderRadius:7,display:"inline-flex",alignItems:"center",gap:6 }}>
          ⏰ {dept.slots}
        </div>
      )}
    </>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function MedMatch() {
  const [screen, setScreen]         = useState("home");
  const [mode, setMode]             = useState("voice");
  const [picked, setPicked]         = useState(null);
  const [symAnswers, setSymAnswers] = useState({});
  const [disease, setDisease]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [aiData, setAiData]         = useState(null);
  const [aiError, setAiError]       = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [emergency, setEmergency]   = useState(null);
  const resultRef = useRef(null);

  // Admin
  const [adminAuthed, setAdminAuthed]   = useState(false);
  const [adminPass, setAdminPass]       = useState("");
  const [adminError, setAdminError]     = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [editDept, setEditDept]         = useState(null);
  const [newDocName, setNewDocName]     = useState("");
  const [newSlots, setNewSlots]         = useState("");
  const [depts, setDepts] = useState(() => {
    try { const s = localStorage.getItem("mm_depts"); return s ? JSON.parse(s) : DEFAULT_DEPTS; }
    catch { return DEFAULT_DEPTS; }
  });

  const saveDepts = d => { setDepts(d); try { localStorage.setItem("mm_depts",JSON.stringify(d)); } catch {} };
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
  function saveSlots(key) {
    saveDepts({ ...depts, [key]: { ...depts[key], slots: newSlots } });
    flash("Slots updated.");
  }
  function toggleAvail(key) { saveDepts({ ...depts, [key]: { ...depts[key], available: !depts[key].available } }); }
  function flash(msg) { setAdminSuccess(msg); setTimeout(() => setAdminSuccess(""), 2500); }

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
        @keyframes voicePulse{0%{box-shadow:0 0 0 0px rgba(255,92,108,0.5),0 8px 28px rgba(255,92,108,0.35);}100%{box-shadow:0 0 0 18px rgba(255,92,108,0),0 8px 28px rgba(255,92,108,0.35);}}
        @keyframes waveBar0{from{transform:scaleY(0.3);}to{transform:scaleY(1);}}
        @keyframes waveBar1{from{transform:scaleY(0.5);}to{transform:scaleY(0.2);}}
        @keyframes waveBar2{from{transform:scaleY(0.8);}to{transform:scaleY(0.3);}}
        @keyframes waveBar3{from{transform:scaleY(0.2);}to{transform:scaleY(1);}}
        @keyframes waveBar4{from{transform:scaleY(0.6);}to{transform:scaleY(0.2);}}
        .answer-pill{cursor:pointer;transition:all 0.13s;}.answer-pill:hover{transform:translateY(-1px);}
        .admin-corner{position:fixed;bottom:22px;right:22px;z-index:100;}
        .admin-corner-btn{width:44px;height:44px;border-radius:50%;background:rgba(19,23,32,0.9);border:1px solid #2E3A4F;color:${C.gold};font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,0.45);transition:all 0.2s;backdrop-filter:blur(12px);font-family:'DM Sans',system-ui,sans-serif;}
        .admin-corner-btn:hover{background:rgba(255,184,0,0.1);border-color:rgba(255,184,0,0.5);transform:scale(1.08);}
      `}</style>

      {emergency && <EmergencyOverlay name={emergency} onClose={() => setEmergency(null)} />}

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
              { label:"Hospital Staff", sub:"Dept. availability & doctors",  onClick:()=>setScreen("hospital"), emoji:"🏥", clr:"rgba(139,139,255,0.12)", bdr:"rgba(139,139,255,0.22)" },
            ].map((c,i) => (
              <div key={i} className="home-card" onClick={c.onClick} style={{ background:C.card,backdropFilter:"blur(18px)",border:`1px solid ${c.bdr}`,borderRadius:20,padding:"24px 16px 22px",cursor:"pointer",textAlign:"center",transition:"all 0.22s" }}>
                <div style={{ width:56,height:56,borderRadius:"50%",background:c.clr,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px",fontSize:24 }}>{c.emoji}</div>
                <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:4 }}>{c.label}</div>
                <div style={{ fontSize:12,color:C.muted,lineHeight:1.45 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:"13px 18px",background:C.card,backdropFilter:"blur(18px)",border:"1px solid "+C.border,borderRadius:14,display:"flex",justifyContent:"space-around",textAlign:"center" }}>
            {[["10",C.accentText,"Depts"],["Voice AI",C.purple,"Diagnosis"],["24/7",C.blue,"Available"]].map(([n,clr,l],i) => (
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
            {[["voice","🎙","Voice AI"],["symptom","⚕","Symptoms"],["disease","📝","Condition"]].map(([v,ico,lbl]) => (
              <button key={v} onClick={() => { setMode(v); resetPatient(); }} style={{ ...F,flexShrink:0,padding:"9px 15px",borderRadius:11,border:"1px solid "+(mode===v?C.accent+"55":C.border),cursor:"pointer",fontSize:13,fontWeight:mode===v?600:400,background:mode===v?C.accentDim:"rgba(13,18,30,0.6)",color:mode===v?C.accentText:C.muted,backdropFilter:"blur(10px)",transition:"all 0.17s",display:"flex",alignItems:"center",gap:6 }}>
                {ico} {lbl}
              </button>
            ))}
          </div>

          {/* VOICE */}
          {mode === "voice" && <VoiceSection depts={depts} onEmergency={setEmergency} />}

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
                  {/* Follow-ups */}
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
                        <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{HOSPITAL_NAME}</div>
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
                style={{ ...F,width:"100%",padding:"13px",marginTop:10,background:loading||!disease.trim()?"#2A3042":"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:12,color:loading||!disease.trim()?C.muted:"#fff",fontSize:14,fontWeight:600,cursor:loading||!disease.trim()?"not-allowed":"pointer",transition:"all 0.18s",boxShadow:!loading&&disease.trim()?"0 4px 18px rgba(0,212,170,0.28)":"none" }}>
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
        </div>
      )}

      {/* ══ HOSPITAL ══ */}
      {screen === "hospital" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"34px 22px 100px" }} className="fade-up">
          <h2 style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.5px",marginBottom:4 }}>{HOSPITAL_NAME}</h2>
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
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"34px 22px 100px" }} className="fade-up">
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
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                <h2 style={{ fontSize:21,fontWeight:700 }}>Admin Panel</h2>
                <button onClick={()=>{setAdminAuthed(false);setAdminPass("");setEditDept(null);}}
                  style={{ ...F,fontSize:12,color:C.red,background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:7,padding:"5px 11px",cursor:"pointer" }}>Logout</button>
              </div>
              <p style={{ fontSize:13,color:C.muted,marginBottom:20 }}>Manage doctors and availability</p>
              {adminSuccess&&<div style={{ marginBottom:13,padding:"11px 15px",background:C.accentDim,border:"1px solid "+C.accent+"40",borderRadius:9,fontSize:13,color:C.accentText }}>✓ {adminSuccess}</div>}

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
                              <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",background:"rgba(13,18,30,0.5)",borderRadius:9,marginBottom:5,border:"1px solid "+C.border }}>
                                <div style={{ display:"flex",alignItems:"center",gap:9,fontSize:13,color:C.text }}>👤 {doc}</div>
                                <button onClick={()=>removeDoctor(key,i)} style={{ ...F,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,padding:"2px 5px",borderRadius:5 }}>×</button>
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
