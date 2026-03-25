import { useState, useRef, useEffect, useCallback } from "react";

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
  { id:"chest", label:"Chest Pain", icon:"🫀", dept:"cardiology",
    tests:["ECG","Troponin Blood Test","Echocardiogram","Lipid Profile"],
    followUps:[
      {q:"Pain severity?", options:["Mild (1–3)","Moderate (4–6)","Severe (7–10)"]},
      {q:"Spreads to arm/jaw/back?", options:["Yes","No","Not sure"]},
      {q:"Shortness of breath?", options:["Yes","No"]},
      {q:"How long?", options:["Just started","Few hours","Days","Weeks+"]},
    ],
    immediateAction:"Sit comfortably, avoid exertion. If spreading to arm/jaw — call 112 immediately.",
  },
  { id:"head", label:"Headache", icon:"🧠", dept:"neurology",
    tests:["MRI Brain","CT Scan Head","BP Check","EEG"],
    followUps:[
      {q:"Headache type?", options:["Throbbing","Pressure","Sharp/stabbing","Dull ache"]},
      {q:"Pain location?", options:["Forehead","Back of head","One side","Whole head"]},
      {q:"Vision changes or nausea?", options:["Yes","No"]},
      {q:"Duration?", options:["Minutes","Hours","Days","On and off"]},
    ],
    immediateAction:"Rest in dark, quiet room. Stay hydrated. Worst-ever headache = emergency.",
  },
  { id:"breath", label:"Breathlessness", icon:"🫁", dept:"pulmonology",
    tests:["Chest X-Ray","Spirometry","ABG Test","Sputum Culture"],
    followUps:[
      {q:"When does it occur?", options:["At rest","Light activity","Heavy exertion","Lying flat"]},
      {q:"Wheezing or tightness?", options:["Yes","No"]},
      {q:"Cough or fever?", options:["Cough","Fever","Both","Neither"]},
      {q:"Duration?", options:["Just started","Days","Weeks","Months+"]},
    ],
    immediateAction:"Sit upright, breathe slowly through pursed lips. Blue lips/fingers = call 112.",
  },
  { id:"stomach", label:"Stomach Pain", icon:"🫃", dept:"gastroenterology",
    tests:["Ultrasound Abdomen","H. Pylori Test","LFT","Endoscopy"],
    followUps:[
      {q:"Pain location?", options:["Upper abdomen","Lower abdomen","Right side","Left side"]},
      {q:"Vomiting?", options:["With blood","Without blood","No"]},
      {q:"Stool changes?", options:["Dark/tarry","Loose","Normal"]},
      {q:"Relation to meals?", options:["Worse after eating","Better after eating","No relation"]},
    ],
    immediateAction:"Avoid spicy foods, stay upright after eating. Blood in vomit = emergency.",
  },
  { id:"joint", label:"Joint / Back", icon:"🦴", dept:"orthopedics",
    tests:["X-Ray","MRI Joint","CRP & ESR","RA Factor"],
    followUps:[
      {q:"Area affected?", options:["Knee","Back/spine","Shoulder","Hip/ankle"]},
      {q:"Injury or fall?", options:["Yes","No, gradual"]},
      {q:"Swelling or redness?", options:["Yes","No"]},
      {q:"Mobility?", options:["Can't move","Limited","Painful but moving"]},
    ],
    immediateAction:"Rest, apply ice 20 min intervals. Snap sound during injury = urgent care.",
  },
  { id:"kidney", label:"Kidney / Urine", icon:"🫘", dept:"nephrology",
    tests:["Serum Creatinine","eGFR","Urine Test","Renal Ultrasound"],
    followUps:[
      {q:"Issue type?", options:["Swelling","Frequent urination","Burning urination","Little/no urine"]},
      {q:"Blood in urine?", options:["Yes","No"]},
      {q:"Flank or back pain?", options:["Yes","No"]},
      {q:"Duration?", options:["Today","Few days","Weeks","Months"]},
    ],
    immediateAction:"Drink water unless swelling is severe. No urine or blood = urgent eval today.",
  },
  { id:"sugar", label:"Sugar / Thyroid", icon:"🔬", dept:"endocrinology",
    tests:["HbA1c","Fasting Blood Sugar","TSH / T3 / T4","Lipid Profile"],
    followUps:[
      {q:"Main concern?", options:["High blood sugar","Low sugar episodes","Thyroid","Weight changes"]},
      {q:"Excessive thirst/urination?", options:["Both","Only thirst","Only urination","No"]},
      {q:"Unusual fatigue?", options:["Very much","Somewhat","No"]},
      {q:"Family history?", options:["Diabetes","Thyroid","Both","None"]},
    ],
    immediateAction:"Low sugar + shakiness: eat glucose/juice immediately. High sugar + unwell = doctor today.",
  },
  { id:"lump", label:"Lump / Weight", icon:"🔴", dept:"oncology",
    tests:["CECT Scan","PET Scan","Tumor Markers","Biopsy"],
    followUps:[
      {q:"Lump nature?", options:["Hard & immovable","Soft & movable","Painful","No pain"]},
      {q:"How long?", options:["<1 month","1–3 months","3–6 months","6+ months"]},
      {q:"Unexplained weight loss?", options:["Significant","Slight","No change"]},
      {q:"Night sweats or fever?", options:["Yes","No"]},
    ],
    immediateAction:"Do not squeeze. Any lump 2+ weeks + weight loss = urgent evaluation.",
  },
  { id:"skin", label:"Skin Issues", icon:"🩹", dept:"dermatology",
    tests:["Skin Biopsy","KOH Test","Patch Test","Blood CBC"],
    followUps:[
      {q:"Type of issue?", options:["Rash/redness","Itching","Acne","Discoloration"]},
      {q:"Duration?", options:["Days","Weeks","Months","Years"]},
      {q:"Spreading?", options:["Yes, rapidly","Slowly","No change"]},
      {q:"Triggers?", options:["Food","Contact","Stress","Unknown"]},
    ],
    immediateAction:"Avoid scratching. Use mild moisturizer. Rapid rash with fever = see doctor today.",
  },
  { id:"general", label:"Fever / General", icon:"🌡️", dept:"general_medicine",
    tests:["CBC","CRP","Blood Culture","Urine Routine"],
    followUps:[
      {q:"Temperature?", options:["Low-grade (99–100°F)","Moderate (101–102°F)","High (103°F+)","Not measured"]},
      {q:"Chills or sweating?", options:["Chills","Sweating","Both","Neither"]},
      {q:"Body pain?", options:["Severe","Mild","No"]},
      {q:"Duration?", options:["1 day","2–3 days","A week","More than a week"]},
    ],
    immediateAction:"Stay hydrated, take paracetamol if >101°F. 103°F+ not reducing = same-day doctor.",
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
  bg:          "#080A0E",
  surface:     "#0E1118",
  card:        "#131720",
  border:      "#1E2533",
  borderHover: "#2E3A4F",
  accent:      "#00D4AA",
  accentDim:   "#00D4AA14",
  accentText:  "#00D4AA",
  accentGlow:  "#00D4AA40",
  red:         "#FF5C6C",
  redDim:      "#FF5C6C14",
  text:        "#E8ECF4",
  muted:       "#5A6478",
  muted2:      "#2A3042",
  purple:      "#8B8BFF",
  purpleDim:   "#8B8BFF14",
  blue:        "#4DA6FF",
  blueDim:     "#4DA6FF14",
  gold:        "#FFB800",
  goldDim:     "#FFB80014",
};

const F = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ── Animated Background ──────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(55, Math.floor(window.innerWidth / 22));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      opacity: Math.random() * 0.5 + 0.1,
      color: ["#00D4AA","#4DA6FF","#8B8BFF"][Math.floor(Math.random() * 3)],
    }));

    let tick = 0;
    function draw() {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient glow orbs
      [[0.15, 0.25, "#00D4AA", 0.04], [0.85, 0.75, "#4DA6FF", 0.03], [0.5, 0.9, "#8B8BFF", 0.025]].forEach(([rx, ry, col, alpha]) => {
        const g = ctx.createRadialGradient(canvas.width*rx, canvas.height*ry, 0, canvas.width*rx, canvas.height*ry, canvas.width*0.45);
        g.addColorStop(0, col.replace(")", `, ${alpha})`).replace("rgb(", "rgba(").replace("#", "rgba(").replace(/^rgba\(#(..)(..)(..)/, (_, r, g2, b) => `rgba(${parseInt(r,16)},${parseInt(g2,16)},${parseInt(b,16)}`));
        g.addColorStop(1, "transparent");
        // simpler approach:
        ctx.save();
        ctx.globalAlpha = alpha * 10;
        ctx.beginPath();
        ctx.arc(canvas.width*rx, canvas.height*ry, canvas.width*0.45, 0, Math.PI*2);
        const gr = ctx.createRadialGradient(canvas.width*rx, canvas.height*ry, 0, canvas.width*rx, canvas.height*ry, canvas.width*0.45);
        gr.addColorStop(0, col + "20");
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.restore();
      });

      // Particle connections
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,170,${(1 - dist/95) * 0.1})`;
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 200).toString(16).padStart(2,"0");
        ctx.fill();
      });

      // Scan line
      const scanY = (tick * 0.25) % (canvas.height + 120) - 60;
      const sg = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(0,212,170,0.012)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 50, canvas.width, 100);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", background:"linear-gradient(135deg, #080A0E 0%, #0A0F1A 60%, #07090F 100%)" }} />;
}

// ── Emergency Overlay ─────────────────────────────────────────────
function EmergencyOverlay({ conditionName, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(150,0,0,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"emergPulse 1.2s ease-in-out infinite alternate",padding:"32px 24px",textAlign:"center" }}>
      <div style={{ fontSize:72,marginBottom:16,animation:"emergBounce 0.6s ease-in-out infinite alternate" }}>🚨</div>
      <div style={{ fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-0.8px",marginBottom:12 }}>Emergency Alert</div>
      <div style={{ fontSize:16,color:"#FFCDD2",marginBottom:8 }}>Possible serious condition detected:</div>
      <div style={{ fontSize:20,fontWeight:800,color:"#FFEB3B",marginBottom:28,textTransform:"uppercase",letterSpacing:"0.04em" }}>{conditionName}</div>
      <div style={{ fontSize:15,color:"#FFCDD2",lineHeight:1.7,maxWidth:360,marginBottom:36 }}>
        This condition may require <strong style={{ color:"#fff" }}>immediate medical attention</strong>. Do not delay.
      </div>
      <a href="tel:112" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"18px 40px",borderRadius:16,background:"#fff",color:"#C62828",fontSize:20,fontWeight:900,textDecoration:"none",boxShadow:"0 0 40px rgba(255,255,255,0.3)",marginBottom:14,width:"100%",maxWidth:320 }}>
        📞 Call 112 — Emergency
      </a>
      <a href="tel:108" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"14px 32px",borderRadius:14,background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:16,fontWeight:700,textDecoration:"none",border:"2px solid rgba(255,255,255,0.4)",marginBottom:28,width:"100%",maxWidth:320 }}>
        🏥 Call 108 — Ambulance
      </a>
      <button onClick={onClose} style={{ ...F,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)",padding:"10px 28px",borderRadius:10,fontSize:13,cursor:"pointer" }}>
        I understand — Continue
      </button>
    </div>
  );
}

// ── Voice AI Section ──────────────────────────────────────────────
function VoiceSection({ depts, setEmergency }) {
  const [voiceState, setVoiceState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [voiceResult, setVoiceResult] = useState(null);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError("Voice not supported in this browser. Please use Chrome."); return; }
    setTranscript(""); setVoiceResult(null); setVoiceError("");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onstart = () => setVoiceState("listening");
    rec.onresult = (e) => setTranscript(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onerror = () => { setVoiceError("Couldn't hear you clearly. Please try again."); setVoiceState("idle"); };
    rec.onend = () => setVoiceState(prev => prev === "listening" ? "processing" : prev);
    rec.start();
  }, []);

  const stopListening = useCallback(() => recognitionRef.current?.stop(), []);

  useEffect(() => {
    if (voiceState === "processing") {
      if (transcript.trim()) analyzeVoice(transcript);
      else { setVoiceError("Nothing detected. Tap mic and speak clearly."); setVoiceState("idle"); }
    }
  }, [voiceState]);

  async function analyzeVoice(text) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Patient said: "${text}". You are a medical AI. Reply ONLY in valid JSON (no markdown, no backticks):\n{\n  "name": "likely condition",\n  "dept_key": "one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology",\n  "specialist": "doctor type",\n  "summary": "2-sentence explanation of what this could be",\n  "needed": [{"test": "name", "reason": "why"}],\n  "immediate_action": "1-2 sentence immediate step",\n  "is_serious": true or false\n}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(text);
      setVoiceResult({ ...parsed, dept: depts[key], deptKey: key });
      if (parsed.is_serious || isSerious(text, parsed.name)) setEmergency(parsed.name || text);
      setVoiceState("result");
    } catch {
      setVoiceError("Analysis failed. Please try again.");
      setVoiceState("idle");
    }
  }

  const reset = () => { setVoiceState("idle"); setTranscript(""); setVoiceResult(null); setVoiceError(""); };

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:28, padding:"0 8px" }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.purple,marginBottom:10 }}>🎙️ Voice AI Diagnosis</div>
        <div style={{ fontSize:20,fontWeight:700,color:C.text,letterSpacing:"-0.5px",marginBottom:8 }}>Just speak. We diagnose.</div>
        <div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>Tell the AI how you feel in plain words — it'll figure out the rest instantly.</div>
      </div>

      {voiceState !== "result" && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
          <div style={{ position:"relative",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {voiceState === "listening" && (
              <>
                <div style={{ position:"absolute",width:100,height:100,borderRadius:"50%",border:"2px solid rgba(255,92,108,0.3)",animation:"ringExpand 1.5s ease-out infinite" }} />
                <div style={{ position:"absolute",width:120,height:120,borderRadius:"50%",border:"1px solid rgba(255,92,108,0.15)",animation:"ringExpand 1.5s ease-out infinite",animationDelay:"0.5s" }} />
              </>
            )}
            <button
              onClick={voiceState === "listening" ? stopListening : startListening}
              style={{
                width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",position:"relative",zIndex:1,
                background: voiceState === "listening"
                  ? "linear-gradient(135deg, #FF5C6C, #FF8F6C)"
                  : "linear-gradient(135deg, #8B8BFF, #5F5FD4)",
                boxShadow: voiceState === "listening"
                  ? "0 0 0 0 rgba(255,92,108,0.4), 0 8px 32px rgba(255,92,108,0.4)"
                  : "0 0 24px rgba(139,139,255,0.35), 0 4px 16px rgba(0,0,0,0.4)",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.3s",
                animation: voiceState === "listening" ? "voicePulse 1.2s ease-in-out infinite" : "none",
              }}
            >
              {voiceState === "listening" ? (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
                  <rect x="8" y="8" width="12" height="12" rx="2"/>
                </svg>
              ) : voiceState === "processing" ? (
                <span style={{ fontSize:24,animation:"spin 0.7s linear infinite",display:"inline-block",color:"white" }}>◌</span>
              ) : (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4z" fill="white"/>
                  <path d="M7 14a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <line x1="14" y1="21" x2="14" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="10" y1="25" x2="18" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>

          {/* Waveform */}
          {voiceState === "listening" && (
            <div style={{ display:"flex",alignItems:"center",gap:3,height:36 }}>
              {Array.from({length:18}).map((_, i) => (
                <div key={i} style={{
                  width:3,borderRadius:4,
                  background:`linear-gradient(to top, #8B8BFF, #FF5C6C)`,
                  animation:`waveBar ${0.4 + (i%5)*0.12}s ease-in-out infinite alternate`,
                  animationDelay:`${i*0.055}s`,
                  height:`${14 + (i%7)*4}px`,
                }} />
              ))}
            </div>
          )}

          <div style={{ fontSize:13,color: voiceState === "listening" ? C.red : C.muted,fontWeight:500,textAlign:"center",transition:"color 0.3s",minHeight:20 }}>
            {voiceState === "idle" && "Tap the mic and describe your symptoms"}
            {voiceState === "listening" && "🔴 Listening… tap stop when done"}
            {voiceState === "processing" && "AI is analyzing your symptoms…"}
          </div>

          {transcript && (
            <div style={{ width:"100%",padding:"14px 16px",background:"rgba(13,18,30,0.7)",backdropFilter:"blur(12px)",border:"1px solid "+C.border,borderRadius:12,fontSize:13,color:C.text,lineHeight:1.6,fontStyle:"italic",textAlign:"center" }}>
              "{transcript}"
            </div>
          )}

          {voiceError && (
            <div style={{ width:"100%",padding:"12px 16px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red,textAlign:"center" }}>
              {voiceError}
            </div>
          )}
        </div>
      )}

      {voiceState === "result" && voiceResult && (
        <div style={{ animation:"fadeUp 0.35s ease forwards" }}>
          {voiceResult.immediate_action && (
            <div style={{ padding:"14px 18px",background:"#78350F18",border:"1px solid #92400E50",borderRadius:14,marginBottom:14,display:"flex",gap:12,alignItems:"flex-start" }}>
              <span style={{ fontSize:18,flexShrink:0 }}>⚡</span>
              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#F59E0B",marginBottom:6 }}>Immediate Action</div>
                <div style={{ fontSize:13,color:"#FCD34D",lineHeight:1.65 }}>{voiceResult.immediate_action}</div>
              </div>
            </div>
          )}
          <div style={{ background:"rgba(19,23,32,0.85)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:18,overflow:"hidden",marginBottom:12 }}>
            <div style={{ padding:"20px 22px",borderBottom:"1px solid "+C.border }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.purple,marginBottom:10 }}>🎙️ Voice Diagnosis</div>
              <div style={{ fontSize:17,fontWeight:700,color:C.text,marginBottom:6 }}>{voiceResult.name}</div>
              <div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>{voiceResult.summary}</div>
            </div>
            <div style={{ padding:"20px 22px" }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:12 }}>Recommended Tests</div>
              {voiceResult.needed?.map((t, i) => (
                <div key={i} style={{ padding:"12px 14px",background:C.accentDim,border:"1px solid "+C.accentText+"28",borderRadius:10,marginBottom:8 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.accentText,marginBottom:3 }}>{t.test}</div>
                  <div style={{ fontSize:12,color:C.muted }}>{t.reason}</div>
                </div>
              ))}
              <div style={{ marginTop:16,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:8 }}>Specialist</div>
              <div style={{ padding:"10px 14px",background:"rgba(13,18,30,0.5)",border:"1px solid "+C.border,borderRadius:10,fontSize:13,color:C.text,marginBottom:10 }}>{voiceResult.specialist}</div>
              {voiceResult.dept && (
                <div style={{ display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color: voiceResult.dept.available ? C.accentText : C.red,background: voiceResult.dept.available ? C.accentDim : C.redDim,border:"1px solid "+(voiceResult.dept.available ? C.accentText : C.red)+"40",padding:"4px 12px",borderRadius:100 }}>
                  {voiceResult.dept.available ? "● Available" : "● Unavailable"}: {voiceResult.dept.label}
                </div>
              )}
            </div>
          </div>
          <button onClick={reset} style={{ ...F,width:"100%",padding:"12px",background:"transparent",border:"1px solid "+C.border,borderRadius:12,color:C.muted,fontSize:13,cursor:"pointer",backdropFilter:"blur(12px)" }}>
            🎙️ Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function MedMatch() {
  const [screen, setScreen]         = useState("home");
  const [mode, setMode]             = useState("voice");
  const [picked, setPicked]         = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [disease, setDisease]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [aiData, setAiData]         = useState(null);
  const [error, setError]           = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [emergency, setEmergency]   = useState(null);
  const resultRef = useRef(null);

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass]     = useState("");
  const [adminError, setAdminError]   = useState("");
  const [depts, setDepts] = useState(() => {
    try { const s = localStorage.getItem("mm_depts"); return s ? JSON.parse(s) : HOSPITAL.departments; }
    catch { return HOSPITAL.departments; }
  });
  const [editDept, setEditDept]     = useState(null);
  const [newDocName, setNewDocName] = useState("");
  const [newSlots, setNewSlots]     = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  function saveDepts(u) { setDepts(u); try { localStorage.setItem("mm_depts", JSON.stringify(u)); } catch {} }
  function reset() { setPicked(null); setDisease(""); setAiData(null); setError(""); setSymptomAnswers({}); }
  function adminLogin() { if (adminPass === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); } else setAdminError("Incorrect password."); }
  function addDoctor(k) {
    if (!newDocName.trim()) return;
    saveDepts({ ...depts, [k]: { ...depts[k], doctors: [...depts[k].doctors, newDocName.trim()], available: true } });
    setNewDocName(""); setAdminSuccess("Doctor added."); setTimeout(() => setAdminSuccess(""), 2500);
  }
  function removeDoctor(k, idx) { saveDepts({ ...depts, [k]: { ...depts[k], doctors: depts[k].doctors.filter((_, i) => i !== idx), available: depts[k].doctors.filter((_, i) => i !== idx).length > 0 } }); }
  function saveSlots(k) { saveDepts({ ...depts, [k]: { ...depts[k], slots: newSlots } }); setAdminSuccess("Slots updated."); setTimeout(() => setAdminSuccess(""), 2500); }
  function toggleAvail(k) { saveDepts({ ...depts, [k]: { ...depts[k], available: !depts[k].available } }); }

  const activeDepts = Object.values(depts).filter(d => d.available).length;
  const totalDepts  = Object.keys(depts).length;
  const totalDocs   = Object.values(depts).reduce((a, d) => a + d.doctors.length, 0);
  const pickedDept  = picked ? depts[picked.dept] : null;

  const Divider = () => <div style={{ height:1,background:C.border,margin:"18px 0" }} />;
  const Tag = ({ ok }) => (
    <span style={{ fontSize:11,fontWeight:600,letterSpacing:"0.04em",padding:"4px 10px",borderRadius:100,background: ok ? C.accentDim : C.redDim,color: ok ? C.accentText : C.red,border:"1px solid "+(ok ? C.accentText : C.red)+"40" }}>
      {ok ? "● Available" : "● Unavailable"}
    </span>
  );
  const SecLabel = ({ children }) => (
    <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:12 }}>{children}</div>
  );
  const DoctorList = ({ dept }) => (
    dept?.available ? (
      dept.doctors.length > 0 ? (
        <>
          {dept.doctors.map((d, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom: i < dept.doctors.length-1 ? "1px solid "+C.border : "none",fontSize:14,color:C.text }}>
              <span>👤</span>{d}
            </div>
          ))}
          {dept.slots && <div style={{ marginTop:12,fontSize:12,color:C.accentText,background:C.accentDim,border:"1px solid "+C.accentText+"40",padding:"6px 12px",borderRadius:8,display:"inline-flex",alignItems:"center",gap:6 }}>⏰ {dept.slots}</div>}
        </>
      ) : <div style={{ padding:"14px 16px",background:C.purpleDim,border:"1px solid "+C.purple+"40",borderRadius:10,fontSize:13,color:C.purple }}>🕐 Doctor info coming soon.</div>
    ) : <div style={{ padding:"14px 16px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red }}>No specialist available. Contact reception.</div>
  );

  async function analyze() {
    if (!disease.trim()) return;
    setLoading(true); setAiData(null); setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 900,
          messages: [{
            role: "user",
            content: `Patient condition: "${disease}". You are an honest medical advisor. Reply ONLY in valid JSON (no markdown):\n{\n  "name": "clean condition name",\n  "dept_key": "one of: cardiology neurology pulmonology gastroenterology orthopedics nephrology endocrinology oncology general_medicine dermatology",\n  "specialist": "doctor type",\n  "needed": [{"test":"name","reason":"why"}],\n  "skip": [{"test":"name","reason":"why hospitals push but patient doesn't need"}],\n  "advice": "one honest patient tip",\n  "immediate_action": "1-2 sentence action right now",\n  "is_serious": true or false\n}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const key = DEPT_KEYS.includes(parsed.dept_key) ? parsed.dept_key : matchDept(disease);
      setAiData({ ...parsed, dept: depts[key], deptKey: key });
      if (parsed.is_serious || isSerious(disease, parsed.name)) setEmergency(parsed.name || disease);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth",block:"start" }), 120);
    } catch { setError("Analysis failed. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ ...F, minHeight:"100vh", color:C.text, position:"relative" }}>
      <AnimatedBackground />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
        textarea:focus, input:focus { outline:none; border-color:${C.accentText} !important; box-shadow:0 0 0 3px ${C.accentDim} !important; }
        .sym-card:hover { border-color:${C.accentText} !important; background:${C.accentDim} !important; transform:translateY(-1px); }
        .home-card:hover { border-color:${C.accentText}50 !important; transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,212,170,0.1) !important; }
        .dept-card:hover { border-color:${C.borderHover} !important; }
        .admin-row:hover { background:rgba(13,18,30,0.5) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation:fadeUp 0.35s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg);} }
        .spin { animation:spin 0.8s linear infinite; display:inline-block; }
        @keyframes emergPulse { from{background:rgba(150,0,0,0.95);}to{background:rgba(200,0,0,1);} }
        @keyframes emergBounce { from{transform:scale(1);}to{transform:scale(1.1);} }
        @keyframes voicePulse { 0%{box-shadow:0 0 0 0px rgba(255,92,108,0.5),0 8px 32px rgba(255,92,108,0.4);}100%{box-shadow:0 0 0 18px rgba(255,92,108,0),0 8px 32px rgba(255,92,108,0.4);} }
        @keyframes waveBar { from{transform:scaleY(0.3);}to{transform:scaleY(1);} }
        @keyframes ringExpand { 0%{transform:scale(1);opacity:0.6;}100%{transform:scale(1.8);opacity:0;} }
        .answer-pill { cursor:pointer; transition:all 0.15s; }
        .answer-pill:hover { transform:translateY(-1px); }
        .admin-corner { position:fixed; bottom:22px; right:22px; z-index:100; }
        .admin-corner-btn { width:44px;height:44px;border-radius:50%;background:rgba(19,23,32,0.9);border:1px solid #2E3A4F;color:#FFB800;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:all 0.2s;font-family:'DM Sans',system-ui,sans-serif;backdrop-filter:blur(12px); }
        .admin-corner-btn:hover { background:rgba(255,184,0,0.1);border-color:#FFB80060;transform:scale(1.08); }
      `}</style>

      {emergency && <EmergencyOverlay conditionName={emergency} onClose={() => setEmergency(null)} />}

      {/* NAV */}
      <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 28px",borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:50,backdropFilter:"blur(24px)",background:"rgba(8,10,14,0.85)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg, #00D4AA, #008F72)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 14px rgba(0,212,170,0.35)" }}>+</div>
          <span style={{ fontSize:15,fontWeight:700,letterSpacing:"-0.3px",color:C.text }}>MedMatch</span>
          <span style={{ fontSize:10,padding:"2px 8px",borderRadius:100,background:C.accentDim,color:C.accentText,border:"1px solid "+C.accentText+"28",letterSpacing:"0.06em",fontWeight:600 }}>AI</span>
        </div>
        {screen !== "home" && (
          <button onClick={() => { setScreen("home"); reset(); setEditDept(null); setAdminAuthed(false); setAdminPass(""); }}
            style={{ ...F,fontSize:13,color:C.muted,cursor:"pointer",background:"none",border:"none",display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,transition:"color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color=C.text}
            onMouseLeave={e => e.currentTarget.style.color=C.muted}>
            ← Home
          </button>
        )}
      </nav>

      {/* ══ HOME ══ */}
      {screen === "home" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:440,margin:"0 auto",padding:"72px 24px 80px" }} className="fade-up">
          <div style={{ textAlign:"center",marginBottom:52 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:100,background:"rgba(0,212,170,0.08)",border:"1px solid rgba(0,212,170,0.18)",marginBottom:22 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:C.accentText,boxShadow:"0 0 8px "+C.accentText,display:"inline-block" }} />
              <span style={{ fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:C.accentText }}>AI-Powered Medical Intelligence</span>
            </div>
            <h1 style={{ fontSize:36,fontWeight:800,letterSpacing:"-1.4px",lineHeight:1.12,marginBottom:16,color:C.text }}>
              Know exactly<br />
              <span style={{ background:"linear-gradient(90deg, #00D4AA 0%, #4DA6FF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>what you need.</span>
            </h1>
            <p style={{ fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:300,margin:"0 auto" }}>
              Right tests. Right doctor. No unnecessary costs or confusion.
            </p>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
            {[
              {
                label:"I'm a Patient", sub:"Find tests & right specialist",
                onClick: () => setScreen("patient"),
                icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="9" r="5" fill="#00D4AA" opacity="0.9"/><path d="M4 26c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
                bg: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,160,120,0.2))",
                border: "rgba(0,212,170,0.22)",
                glow: "rgba(0,212,170,0.1)",
              },
              {
                label:"Hospital Staff", sub:"Dept. availability & doctors",
                onClick: () => setScreen("hospital"),
                icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="11" cy="8" r="4" fill="#8B8BFF" opacity="0.9"/><circle cx="20" cy="8" r="4" fill="#8B8BFF" opacity="0.5"/><path d="M3 25c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#8B8BFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/><path d="M19 17c1.77 0 3.38.72 4.55 1.88" stroke="#8B8BFF" strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg>,
                bg: "linear-gradient(135deg, rgba(139,139,255,0.12), rgba(96,96,210,0.2))",
                border: "rgba(139,139,255,0.22)",
                glow: "rgba(139,139,255,0.1)",
              }
            ].map((card, i) => (
              <div key={i} className="home-card" onClick={card.onClick} style={{ background:`rgba(19,23,32,0.7)`,backdropFilter:"blur(20px)",border:`1px solid ${card.border}`,borderRadius:22,padding:"26px 18px 22px",cursor:"pointer",textAlign:"center",transition:"all 0.25s",boxShadow:`0 4px 24px ${card.glow}` }}>
                <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}>
                  <div style={{ width:62,height:62,borderRadius:"50%",background:card.bg,border:`1px solid ${card.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {card.icon}
                  </div>
                </div>
                <div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:5 }}>{card.label}</div>
                <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ padding:"14px 20px",background:"rgba(13,18,30,0.65)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:16,display:"flex",justifyContent:"space-around",textAlign:"center" }}>
            {[["10","Depts"],["Voice AI","Diagnosis"],["24/7","Available"]].map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontSize:16,fontWeight:800,color:[C.accentText,C.purple,C.blue][i],letterSpacing:"-0.3px" }}>{n}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PATIENT ══ */}
      {screen === "patient" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.6px",marginBottom:6 }}>Your Health Check</h2>
          <p style={{ fontSize:13,color:C.muted,marginBottom:22 }}>Choose how to get diagnosed</p>

          {/* Mode selector */}
          <div style={{ display:"flex",gap:8,marginBottom:28,overflowX:"auto",paddingBottom:2 }}>
            {[["voice","🎙️","Voice AI"],["symptom","⚕️","Symptoms"],["disease","📝","Condition"]].map(([v, ico, lbl]) => (
              <button key={v} onClick={() => { setMode(v); reset(); }}
                style={{ ...F,flexShrink:0,padding:"9px 16px",borderRadius:12,border:"1px solid "+(mode===v ? C.accentText+"55" : C.border),cursor:"pointer",fontSize:13,fontWeight: mode===v ? 600 : 400,background: mode===v ? C.accentDim : "rgba(13,18,30,0.6)",color: mode===v ? C.accentText : C.muted,backdropFilter:"blur(12px)",transition:"all 0.18s",display:"flex",alignItems:"center",gap:6 }}>
                {ico} {lbl}
              </button>
            ))}
          </div>

          {/* VOICE */}
          {mode === "voice" && <VoiceSection depts={depts} setEmergency={setEmergency} />}

          {/* SYMPTOM */}
          {mode === "symptom" && (
            <>
              <p style={{ fontSize:13,color:C.muted,marginBottom:14 }}>Tap what's bothering you</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {SYMPTOMS.map(s => {
                  const isSel = picked?.id === s.id;
                  return (
                    <div key={s.id} className={isSel ? "" : "sym-card"}
                      onClick={() => { setPicked(s); setSymptomAnswers({}); setTimeout(() => resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100); }}
                      style={{ background: isSel ? C.accentDim : "rgba(19,23,32,0.7)",backdropFilter:"blur(12px)",border:"1px solid "+(isSel ? C.accentText : C.border),borderRadius:14,padding:"14px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.18s" }}>
                      <span style={{ fontSize:20,flexShrink:0 }}>{s.icon}</span>
                      <span style={{ fontSize:13,fontWeight:500,color: isSel ? C.accentText : C.text,lineHeight:1.35 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {picked && pickedDept && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:24 }}>
                  <div style={{ background:"rgba(19,23,32,0.8)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:18,padding:"20px 22px",marginBottom:14 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:C.accentText,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.08em" }}>Tell us more</div>
                    {picked.followUps.map((fq, qi) => (
                      <div key={qi} style={{ marginBottom:16 }}>
                        <div style={{ fontSize:13,fontWeight:500,color:C.text,marginBottom:8 }}>{fq.q}</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                          {fq.options.map((opt, oi) => {
                            const ch = symptomAnswers[qi] === oi;
                            return (
                              <div key={oi} className="answer-pill" onClick={() => setSymptomAnswers(p => ({...p,[qi]:oi}))}
                                style={{ padding:"6px 13px",borderRadius:100,background: ch ? C.accentDim : "rgba(13,18,30,0.6)",border:"1px solid "+(ch ? C.accentText : C.border),color: ch ? C.accentText : C.muted,fontSize:12,fontWeight: ch ? 600 : 400,cursor:"pointer" }}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {picked.immediateAction && (
                    <div style={{ padding:"14px 18px",background:"#78350F18",border:"1px solid #92400E50",borderRadius:14,marginBottom:14,display:"flex",gap:12,alignItems:"flex-start" }}>
                      <span style={{ fontSize:18,flexShrink:0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#F59E0B",marginBottom:6 }}>Immediate Action</div>
                        <div style={{ fontSize:13,color:"#FCD34D",lineHeight:1.65 }}>{picked.immediateAction}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background:"rgba(19,23,32,0.8)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:18,overflow:"hidden" }}>
                    <div style={{ padding:"18px 22px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:15,fontWeight:700 }}>{pickedDept.label}</div>
                        <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{HOSPITAL.name}</div>
                      </div>
                      <Tag ok={pickedDept.available} />
                    </div>
                    <div style={{ padding:"18px 22px" }}>
                      <SecLabel>Recommended Tests</SecLabel>
                      {picked.tests.map((t, i) => (
                        <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom: i < picked.tests.length-1 ? "1px solid "+C.border : "none" }}>
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

          {/* DISEASE */}
          {mode === "disease" && (
            <>
              <div style={{ padding:"12px 16px",background:C.blueDim,border:"1px solid "+C.blue+"28",borderRadius:12,marginBottom:14,fontSize:13,color:C.blue,lineHeight:1.6 }}>
                💡 Describe your condition or reason for visit. Mention location, duration, severity.
              </div>
              <textarea value={disease} onChange={e => setDisease(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();analyze();} }}
                placeholder="e.g. Chest pain for 2 hours, spreading to left arm with sweating&#10;or: Type 2 diabetes checkup, HbA1c 8.2, on Metformin..."
                style={{ ...F,width:"100%",padding:"14px 16px",background:"rgba(13,18,30,0.8)",backdropFilter:"blur(12px)",border:"1px solid "+C.border,borderRadius:14,fontSize:14,color:C.text,resize:"none",minHeight:110,lineHeight:1.65,transition:"border-color 0.2s,box-shadow 0.2s" }} />
              <button onClick={analyze} disabled={loading || !disease.trim()}
                style={{ ...F,width:"100%",padding:"14px",marginTop:10,background: loading||!disease.trim() ? C.muted2 : "linear-gradient(135deg, #00D4AA, #00956E)",border:"none",borderRadius:12,color: loading||!disease.trim() ? C.muted : "#000",fontSize:14,fontWeight:700,cursor: loading||!disease.trim() ? "not-allowed" : "pointer",transition:"all 0.2s",boxShadow: !loading&&disease.trim() ? "0 4px 20px rgba(0,212,170,0.3)" : "none" }}>
                {loading ? <span><span className="spin">◌</span>&nbsp;Analyzing…</span> : "Analyze & see what you need →"}
              </button>
              <div style={{ marginTop:10,padding:"10px 14px",background:"#78350F18",border:"1px solid #92400E40",borderRadius:10,fontSize:12,color:"#D97706",lineHeight:1.6 }}>
                If a hospital recommends extra tests not listed here, ask your doctor to justify each one.
              </div>
              {error && <div style={{ marginTop:10,padding:"12px 16px",background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:10,fontSize:13,color:C.red }}>{error}</div>}

              {aiData && (
                <div ref={resultRef} className="fade-up" style={{ marginTop:24 }}>
                  {aiData.immediate_action && (
                    <div style={{ padding:"14px 18px",background:"#78350F18",border:"1px solid #92400E50",borderRadius:14,marginBottom:14,display:"flex",gap:12,alignItems:"flex-start" }}>
                      <span style={{ fontSize:18,flexShrink:0 }}>⚡</span>
                      <div>
                        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#F59E0B",marginBottom:6 }}>Immediate Action</div>
                        <div style={{ fontSize:13,color:"#FCD34D",lineHeight:1.65 }}>{aiData.immediate_action}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ background:"rgba(19,23,32,0.85)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:18,overflow:"hidden" }}>
                    <div style={{ padding:"20px 24px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                      <div>
                        <div style={{ fontSize:16,fontWeight:700,marginBottom:4 }}>{aiData.name}</div>
                        <div style={{ fontSize:12,color:C.muted }}>Specialist: {aiData.specialist}</div>
                      </div>
                      <Tag ok={aiData.dept?.available} />
                    </div>
                    <div style={{ padding:"20px 24px" }}>
                      <SecLabel>Tests you need</SecLabel>
                      {aiData.needed?.map((t, i) => (
                        <div key={i} style={{ padding:"12px 14px",background:C.accentDim,border:"1px solid "+C.accentText+"28",borderRadius:11,marginBottom:8 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:C.accentText,marginBottom:4 }}>{t.test}</div>
                          <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{t.reason}</div>
                        </div>
                      ))}
                      {aiData.skip?.length > 0 && (
                        <>
                          <Divider />
                          <SecLabel>Question or skip</SecLabel>
                          {aiData.skip.map((t, i) => (
                            <div key={i} style={{ padding:"12px 14px",background:C.redDim,border:"1px solid "+C.red+"28",borderRadius:11,marginBottom:8 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:C.red,marginBottom:4 }}>✕ {t.test}</div>
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
                          <div style={{ padding:"14px 16px",background:C.blueDim,border:"1px solid "+C.blue+"40",borderRadius:11,fontSize:13,color:"#93C5FD",lineHeight:1.65 }}>
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
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"36px 24px 100px" }} className="fade-up">
          <h2 style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.6px",marginBottom:4 }}>{HOSPITAL.name}</h2>
          <p style={{ fontSize:13,color:C.muted,marginBottom:22 }}>Live department availability</p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:22 }}>
            {[{n:activeDepts,l:"Active",c:C.accentText},{n:totalDepts-activeDepts,l:"Unavailable",c:C.red},{n:totalDocs,l:"Doctors",c:C.purple}].map((s,i)=>(
              <div key={i} style={{ background:"rgba(19,23,32,0.7)",backdropFilter:"blur(16px)",border:"1px solid "+C.border,borderRadius:14,padding:"14px 10px",textAlign:"center" }}>
                <div style={{ fontSize:24,fontWeight:800,color:s.c,letterSpacing:"-1px",lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:5 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {Object.entries(depts).map(([key, d]) => {
              const isOpen = expandedDept === key;
              return (
                <div key={key} className={d.available ? "dept-card" : ""}
                  onClick={() => d.available && setExpandedDept(isOpen ? null : key)}
                  style={{ background:"rgba(19,23,32,0.7)",backdropFilter:"blur(12px)",border:"1px solid "+C.border,borderRadius:14,padding:"16px",cursor: d.available ? "pointer" : "default",transition:"all 0.18s" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                    <span style={{ fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3 }}>{d.label}</span>
                    <span style={{ width:7,height:7,borderRadius:"50%",background: d.available ? C.accentText : C.red,display:"inline-block",marginTop:3,flexShrink:0,boxShadow: d.available ? "0 0 6px "+C.accentText+"80" : "none" }} />
                  </div>
                  <div style={{ fontSize:11,color: d.available ? C.accentText : C.red,fontWeight:500,marginBottom: isOpen ? 10 : 0 }}>
                    {d.available ? (d.doctors.length > 0 ? `${d.doctors.length} doctor${d.doctors.length!==1?"s":""}` : "Coming soon") : "Unavailable"}
                  </div>
                  {d.available && isOpen && (
                    <div style={{ borderTop:"1px solid "+C.border,paddingTop:10 }}>
                      {d.doctors.length > 0 ? d.doctors.map((doc,i) => (
                        <div key={i} style={{ fontSize:11,color:C.muted,marginBottom:3,display:"flex",alignItems:"center",gap:6 }}><span style={{ color:C.muted2 }}>–</span>{doc}</div>
                      )) : <div style={{ fontSize:11,color:C.purple }}>🕐 Doctor info coming soon</div>}
                      {d.slots && <div style={{ fontSize:11,color:C.accentText,marginTop:8 }}>⏰ {d.slots}</div>}
                    </div>
                  )}
                  {d.available && <div style={{ fontSize:10,color:C.muted2,marginTop:8 }}>{isOpen ? "↑ less" : "↓ details"}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ADMIN ══ */}
      {screen === "admin" && (
        <div style={{ position:"relative",zIndex:1,maxWidth:500,margin:"0 auto",padding:"36px 24px 100px" }} className="fade-up">
          {!adminAuthed ? (
            <>
              <h2 style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.6px",marginBottom:6 }}>Admin Panel</h2>
              <p style={{ fontSize:13,color:C.muted,marginBottom:28 }}>Enter password to continue</p>
              <div style={{ background:"rgba(19,23,32,0.8)",backdropFilter:"blur(20px)",border:"1px solid "+C.border,borderRadius:16,padding:"28px 24px" }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Password</div>
                <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key==="Enter"&&adminLogin()} placeholder="Enter admin password"
                  style={{ ...F,width:"100%",padding:"13px 16px",background:"rgba(13,18,30,0.6)",border:"1px solid "+C.border,borderRadius:10,fontSize:14,color:C.text }} />
                {adminError && <div style={{ marginTop:10,fontSize:13,color:C.red }}>{adminError}</div>}
                <button onClick={adminLogin}
                  style={{ ...F,width:"100%",padding:"13px",marginTop:14,background:"linear-gradient(135deg, #FFB800, #E09000)",border:"none",borderRadius:10,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                  Login →
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                <h2 style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.6px" }}>Admin Panel</h2>
                <button onClick={() => { setAdminAuthed(false); setAdminPass(""); setEditDept(null); }}
                  style={{ ...F,fontSize:12,color:C.red,background:C.redDim,border:"1px solid "+C.red+"40",borderRadius:8,padding:"6px 12px",cursor:"pointer" }}>Logout</button>
              </div>
              <p style={{ fontSize:13,color:C.muted,marginBottom:22 }}>Manage doctors and availability</p>
              {adminSuccess && <div style={{ marginBottom:14,padding:"12px 16px",background:C.accentDim,border:"1px solid "+C.accentText+"40",borderRadius:10,fontSize:13,color:C.accentText }}>✓ {adminSuccess}</div>}
              {Object.entries(depts).map(([key, d]) => {
                const isEd = editDept === key;
                return (
                  <div key={key} style={{ background:"rgba(19,23,32,0.8)",backdropFilter:"blur(16px)",border:"1px solid "+(isEd ? "#FFB80040" : C.border),borderRadius:16,marginBottom:10,overflow:"hidden",transition:"border-color 0.2s" }}>
                    <div className="admin-row" style={{ padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"background 0.15s" }}
                      onClick={() => setEditDept(isEd ? null : key)}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <span style={{ width:7,height:7,borderRadius:"50%",background: d.available ? C.accentText : C.red,display:"inline-block",boxShadow: d.available ? "0 0 6px "+C.accentText+"80" : "none" }} />
                        <span style={{ fontSize:14,fontWeight:600,color:C.text }}>{d.label}</span>
                        <span style={{ fontSize:11,color:C.muted }}>{d.doctors.length} doctor{d.doctors.length!==1?"s":""}</span>
                      </div>
                      <span style={{ fontSize:18,color:C.muted2 }}>{isEd ? "↑" : "↓"}</span>
                    </div>
                    {isEd && (
                      <div style={{ borderTop:"1px solid "+C.border,padding:"20px 18px" }}>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                          <span style={{ fontSize:13,color:C.muted }}>Availability</span>
                          <button onClick={() => toggleAvail(key)} style={{ ...F,padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background: d.available ? C.redDim : C.accentDim,color: d.available ? C.red : C.accentText }}>
                            {d.available ? "Mark Unavailable" : "Mark Available"}
                          </button>
                        </div>
                        {d.doctors.length > 0 && (
                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Current Doctors</div>
                            {d.doctors.map((doc,i) => (
                              <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(13,18,30,0.5)",borderRadius:10,marginBottom:6,border:"1px solid "+C.border }}>
                                <div style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,color:C.text }}><span>👤</span>{doc}</div>
                                <button onClick={() => removeDoctor(key,i)} style={{ ...F,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,padding:"2px 6px",borderRadius:6 }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ marginBottom:18 }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Add Doctor</div>
                          <div style={{ display:"flex",gap:8 }}>
                            <input value={newDocName} onChange={e => setNewDocName(e.target.value)} onKeyDown={e => e.key==="Enter"&&addDoctor(key)} placeholder="Dr. Full Name"
                              style={{ ...F,flex:1,padding:"11px 14px",background:"rgba(13,18,30,0.5)",border:"1px solid "+C.border,borderRadius:10,fontSize:13,color:C.text }} />
                            <button onClick={() => addDoctor(key)} style={{ ...F,padding:"11px 18px",background:"linear-gradient(135deg,#00D4AA,#00956E)",border:"none",borderRadius:10,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ Add</button>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Availability Slots</div>
                          <div style={{ display:"flex",gap:8 }}>
                            <input value={newSlots} onChange={e => setNewSlots(e.target.value)} placeholder="e.g. Mon–Fri, 9AM–5PM"
                              style={{ ...F,flex:1,padding:"11px 14px",background:"rgba(13,18,30,0.5)",border:"1px solid "+C.border,borderRadius:10,fontSize:13,color:C.text }} />
                            <button onClick={() => saveSlots(key)} style={{ ...F,padding:"11px 18px",background:C.purpleDim,border:"1px solid "+C.purple+"40",borderRadius:10,color:C.purple,fontSize:13,fontWeight:600,cursor:"pointer" }}>Save</button>
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
          <button className="admin-corner-btn" onClick={() => setScreen("admin")} title="Admin Panel">⚙</button>
        </div>
      )}
    </div>
  );
}
