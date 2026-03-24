import { useState, useRef, useEffect } from "react";

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

const SERIOUS_CONDITIONS = [
  "heart attack","myocardial infarction","stroke","cardiac arrest","pulmonary embolism",
  "aortic aneurysm","sepsis","anaphylaxis","meningitis","severe chest pain",
  "subarachnoid hemorrhage","eclampsia","respiratory failure","diabetic ketoacidosis",
  "acute kidney failure","internal bleeding","severe allergic","epiglottitis",
  "testicular torsion","ruptured appendix","acute appendicitis","ectopic pregnancy",
  "spinal cord injury","brain tumor","acute liver failure","blood clot","dvt",
  "leukemia","lymphoma","cancer","tumor","malignant","overdose","poisoning",
  "unconscious","unresponsive","seizure","epilepsy"
];

function isSerious(text, aiName = "") {
  const combined = (text + " " + aiName).toLowerCase();
  return SERIOUS_CONDITIONS.some(k => combined.includes(k));
}

const SYMPTOMS = [
  { id:"chest",  label:"Chest Pain",         icon:"🫀", dept:"cardiology",       tests:["ECG","Troponin Blood Test","Echocardiogram","Lipid Profile"],         followUps:[{q:"Severity? (1–10)",options:["1–3 Mild","4–6 Moderate","7–10 Severe"]},{q:"Spreads to arm/jaw/back?",options:["Yes","No","Not sure"]},{q:"Shortness of breath?",options:["Yes","No"]},{q:"How long?",options:["Just started","Few hours","Days","Weeks+"]}], immediateAction:"Sit/lie comfortably. Avoid exertion. If severe or spreading to arm/jaw — call emergency." },
  { id:"head",   label:"Headache/Dizziness",  icon:"🧠", dept:"neurology",        tests:["MRI Brain","CT Scan Head","BP Check","EEG"],                          followUps:[{q:"Type of headache?",options:["Throbbing","Pressure","Sharp/stabbing","Dull ache"]},{q:"Location?",options:["Front","Back of head","One side","Whole head"]},{q:"Vision changes or nausea?",options:["Yes","No"]},{q:"How long?",options:["Minutes","Hours","Days","On and off"]}], immediateAction:"Rest in a dark, quiet room. Hydrate. If 'worst headache ever' or sudden onset — seek emergency." },
  { id:"breath", label:"Breathlessness",      icon:"🫁", dept:"pulmonology",      tests:["Chest X-Ray","Spirometry","ABG Test","Sputum Culture"],               followUps:[{q:"When does it occur?",options:["At rest","Light activity","Heavy exertion","Lying flat"]},{q:"Wheezing or tightness?",options:["Yes","No"]},{q:"Cough or fever?",options:["With cough","With fever","Both","Neither"]},{q:"How long?",options:["Just started","Days","Weeks","Months+"]}], immediateAction:"Sit upright, breathe slowly through pursed lips. If lips/fingertips turn blue — call emergency." },
  { id:"stomach",label:"Stomach/Acidity",    icon:"🫃", dept:"gastroenterology", tests:["Ultrasound Abdomen","H. Pylori Test","LFT","Endoscopy"],              followUps:[{q:"Pain location?",options:["Upper abdomen","Lower abdomen","Right side","Left side"]},{q:"Vomiting or nausea?",options:["Yes, with blood","Yes, no blood","No"]},{q:"Stool changes?",options:["Dark/tarry","Loose","Normal"]},{q:"Relation to meals?",options:["Worse after eating","Better after eating","No relation"]}], immediateAction:"Avoid spicy/fatty food. Eat small meals. If blood in vomit/stool — emergency immediately." },
  { id:"joint",  label:"Joint/Back Pain",    icon:"🦴", dept:"orthopedics",      tests:["X-Ray","MRI Joint","CRP & ESR","RA Factor"],                          followUps:[{q:"Area affected?",options:["Knee","Back/spine","Shoulder","Hip/ankle"]},{q:"Injury or fall?",options:["Yes","No, gradual"]},{q:"Swelling or redness?",options:["Yes","No"]},{q:"Movement affected?",options:["Can't move","Limited","Painful but functional"]}], immediateAction:"Rest. Ice pack (wrapped) 20 min at a time. If snap sound occurred — seek urgent care." },
  { id:"kidney", label:"Swelling/Urination", icon:"🫘", dept:"nephrology",       tests:["Serum Creatinine","eGFR","Urine Test","Renal Ultrasound"],             followUps:[{q:"Main issue?",options:["Leg/face swelling","Frequent urination","Burning urination","Little/no urine"]},{q:"Blood in urine?",options:["Yes","No"]},{q:"Flank/lower back pain?",options:["Yes","No"]},{q:"How long?",options:["Today","Few days","Weeks","Months"]}], immediateAction:"Drink water unless severe swelling. Avoid salty food. If urine stops or blood in urine — seek care today." },
  { id:"sugar",  label:"Sugar/Thyroid",      icon:"🔬", dept:"endocrinology",    tests:["HbA1c","Fasting Blood Sugar","TSH / T3 / T4","Lipid Profile"],        followUps:[{q:"Main concern?",options:["High blood sugar","Low blood sugar","Thyroid","Weight changes"]},{q:"Excessive thirst/urination?",options:["Both","Only thirst","Only urination","No"]},{q:"Unusual fatigue?",options:["Yes, very","Somewhat","No"]},{q:"Family history?",options:["Diabetes","Thyroid","Both","None"]}], immediateAction:"If low sugar (shaking, sweating): eat fast sugar now. For high sugar + unwell — seek care today." },
  { id:"lump",   label:"Lump/Weight Loss",   icon:"🔴", dept:"oncology",         tests:["CECT Scan","PET Scan","Tumor Markers","Biopsy"],                       followUps:[{q:"Lump nature?",options:["Hard & immovable","Soft & movable","Painful","No pain"]},{q:"How long?",options:["<1 month","1–3 months","3–6 months","6+ months"]},{q:"Unexplained weight loss?",options:["Yes – significant","Slight","No change"]},{q:"Night sweats or fever?",options:["Yes","No"]}], immediateAction:"Don't squeeze/massage the lump. Any lump >2 weeks with weight loss warrants urgent evaluation." },
];

const DEPT_KEYS = Object.keys(HOSPITAL.departments);

function matchDept(text) {
  const t = text.toLowerCase();
  const map = {
    cardiology:["heart","cardiac","hypertension","bp","blood pressure","cholesterol","angina"],
    neurology:["brain","stroke","epilepsy","seizure","migraine","nerve","parkinson","vertigo"],
    pulmonology:["lung","asthma","copd","bronchitis","pneumonia","tb","respiratory"],
    gastroenterology:["stomach","liver","gut","ibs","ulcer","acid","gerd","hepatitis","bowel"],
    orthopedics:["bone","joint","fracture","arthritis","spine","knee","shoulder"],
    nephrology:["kidney","renal","dialysis","ckd","urinary","uti"],
    endocrinology:["diabetes","thyroid","insulin","sugar","pcos","hormones","obesity"],
    oncology:["cancer","tumor","malignant","lymphoma","leukemia","biopsy"],
    dermatology:["skin","rash","acne","eczema","psoriasis","itching","fungal"],
  };
  for (const [dept, kws] of Object.entries(map)) {
    if (kws.some(k => t.includes(k))) return dept;
  }
  return "general_medicine";
}

const C = {
  bg:"#080A0F", surface:"#0F1117", card:"#141720", border:"#1E2130",
  borderHover:"#2E3250", accent:"#5EEAD4", accentDim:"#5EEAD415",
  accentText:"#2DD4BF", red:"#F87171", redDim:"#F8717115",
  text:"#F0F2F8", muted:"#5A6080", muted2:"#2A2E45",
  purple:"#818CF8", purpleDim:"#818CF815", gold:"#FBBF24", goldDim:"#FBBF2415",
};

const fontStyle = { fontFamily: "'DM Sans', system-ui, sans-serif" };

function EmergencyOverlay({ conditionName, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(180,0,0,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"emergPulse 1.2s ease-in-out infinite alternate",padding:"32px 24px",textAlign:"center" }}>
      <div style={{ fontSize:72,marginBottom:16,animation:"emergBounce 0.6s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",marginBottom:12,lineHeight:1.2 }}>Emergency Alert</div>
      <div style={{ fontSize:16,color:"#FFCDD2",marginBottom:8,fontWeight:500 }}>Possible serious condition detected:</div>
      <div style={{ fontSize:20,fontWeight:800,color:"#FFEB3B",marginBottom:28,textTransform:"uppercase",letterSpacing:"0.04em" }}>{conditionName}</div>
      <div style={{ fontSize:15,color:"#FFCDD2",lineHeight:1.7,maxWidth:360,marginBottom:36 }}>
        This condition may require <strong style={{ color:"#fff" }}>immediate medical attention</strong>. Do not delay — please call emergency services right away.
      </div>
      <a href="tel:112" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"18px 40px",borderRadius:16,background:"#fff",color:"#C62828",fontSize:20,fontWeight:900,textDecoration:"none",boxShadow:"0 0 40px rgba(255,255,255,0.3)",marginBottom:16,width:"100%",maxWidth:320 }}>
        📞 Call 112 — Emergency
      </a>
      <a href="tel:108" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"14px 32px",borderRadius:14,background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:16,fontWeight:700,textDecoration:"none",border:"2px solid rgba(255,255,255,0.4)",marginBottom:28,width:"100%",maxWidth:320 }}>
        🏥 Call 108 — Ambulance
      </a>
      <button onClick={onClose} style={{ ...fontStyle,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)",padding:"10px 28px",borderRadius:10,fontSize:13,cursor:"pointer",fontWeight:500 }}>
        I understand — Continue reading
      </button>
    </div>
  );
}

// ─── Animated Home ───────────────────────────────────────────────────────────
function AnimatedHome({ onPatient, onStaff }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const floatStyle = (delay, x, y, size, opacity) => ({
    position:"absolute", width:size, height:size, borderRadius:"50%",
    background:`radial-gradient(circle, ${C.accentText}${opacity} 0%, transparent 70%)`,
    animation:`float${Math.round(x)} ${6+delay}s ease-in-out infinite alternate`,
    left:`${x}%`, top:`${y}%`, pointerEvents:"none",
  });

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px 80px" }}>

      {/* Ambient blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={floatStyle(0, 10, 15, 300, "20")} />
        <div style={{ ...floatStyle(2, 70, 60, 400, "12"), background:`radial-gradient(circle, ${C.purple}20 0%, transparent 70%)` }} />
        <div style={floatStyle(1, 50, 5, 200, "15")} />
        {/* Grid lines */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={C.accentText} strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Hero badge */}
      <div style={{ opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(20px)", transition:"all 0.6s ease", textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:100, background:C.accentDim, border:`1px solid ${C.accentText}30`, marginBottom:24 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:C.accentText, animation:"pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:C.accentText }}>Medical Intelligence</span>
        </div>

        <h1 style={{ fontSize:"clamp(36px, 8vw, 52px)", fontWeight:800, letterSpacing:"-2px", lineHeight:1.1, color:C.text, marginBottom:16 }}>
          Know exactly<br />
          <span style={{ background:`linear-gradient(135deg, ${C.accentText}, ${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            what you need.
          </span>
        </h1>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.75, maxWidth:340, margin:"0 auto" }}>
          Find the right tests and doctors — without unnecessary costs or confusion.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, width:"100%", maxWidth:420, opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(30px)", transition:"all 0.7s ease 0.15s" }}>
        {/* Patient */}
        <HomeCard onClick={onPatient} delay="0.2s" gradient={`linear-gradient(135deg, ${C.accentText}20, ${C.accentText}05)`} borderColor={C.accentText} icon={
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="11" r="6" fill={C.accentText} opacity="0.9"/>
            <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={C.accentText} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <circle cx="26" cy="22" r="3" stroke={C.accentText} strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M23 22c-2 0-3-1-3-3" stroke={C.accentText} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
          </svg>
        } label="Patient" sub="Find tests & right doctor" iconBg={`linear-gradient(135deg, ${C.accentText}25, ${C.accentText}08)`} iconBorder={`${C.accentText}40`} />

        {/* Staff */}
        <HomeCard onClick={onStaff} delay="0.25s" gradient={`linear-gradient(135deg, ${C.purple}20, ${C.purple}05)`} borderColor={C.purple} icon={
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="13" cy="10" r="4.5" fill={C.purple} opacity="0.85"/>
            <circle cx="23" cy="10" r="4.5" fill={C.purple} opacity="0.55"/>
            <path d="M4 29c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={C.purple} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85"/>
            <path d="M22 20c2.21 0 4.24.9 5.7 2.35" stroke={C.purple} strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
            <rect x="22" y="21" width="10" height="12" rx="2" fill={`${C.purple}15`} stroke={`${C.purple}70`} strokeWidth="1.2"/>
            <line x1="24.5" y1="25" x2="29.5" y2="25" stroke={C.purple} strokeWidth="1" strokeLinecap="round"/>
            <line x1="24.5" y1="28" x2="29.5" y2="28" stroke={C.purple} strokeWidth="1" strokeLinecap="round"/>
          </svg>
        } label="Staff" sub="View dept. availability" iconBg={`linear-gradient(135deg, ${C.purple}25, ${C.purple}08)`} iconBorder={`${C.purple}40`} />
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:28, marginTop:36, opacity:visible?1:0, transition:"all 0.7s ease 0.35s" }}>
        {[["10+","Specialties"],["AI","Powered"],["Free","Always"]].map(([num, lbl]) => (
          <div key={lbl} style={{ textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:"-0.5px" }}>{num}</div>
            <div style={{ fontSize:10, color:C.muted, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:2 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeCard({ onClick, gradient, borderColor, icon, label, sub, iconBg, iconBorder, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? gradient : C.card,
        border: `1px solid ${hover ? borderColor+"60" : C.border}`,
        borderRadius:20, padding:"28px 20px 24px", cursor:"pointer", textAlign:"center",
        transition:"all 0.25s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover ? `0 16px 40px ${borderColor}15` : "none",
      }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:iconBg, border:`1.5px solid ${iconBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{sub}</div>
    </div>
  );
}

// ─── Voice Talk Component ─────────────────────────────────────────────────────
function VoiceTalk({ onResult, onClose }) {
  const [state, setState] = useState("idle"); // idle | listening | thinking | done
  const [transcript, setTranscript] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const recogRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);

  // Draw waveform animation
  useEffect(() => {
    if (state !== "listening") {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    async function startAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const audioCtx = new AudioContext();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        src.connect(analyser);
        analyserRef.current = analyser;
      } catch {}
    }
    startAudio();

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const bars = 32;
      const barW = W / bars - 2;
      const data = new Uint8Array(analyserRef.current?.frequencyBinCount || 0);
      if (analyserRef.current) analyserRef.current.getByteFrequencyData(data);

      for (let i = 0; i < bars; i++) {
        const val = data[i] || 0;
        const h = Math.max(4, (val / 255) * (H * 0.8) + Math.sin(Date.now()/300 + i) * 6);
        const x = i * (barW + 2);
        const y = (H - h) / 2;
        const alpha = 0.5 + (val / 255) * 0.5;
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 2);
        ctx.fill();
      }
    };
    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [state]);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Voice recognition not supported in this browser. Please use Chrome or Edge."); return; }
    setError(""); setTranscript(""); setAiResult(null);
    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.continuous = false;
    recog.interimResults = true;
    recog.onstart = () => setState("listening");
    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(text);
    };
    recog.onend = () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (transcript || recogRef.current?.finalText) {
        analyzeVoice(recogRef.current?.finalText || transcript);
      } else {
        setState("idle");
      }
    };
    recog.onerror = (e) => {
      setState("idle");
      if (e.error !== "aborted") setError("Could not detect voice. Please try again.");
    };
    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(text);
      if (e.results[e.results.length-1].isFinal) recogRef.current = { finalText: text };
    };
    recogRef.current = recog;
    recog.start();
  }

  function stopListening() {
    recogRef.current?.stop();
  }

  async function analyzeVoice(text) {
    if (!text?.trim()) { setState("idle"); return; }
    setState("thinking");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`Patient described their problem verbally: "${text}". You are a careful medical advisor. Reply ONLY in valid JSON with no markdown:\n{"condition":"short condition name","dept_key":"one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology","specialist":"doctor type","symptoms_detected":["symptom1","symptom2"],"urgency":"low|medium|high|emergency","advice":"one sentence immediate action","is_serious":true or false}`
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setAiResult(parsed);
      setState("done");
    } catch {
      setError("AI analysis failed. Please try again.");
      setState("idle");
    }
  }

  const urgencyColor = { low:C.accentText, medium:C.gold, high:C.red, emergency:"#FF0000" };
  const urgencyLabel = { low:"Low urgency", medium:"Moderate urgency", high:"High urgency — see doctor soon", emergency:"EMERGENCY — call 112 now" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,10,15,0.95)", backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <div style={{ width:"100%", maxWidth:400, textAlign:"center" }}>
        <button onClick={onClose} style={{ ...fontStyle, position:"absolute", top:24, right:24, background:C.card, border:`1px solid ${C.border}`, color:C.muted, width:36, height:36, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>✕</button>

        <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:C.accentText, marginBottom:12 }}>Voice Diagnosis</div>
        <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.8px", color:C.text, marginBottom:8 }}>Speak your problem</h2>
        <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:32 }}>
          Tap the mic and describe your symptoms in your own words. AI will analyze and guide you.
        </p>

        {/* Waveform canvas */}
        <div style={{ position:"relative", marginBottom:32, height:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {state === "listening" ? (
            <canvas ref={canvasRef} width={320} height={60} style={{ borderRadius:12 }} />
          ) : state === "thinking" ? (
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.accentText, animation:`dotPulse 1.2s ease-in-out ${i*0.15}s infinite` }} />
              ))}
              <span style={{ fontSize:13, color:C.muted, marginLeft:8 }}>Analyzing...</span>
            </div>
          ) : (
            <div style={{ height:40, display:"flex", alignItems:"center", gap:3 }}>
              {Array.from({length:32}).map((_, i) => (
                <div key={i} style={{ width:6, height:Math.random()*8+4, borderRadius:3, background:`${C.accentText}30` }} />
              ))}
            </div>
          )}
        </div>

        {/* Mic button */}
        {state !== "done" && (
          <button
            onClick={state === "idle" ? startListening : stopListening}
            style={{
              width:88, height:88, borderRadius:"50%", border:"none", cursor:"pointer",
              background: state === "listening"
                ? `radial-gradient(circle, ${C.red}, #C62828)`
                : `radial-gradient(circle, ${C.accentText}, #059669)`,
              boxShadow: state === "listening"
                ? `0 0 0 16px ${C.red}20, 0 0 0 32px ${C.red}10`
                : `0 0 0 12px ${C.accentText}15`,
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px",
              animation: state === "listening" ? "micPulse 1.5s ease-in-out infinite" : "none",
              transition:"all 0.3s ease",
            }}>
            {state === "listening"
              ? <svg width="32" height="32" viewBox="0 0 32 32" fill="white"><rect x="8" y="8" width="16" height="16" rx="2"/></svg>
              : <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="12" y="4" width="8" height="16" rx="4" fill="white"/>
                  <path d="M6 16a10 10 0 0020 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <line x1="16" y1="26" x2="16" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="11" y1="30" x2="21" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            }
          </button>
        )}

        <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>
          {state === "idle" && "Tap to start speaking"}
          {state === "listening" && "Listening... tap again to stop"}
          {state === "thinking" && "AI is diagnosing your condition"}
          {state === "done" && "Analysis complete"}
        </div>

        {/* Live transcript */}
        {transcript && state !== "done" && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 18px", marginBottom:20, textAlign:"left" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, marginBottom:8 }}>You said</div>
            <div style={{ fontSize:14, color:C.text, lineHeight:1.65 }}>{transcript}</div>
          </div>
        )}

        {error && (
          <div style={{ padding:"12px 16px", background:C.redDim, border:`1px solid ${C.red}40`, borderRadius:12, fontSize:13, color:C.red, marginBottom:16 }}>
            {error}
          </div>
        )}

        {/* AI Result */}
        {state === "done" && aiResult && (
          <div style={{ textAlign:"left", animation:"fadeUp 0.4s ease forwards" }}>
            <div style={{ padding:"12px 16px", background:C.card, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, marginBottom:6 }}>You said</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{transcript}</div>
            </div>

            <div style={{ padding:"18px 20px", background:C.accentDim, border:`1px solid ${C.accentText}30`, borderRadius:14, marginBottom:12 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>{aiResult.condition}</div>
              <div style={{ fontSize:12, color:C.muted }}>Refer to: {aiResult.specialist}</div>
            </div>

            {aiResult.symptoms_detected?.length > 0 && (
              <div style={{ padding:"14px 18px", background:C.card, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Symptoms detected</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {aiResult.symptoms_detected.map((s, i) => (
                    <span key={i} style={{ padding:"4px 10px", background:`${C.accentText}15`, border:`1px solid ${C.accentText}30`, borderRadius:100, fontSize:12, color:C.accentText }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding:"14px 18px", background: aiResult.urgency === "emergency" ? "#FF000020" : aiResult.urgency === "high" ? C.redDim : C.goldDim, border:`1px solid ${(urgencyColor[aiResult.urgency] || C.gold)}40`, borderRadius:14, marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:urgencyColor[aiResult.urgency], marginBottom:6 }}>
                {urgencyLabel[aiResult.urgency]}
              </div>
              <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{aiResult.advice}</div>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setState("idle"); setTranscript(""); setAiResult(null); }}
                style={{ ...fontStyle, flex:1, padding:"12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:12, color:C.muted, fontSize:13, cursor:"pointer" }}>
                Try again
              </button>
              <button onClick={() => onResult(aiResult, transcript)}
                style={{ ...fontStyle, flex:2, padding:"12px", background:`linear-gradient(135deg, ${C.accentText}, #059669)`, border:"none", borderRadius:12, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                See full diagnosis →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MedMatch() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("symptom");
  const [picked, setPicked] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [emergency, setEmergency] = useState(null);
  const [showVoice, setShowVoice] = useState(false);
  const resultRef = useRef(null);

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [depts, setDepts] = useState(() => {
    try { const s = localStorage.getItem("mm_depts"); return s ? JSON.parse(s) : HOSPITAL.departments; }
    catch { return HOSPITAL.departments; }
  });
  const [editDept, setEditDept] = useState(null);
  const [newDocName, setNewDocName] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  function saveDepts(updated) { setDepts(updated); try { localStorage.setItem("mm_depts", JSON.stringify(updated)); } catch {} }
  function reset() { setPicked(null); setDisease(""); setAiData(null); setError(""); setSymptomAnswers({}); }
  function adminLogin() { if (adminPass === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); } else { setAdminError("Incorrect password."); } }

  function addDoctor(deptKey) {
    if (!newDocName.trim()) return;
    const updated = { ...depts, [deptKey]: { ...depts[deptKey], doctors:[...depts[deptKey].doctors, newDocName.trim()], available:true } };
    saveDepts(updated); setNewDocName(""); setAdminSuccess("Doctor added."); setTimeout(() => setAdminSuccess(""), 2500);
  }
  function removeDoctor(deptKey, idx) {
    const doctors = depts[deptKey].doctors.filter((_,i) => i!==idx);
    saveDepts({ ...depts, [deptKey]: { ...depts[deptKey], doctors, available: doctors.length>0 } });
  }
  function saveSlots(deptKey) { saveDepts({ ...depts, [deptKey]: { ...depts[deptKey], slots:newSlots } }); setAdminSuccess("Slots updated."); setTimeout(()=>setAdminSuccess(""),2500); }
  function toggleAvail(deptKey) { saveDepts({ ...depts, [deptKey]: { ...depts[deptKey], available:!depts[deptKey].available } }); }

  const activeDepts = Object.values(depts).filter(d=>d.available).length;
  const totalDepts  = Object.keys(depts).length;
  const totalDocs   = Object.values(depts).reduce((a,d)=>a+d.doctors.length, 0);
  const pickedDept  = picked ? depts[picked.dept] : null;

  const Divider = () => <div style={{ height:1, background:C.border, margin:"20px 0" }} />;
  const Tag = ({ ok }) => (
    <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", padding:"4px 10px", borderRadius:100, background:ok?C.accentDim:C.redDim, color:ok?C.accentText:C.red, border:`1px solid ${ok?"#2DD4BF40":"#F8717140"}` }}>
      {ok ? "● Available" : "● Unavailable"}
    </span>
  );
  const SecLabel = ({ children }) => (
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:12 }}>{children}</div>
  );
  const DoctorList = ({ dept, deptKey, showFuture=true }) => (
    dept.available ? (
      dept.doctors.length > 0 ? (
        <>
          {dept.doctors.map((d,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<dept.doctors.length-1?`1px solid ${C.border}`:"none", fontSize:14, color:C.text }}>
              <span style={{ fontSize:16 }}>👤</span>{d}
            </div>
          ))}
          {dept.slots && <div style={{ marginTop:14, fontSize:12, color:C.accentText, background:C.accentDim, border:`1px solid ${C.accentText}40`, padding:"6px 12px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:6 }}>⏰ {dept.slots}</div>}
        </>
      ) : showFuture ? (
        <div style={{ padding:"14px 16px", background:C.purpleDim, border:`1px solid ${C.purple}40`, borderRadius:10, fontSize:13, color:C.purple, lineHeight:1.6 }}>
          🕐 Doctor information will be added in future updates.
        </div>
      ) : null
    ) : (
      <div style={{ padding:"14px 16px", background:C.redDim, border:`1px solid ${C.red}40`, borderRadius:10, fontSize:13, color:C.red }}>
        No specialist available. Contact reception for a referral.
      </div>
    )
  );

  async function analyze() {
    if (!disease.trim()) return;
    setLoading(true); setAiData(null); setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`Patient condition: "${disease}". You are an honest medical advisor protecting patients from unnecessary tests. Reply ONLY in valid JSON:\n{"name":"condition name","dept_key":"one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology","specialist":"doctor type","needed":[{"test":"name","reason":"why"}],"skip":[{"test":"name","reason":"why to skip"}],"advice":"one sentence","immediate_action":"1-2 sentence immediate step","is_serious":true or false}` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(disease);
      const result = { ...parsed, dept:depts[key], deptKey:key };
      setAiData(result);
      if (parsed.is_serious || isSerious(disease, parsed.name)) setEmergency(parsed.name || disease);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 120);
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  }

  // Handle voice result → populate disease tab
  function handleVoiceResult(voiceAI, spokenText) {
    setShowVoice(false);
    setScreen("patient");
    setMode("disease");
    setDisease(spokenText);
    // Auto trigger full analysis
    setTimeout(async () => {
      setLoading(true); setAiData(null); setError("");
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            messages:[{ role:"user", content:`Patient described verbally: "${spokenText}". Reply ONLY in valid JSON:\n{"name":"condition name","dept_key":"one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology","specialist":"doctor type","needed":[{"test":"name","reason":"why"}],"skip":[{"test":"name","reason":"why to skip"}],"advice":"one sentence","immediate_action":"1-2 sentence","is_serious":true or false}` }]
          })
        });
        const data = await res.json();
        const raw = data.content?.[0]?.text || "";
        const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
        const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(spokenText);
        setAiData({ ...parsed, dept:depts[key], deptKey:key });
        if (parsed.is_serious || isSerious(spokenText, parsed.name)) setEmergency(parsed.name || spokenText);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 200);
      } catch { setError("Analysis failed. Please try again."); }
      setLoading(false);
    }, 300);
  }

  const isEmergencyScreen = !!emergency;

  return (
    <div style={{ ...fontStyle, minHeight:"100vh", background:isEmergencyScreen?"#7f0000":C.bg, color:C.text, transition:"background 0.6s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
        textarea:focus, input:focus { outline:none !important; border-color:${C.accentText} !important; box-shadow:0 0 0 3px ${C.accentDim} !important; }
        .sym-card:hover { border-color:${C.accentText} !important; background:${C.accentDim} !important; transform:translateY(-2px); }
        .dept-card:hover { border-color:${C.borderHover} !important; }
        .admin-row:hover { background:${C.surface} !important; }
        .answer-pill:hover { transform:translateY(-1px); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 0.8s linear infinite; display:inline-block; }
        @keyframes emergPulse { from{background:rgba(180,0,0,0.95)} to{background:rgba(220,0,0,1)} }
        @keyframes emergBounce { from{transform:scale(1)} to{transform:scale(1.1)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 16px ${C.red}20,0 0 0 32px ${C.red}10} 50%{box-shadow:0 0 0 20px ${C.red}15,0 0 0 40px ${C.red}08} }
        @keyframes dotPulse { 0%,100%{transform:scale(0.7);opacity:0.4} 50%{transform:scale(1.2);opacity:1} }
        @keyframes float10 { from{transform:translate(0,0) scale(1)} to{transform:translate(20px,-30px) scale(1.05)} }
        @keyframes float70 { from{transform:translate(0,0) scale(1)} to{transform:translate(-25px,20px) scale(0.95)} }
        @keyframes float50 { from{transform:translate(0,0)} to{transform:translate(15px,25px)} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .admin-corner { position:fixed; bottom:22px; right:22px; z-index:100; }
        .admin-corner-btn { width:44px;height:44px;border-radius:50%;background:#141720;border:1px solid #1E2130;color:#FBBF24;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:all 0.2s; }
        .admin-corner-btn:hover { background:#FBBF2418;border-color:#FBBF2460;transform:scale(1.08); }
        .voice-fab { position:fixed;bottom:76px;right:22px;z-index:100; }
        .voice-fab-btn { width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${C.accentText},#059669);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px ${C.accentText}40;transition:all 0.25s; }
        .voice-fab-btn:hover { transform:scale(1.1);box-shadow:0 8px 32px ${C.accentText}60; }
      `}</style>

      {emergency && <EmergencyOverlay conditionName={emergency} onClose={() => setEmergency(null)} />}
      {showVoice && <VoiceTalk onResult={handleVoiceResult} onClose={() => setShowVoice(false)} />}

      {/* NAV */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px", borderBottom:`1px solid ${isEmergencyScreen?"#ff000040":C.border}`, position:"sticky", top:0, zIndex:50, background:isEmergencyScreen?"rgba(100,0,0,0.9)":C.bg+"EE", backdropFilter:"blur(20px)", transition:"all 0.6s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg, ${C.accentText}, #059669)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff" }}>+</div>
          <span style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.5px", color:C.text }}>MedMatch</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {screen === "home" && (
            <button onClick={() => setShowVoice(true)}
              style={{ ...fontStyle, display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:100, background:C.accentDim, border:`1px solid ${C.accentText}40`, color:C.accentText, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
              🎙️ Voice
            </button>
          )}
          {screen !== "home" && (
            <button onClick={() => { setScreen("home"); reset(); setEditDept(null); setAdminAuthed(false); setAdminPass(""); }}
              style={{ ...fontStyle, fontSize:13, color:C.muted, cursor:"pointer", background:"none", border:"none", display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, transition:"color 0.15s" }}>
              ← Home
            </button>
          )}
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <AnimatedHome onPatient={() => setScreen("patient")} onStaff={() => setScreen("hospital")} />
      )}

      {/* PATIENT */}
      {screen === "patient" && (
        <div style={{ maxWidth:480, margin:"0 auto", padding:"36px 24px 120px" }} className="fade-up">
          <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.7px", marginBottom:4 }}>Your Health Check</h2>
          <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Choose how you'd like to proceed</p>

          {/* Tabs */}
          <div style={{ display:"flex", background:C.surface, borderRadius:14, padding:4, marginBottom:24, gap:4, border:`1px solid ${C.border}` }}>
            {[["symptom","🩺 By Symptoms"],["disease","💬 I Know My Condition"],["voice","🎙️ Voice Talk"]].map(([val, lbl]) => (
              <button key={val} onClick={() => { if(val==="voice") { setShowVoice(true); } else { setMode(val); reset(); } }}
                style={{ ...fontStyle, flex:1, padding:"9px 4px", borderRadius:10, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                  background: mode===val && val!=="voice" ? C.card : "transparent",
                  color: mode===val && val!=="voice" ? C.text : C.muted,
                  boxShadow: mode===val && val!=="voice" ? "0 1px 6px rgba(0,0,0,0.4)" : "none",
                  transition:"all 0.18s" }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* SYMPTOM MODE */}
          {mode === "symptom" && (
            <>
              <p style={{ fontSize:13, color:C.muted, marginBottom:14 }}>Select what's bothering you</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {SYMPTOMS.map(s => {
                  const isSel = picked?.id === s.id;
                  return (
                    <div key={s.id} className={isSel?"":"sym-card"}
                      onClick={() => { setPicked(s); setSymptomAnswers({}); setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100); }}
                      style={{ background:isSel?C.accentDim:C.card, border:`1px solid ${isSel?C.accentText:C.border}`, borderRadius:14, padding:"16px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all 0.2s" }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>{s.icon}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:isSel?C.accentText:C.text, lineHeight:1.35 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:24 }}>
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"20px 22px", marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.accentText, marginBottom:16 }}>Tell us more</div>
                    {picked.followUps.map((fq, qi) => (
                      <div key={qi} style={{ marginBottom:16 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:8 }}>{fq.q}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {fq.options.map((opt, oi) => {
                            const isChosen = symptomAnswers[qi] === oi;
                            return (
                              <div key={oi} className="answer-pill"
                                onClick={() => setSymptomAnswers(prev => ({ ...prev, [qi]:oi }))}
                                style={{ padding:"7px 13px", borderRadius:100, background:isChosen?C.accentDim:C.surface, border:`1px solid ${isChosen?C.accentText:C.border}`, color:isChosen?C.accentText:C.muted, fontSize:12, fontWeight:isChosen?600:400, cursor:"pointer", transition:"all 0.15s" }}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {picked.immediateAction && (
                    <div style={{ padding:"14px 18px", background:"#78350F18", border:"1px solid #92400E50", borderRadius:14, marginBottom:14, display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#F59E0B", marginBottom:6 }}>Immediate Action</div>
                        <div style={{ fontSize:13, color:"#FCD34D", lineHeight:1.65 }}>{picked.immediateAction}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
                    <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{pickedDept.label}</div>
                        <div style={{ fontSize:12, color:C.muted }}>{HOSPITAL.name}</div>
                      </div>
                      <Tag ok={pickedDept.available} />
                    </div>
                    <div style={{ padding:"20px 24px" }}>
                      <SecLabel>Recommended Tests</SecLabel>
                      {picked.tests.map((t,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:i<picked.tests.length-1?`1px solid ${C.border}`:"none" }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:C.accentText, flexShrink:0 }} />
                          <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{t}</span>
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

          {/* DISEASE / CONDITION MODE — simplified */}
          {mode === "disease" && (
            <>
              {/* Voice shortcut banner */}
              <div onClick={() => setShowVoice(true)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:C.accentDim, border:`1px solid ${C.accentText}30`, borderRadius:14, marginBottom:20, cursor:"pointer", transition:"all 0.2s" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg, ${C.accentText}, #059669)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🎙️</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.accentText }}>Prefer to speak?</div>
                  <div style={{ fontSize:11, color:C.muted }}>Tap here to describe your problem by voice</div>
                </div>
                <span style={{ color:C.accentText, marginLeft:"auto", fontSize:18 }}>→</span>
              </div>

              <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>Type your condition or what's wrong</div>
              <textarea
                value={disease}
                onChange={e => setDisease(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); analyze(); } }}
                placeholder="e.g. Chest pain for 2 hours with sweating — or — Type 2 diabetes, HbA1c 8.2, on Metformin..."
                style={{ ...fontStyle, width:"100%", padding:"14px 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, fontSize:14, color:C.text, resize:"none", minHeight:100, lineHeight:1.65, transition:"border-color 0.2s, box-shadow 0.2s" }}
              />
              <button onClick={analyze} disabled={loading || !disease.trim()}
                style={{ ...fontStyle, width:"100%", padding:"14px", marginTop:10, background:loading||!disease.trim()?C.muted2:`linear-gradient(135deg, ${C.accentText}, #059669)`, border:"none", borderRadius:12, color:loading||!disease.trim()?C.muted:"#fff", fontSize:14, fontWeight:600, cursor:loading||!disease.trim()?"not-allowed":"pointer", transition:"all 0.2s" }}>
                {loading ? <span><span className="spin">◌</span>&nbsp;Analyzing...</span> : "Analyze & find what you need →"}
              </button>
              <div style={{ marginTop:12, padding:"11px 14px", background:"#78350F18", border:"1px solid #92400E40", borderRadius:10, fontSize:12, color:"#D97706", lineHeight:1.6 }}>
                💡 If a hospital suggests extra tests, ask your doctor to justify each one first.
              </div>

              {error && <div style={{ marginTop:12, padding:"12px 16px", background:C.redDim, border:`1px solid ${C.red}40`, borderRadius:10, fontSize:13, color:C.red }}>{error}</div>}

              {aiData && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:24 }}>
                  {aiData.immediate_action && (
                    <div style={{ padding:"14px 18px", background:"#78350F18", border:"1px solid #92400E50", borderRadius:14, marginBottom:14, display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#F59E0B", marginBottom:6 }}>Immediate Action</div>
                        <div style={{ fontSize:13, color:"#FCD34D", lineHeight:1.65 }}>{aiData.immediate_action}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
                    <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                      <div>
                        <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{aiData.name}</div>
                        <div style={{ fontSize:12, color:C.muted }}>Specialist: {aiData.specialist}</div>
                      </div>
                      <Tag ok={aiData.dept.available} />
                    </div>
                    <div style={{ padding:"20px 24px" }}>
                      <SecLabel>Tests you need</SecLabel>
                      {aiData.needed?.map((t,i) => (
                        <div key={i} style={{ padding:"13px 16px", background:C.accentDim, border:`1px solid ${C.accentText}30`, borderRadius:11, marginBottom:8 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:C.accentText, marginBottom:4 }}>{t.test}</div>
                          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{t.reason}</div>
                        </div>
                      ))}
                      {aiData.skip?.length > 0 && (
                        <>
                          <Divider />
                          <SecLabel>Question or skip these</SecLabel>
                          {aiData.skip.map((t,i) => (
                            <div key={i} style={{ padding:"13px 16px", background:C.redDim, border:`1px solid ${C.red}30`, borderRadius:11, marginBottom:8 }}>
                              <div style={{ fontSize:14, fontWeight:600, color:C.red, marginBottom:4 }}>✕ {t.test}</div>
                              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{t.reason}</div>
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
                          <div style={{ padding:"14px 16px", background:"#1E3A5F30", border:"1px solid #3B82F640", borderRadius:11, fontSize:13, color:"#93C5FD", lineHeight:1.65 }}>
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
        <div style={{ maxWidth:480, margin:"0 auto", padding:"36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.7px", marginBottom:4 }}>{HOSPITAL.name}</h2>
          <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Live department availability</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:24 }}>
            {[{num:activeDepts,label:"Active",color:C.accentText},{num:totalDepts-activeDepts,label:"Unavailable",color:C.red},{num:totalDocs,label:"Doctors",color:C.purple}].map((s,i) => (
              <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 12px", textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-1px", lineHeight:1 }}>{s.num}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:6, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {Object.entries(depts).map(([key,d]) => {
              const isOpen = expandedDept === key;
              return (
                <div key={key} className={d.available?"dept-card":""}
                  onClick={() => d.available && setExpandedDept(isOpen?null:key)}
                  style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:16, cursor:d.available?"pointer":"default", transition:"all 0.18s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.3 }}>{d.label}</span>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:d.available?C.accentText:C.red, display:"inline-block", marginTop:3, flexShrink:0, boxShadow:d.available?`0 0 6px ${C.accentText}80`:"none" }} />
                  </div>
                  <div style={{ fontSize:11, color:d.available?C.accentText:C.red, fontWeight:500, marginBottom:isOpen?10:0 }}>
                    {d.available?(d.doctors.length>0?`${d.doctors.length} doctor${d.doctors.length!==1?"s":""}`:"Coming soon"):"Unavailable"}
                  </div>
                  {d.available && isOpen && (
                    <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                      {d.doctors.length>0?d.doctors.map((doc,i) => (
                        <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:3, display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ color:C.muted2 }}>–</span>{doc}
                        </div>
                      )):(
                        <div style={{ fontSize:11, color:C.purple }}>🕐 Doctor info coming soon</div>
                      )}
                      {d.slots && <div style={{ fontSize:11, color:C.accentText, marginTop:8 }}>⏰ {d.slots}</div>}
                    </div>
                  )}
                  {d.available && <div style={{ fontSize:10, color:C.muted2, marginTop:8, fontWeight:500 }}>{isOpen?"↑ less":"↓ details"}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADMIN */}
      {screen === "admin" && (
        <div style={{ maxWidth:480, margin:"0 auto", padding:"36px 24px 100px" }} className="fade-up">
          {!adminAuthed ? (
            <>
              <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.6px", marginBottom:6 }}>Admin Panel</h2>
              <p style={{ fontSize:13, color:C.muted, marginBottom:28 }}>Enter password to continue</p>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 24px" }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Password</div>
                <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()} placeholder="Enter admin password"
                  style={{ ...fontStyle, width:"100%", padding:"13px 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, fontSize:14, color:C.text }} />
                {adminError && <div style={{ marginTop:10, fontSize:13, color:C.red }}>{adminError}</div>}
                <button onClick={adminLogin} style={{ ...fontStyle, width:"100%", padding:13, marginTop:14, background:"linear-gradient(135deg, #F59E0B, #D97706)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>Login →</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <h2 style={{ fontSize:22, fontWeight:700 }}>Admin Panel</h2>
                <button onClick={() => { setAdminAuthed(false); setAdminPass(""); setEditDept(null); }} style={{ ...fontStyle, fontSize:12, color:C.red, background:C.redDim, border:`1px solid ${C.red}40`, borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>Logout</button>
              </div>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Manage doctors and department availability</p>
              {adminSuccess && <div style={{ marginBottom:16, padding:"12px 16px", background:C.accentDim, border:`1px solid ${C.accentText}40`, borderRadius:10, fontSize:13, color:C.accentText }}>✓ {adminSuccess}</div>}
              {Object.entries(depts).map(([key,d]) => {
                const isEditing = editDept === key;
                return (
                  <div key={key} style={{ background:C.card, border:`1px solid ${isEditing?"#F59E0B40":C.border}`, borderRadius:16, marginBottom:10, overflow:"hidden" }}>
                    <div className="admin-row" style={{ padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={() => setEditDept(isEditing?null:key)}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:d.available?C.accentText:C.red, display:"inline-block" }} />
                        <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{d.label}</span>
                        <span style={{ fontSize:11, color:C.muted }}>{d.doctors.length} doctor{d.doctors.length!==1?"s":""}</span>
                      </div>
                      <span style={{ fontSize:18, color:C.muted }}>{isEditing?"↑":"↓"}</span>
                    </div>
                    {isEditing && (
                      <div style={{ borderTop:`1px solid ${C.border}`, padding:"20px 18px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                          <span style={{ fontSize:13, color:C.muted }}>Department availability</span>
                          <button onClick={() => toggleAvail(key)} style={{ ...fontStyle, padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:d.available?C.redDim:C.accentDim, color:d.available?C.red:C.accentText }}>
                            {d.available?"Mark Unavailable":"Mark Available"}
                          </button>
                        </div>
                        {d.doctors.length>0 && (
                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Current Doctors</div>
                            {d.doctors.map((doc,i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:C.surface, borderRadius:10, marginBottom:6, border:`1px solid ${C.border}` }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:C.text }}><span>👤</span>{doc}</div>
                                <button onClick={() => removeDoctor(key,i)} style={{ ...fontStyle, background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:18 }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ marginBottom:18 }}>
                          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Add Doctor</div>
                          <div style={{ display:"flex", gap:8 }}>
                            <input value={newDocName} onChange={e=>setNewDocName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDoctor(key)} placeholder="Dr. Full Name"
                              style={{ ...fontStyle, flex:1, padding:"11px 14px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.text }} />
                            <button onClick={() => addDoctor(key)} style={{ ...fontStyle, padding:"11px 18px", background:`linear-gradient(135deg, ${C.accentText}, #059669)`, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Add</button>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Availability Slots</div>
                          <div style={{ display:"flex", gap:8 }}>
                            <input value={newSlots} onChange={e=>setNewSlots(e.target.value)} placeholder="e.g. Mon–Fri, 9AM–5PM"
                              style={{ ...fontStyle, flex:1, padding:"11px 14px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.text }} />
                            <button onClick={() => saveSlots(key)} style={{ ...fontStyle, padding:"11px 18px", background:C.purpleDim, border:`1px solid ${C.purple}40`, borderRadius:10, color:C.purple, fontSize:13, fontWeight:600, cursor:"pointer" }}>Save</button>
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

      {/* Voice FAB — visible on patient screen */}
      {screen === "patient" && !showVoice && (
        <div className="voice-fab">
          <button className="voice-fab-btn" onClick={() => setShowVoice(true)} title="Voice Talk">🎙️</button>
        </div>
      )}

      {/* Admin corner */}
      {screen !== "admin" && (
        <div className="admin-corner">
          <button className="admin-corner-btn" onClick={() => setScreen("admin")} title="Admin Panel">⚙</button>
        </div>
      )}
    </div>
  );
}
