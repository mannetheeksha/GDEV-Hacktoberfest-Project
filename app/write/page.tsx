"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DarkRoom from "../components/DarkRoom";

const SECRET_QUESTIONS = [
  "What dining hall did you eat at most?",
  "Who was your first friend at UMD?",
  "What was your first dorm?",
  "What class surprised you the most?",
  "Where was your favorite study spot on campus?",
  "What did you rub Testudo's nose for?",
];
const WRITE_OWN = "write-own";

const STEPS = ["Write", "Memories", "Photos", "Date", "Questions"];
const INPUT =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-[#fffdf8] focus:outline-none focus:ring-2 focus:ring-[#FFD200]";

export default function WritePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [letterLength, setLetterLength] = useState(0);
  const [notesLength, setNotesLength] = useState(0);
  const [captions, setCaptions] = useState(["", "", ""]);
  const [photoUrls, setPhotoUrls] = useState(["", "", ""]);
  const [uploading, setUploading] = useState([false, false, false]);
  const [questionChoice, setQuestionChoice] = useState(SECRET_QUESTIONS[0]);
  const [ownQuestion, setOwnQuestion] = useState("");
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleCaptionChange(i: number, val: string) {
    const next = [...captions];
    next[i] = val;
    setCaptions(next);
  }

  function setUploadingAt(i: number, val: boolean) {
    setUploading((prev) => prev.map((u, j) => (j === i ? val : u)));
  }

  // Upload the picked image right away and remember its URL
  async function handlePhotoChange(i: number, file: File | undefined) {
    if (!file) return;
    setUploadingAt(i, true);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploadingAt(i, false);
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setPhotoUrls((prev) => prev.map((u, j) => (j === i ? data.url : u)));
  }

  function removePhoto(i: number) {
    setPhotoUrls((prev) => prev.map((u, j) => (j === i ? "" : u)));
  }

  // Check only the boxes on the current step; shows the browser's "please fill this in" bubble
  function currentStepIsValid(): boolean {
    const fields = stepRefs.current[step]?.querySelectorAll<HTMLInputElement>("input, textarea, select") ?? [];
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (currentStepIsValid()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Pressing Enter on an earlier step just moves forward
    if (step < STEPS.length - 1) return goNext();
    if (!currentStepIsValid()) return;

    const form = new FormData(e.currentTarget);

    // Keep only the photo slots that have a photo or a caption
    const slots = [0, 1, 2].filter((i) => photoUrls[i] || captions[i].trim());

    const draft = {
      author: form.get("author"),
      walletAddress: form.get("walletAddress"),
      letter: form.get("letter"),
      notes: form.get("notes"),
      unlockDate: form.get("unlockDate"),
      photoUrls: slots.map((i) => photoUrls[i]),
      photoCaptions: slots.map((i) => captions[i].trim()),
      secretQuestion: questionChoice === WRITE_OWN ? ownQuestion : questionChoice,
      secretAnswer: form.get("secretAnswer"),
    };

    // The vault shows capsules for this wallet
    localStorage.setItem("myWallet", String(draft.walletAddress).trim());

    // The sealing page picks this up and sends it to /api/seal
    sessionStorage.setItem("capsuleDraft", JSON.stringify(draft));
    router.push("/sealing");
  }

  // Each step lives in this wrapper; only the current one is shown
  const stepBox = (i: number) => ({
    ref: (el: HTMLDivElement | null) => {
      stepRefs.current[i] = el;
    },
    className: step === i ? "fade-up" : "hidden",
  });

  return (
    <DarkRoom className="py-8 px-4">
      <CampusSketch />

      <div className="relative max-w-xl mx-auto">
        <Link href="/" className="text-sm inline-block mb-5" style={{ color: "#f5d77a" }}>
          ← Back
        </Link>

        <Progress step={step} />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 rounded-3xl border-2 p-6 md:p-8"
          style={{ background: "#fffaf0", borderColor: "rgba(212,167,44,0.6)", boxShadow: "0 0 70px rgba(255,190,90,0.22), 0 20px 50px rgba(0,0,0,0.5)" }}
        >

          {/* Step 1 — Write */}
          <div {...stepBox(0)}>
            <StepHeader emoji="📜" sticker="✉️" title="A letter to future you." subtitle="Capture your thoughts, goals and anything you want to remember from this chapter." />
            <Field label="Your name" icon="👤">
              <input type="text" name="author" required maxLength={60} placeholder="e.g. Mihika Chand" className={INPUT} />
            </Field>
            <Field label="Solana wallet address" icon="👛" hint="Your graduation badge NFT is sent here. Copy it from Phantom.">
              <input
                type="text"
                name="walletAddress"
                required
                pattern="[1-9A-HJ-NP-Za-km-z]{32,44}"
                title="Paste a Solana wallet address (32–44 letters and numbers), e.g. from Phantom"
                placeholder="e.g. 7xKqP3..."
                className={`${INPUT} font-mono text-sm`}
              />
            </Field>
          </div>

          {/* Step 2 — Memories */}
          <div {...stepBox(1)}>
            <StepHeader emoji="✨" sticker="🪶" title="Your memories of today." subtitle="Write your letter and add the little things you don't want to forget." />
            <Field label="Letter to your future self" icon="💌" counter={`${letterLength}/5000`}>
              <textarea
                name="letter"
                required
                rows={7}
                maxLength={5000}
                onChange={(e) => setLetterLength(e.target.value.length)}
                placeholder="Dear future me, I'm writing this from McKeldin Library at midnight..."
                className={`${INPUT} resize-none`}
              />
            </Field>
            <Field label="Semester memories" icon="🌟" counter={`${notesLength}/2000`}>
              <textarea
                name="notes"
                rows={4}
                maxLength={2000}
                onChange={(e) => setNotesLength(e.target.value.length)}
                placeholder="Classes you loved, friends you met, favorite places, big moments..."
                className={`${INPUT} resize-none`}
              />
            </Field>
          </div>

          {/* Step 3 — Photos */}
          <div {...stepBox(2)}>
            <StepHeader emoji="📸" sticker="🖼️" title="Add some snapshots." subtitle="Up to 3 photos, each with a caption to remember the moment behind it. All optional." />
            <div className="grid grid-cols-3 gap-3">
              {captions.map((c, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {photoUrls[i] ? (
                    <div className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrls[i]} alt={`Photo ${i + 1} preview`} className="w-full h-full object-cover rounded-xl shadow" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label={`Remove photo ${i + 1}`}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-sm font-bold shadow"
                        style={{ background: "#E21833", color: "white" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer text-gray-400 text-xs text-center hover:border-[#E21833] hover:text-[#E21833] transition-colors">
                      <span className="text-2xl">{uploading[i] ? "⏳" : "🖼️"}</span>
                      {uploading[i] ? "Uploading..." : `Add Photo ${i + 1}`}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading[i]}
                        onChange={(e) => handlePhotoChange(i, e.target.files?.[0])}
                      />
                    </label>
                  )}
                  <input
                    type="text"
                    value={c}
                    maxLength={120}
                    onChange={(e) => handleCaptionChange(i, e.target.value)}
                    placeholder="Caption this moment..."
                    className={`${INPUT} text-xs px-3 py-2`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step 4 — Date */}
          <div {...stepBox(3)}>
            <StepHeader emoji="📅" sticker="🎓" title="When should we unlock it?" subtitle="Choose your graduation date, or a custom date in the future." />
            <Field label="Unlock date" icon="🗓️" hint="Default: May 20, 2029 (Class of 2029 graduation). Your badge shows the year it unlocks.">
              <input type="date" name="unlockDate" required defaultValue="2029-05-20" min="2029-01-01" className={INPUT} />
            </Field>
          </div>

          {/* Step 5 — Questions */}
          <div {...stepBox(4)}>
            <StepHeader emoji="🔑" sticker="🐢" title="One last thing..." subtitle="At graduation you'll answer this to open your capsule. Pick something only you would know." />
            <Field label="Your secret question" icon="❓">
              <select value={questionChoice} onChange={(e) => setQuestionChoice(e.target.value)} className={INPUT}>
                {SECRET_QUESTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
                <option value={WRITE_OWN}>✏️ Write my own...</option>
              </select>
              {questionChoice === WRITE_OWN && (
                <input
                  type="text"
                  value={ownQuestion}
                  onChange={(e) => setOwnQuestion(e.target.value)}
                  required
                  maxLength={150}
                  placeholder="e.g. What was the name of my CMSC131 TA?"
                  className={`${INPUT} mt-3`}
                />
              )}
            </Field>
            <Field label="Your answer" icon="🗝️" hint="Not case sensitive. Don't forget it. Testudo can't reset it for you! 🐢">
              <input type="text" name="secretAnswer" required maxLength={100} autoComplete="off" placeholder="Your answer" className={INPUT} />
            </Field>
          </div>

          {/* Previous / Next */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-full border-2 font-semibold text-gray-600 border-gray-200 hover:border-gray-400 transition-colors"
              >
                ← Previous
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="px-8 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ background: "#E21833", color: "white" }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading.some(Boolean)}
                className="px-8 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{ background: "#E21833", color: "white" }}
              >
                🔒 Seal my capsule
              </button>
            )}
          </div>
        </form>
      </div>
    </DarkRoom>
  );
}

// Write → Memories → Photos → Date → Questions
function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-start">
      {STEPS.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center relative">
          {i > 0 && (
            <div
              className="absolute top-4 right-1/2 w-full h-0.5 transition-colors duration-500"
              style={{ background: i <= step ? "#FFD200" : "rgba(255,255,255,0.2)" }}
            />
          )}
          <div
            className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500"
            style={{
              background: i < step ? "#FFD200" : i === step ? "#E21833" : "rgba(0,0,0,0.35)",
              color: i < step ? "#1a1a1a" : i === step ? "white" : "rgba(255,255,255,0.6)",
              border: i <= step ? "none" : "2px solid rgba(255,255,255,0.25)",
              boxShadow: i === step ? "0 0 18px rgba(226,24,51,0.7)" : i < step ? "0 0 12px rgba(255,210,0,0.4)" : "none",
            }}
          >
            {i < step ? "✓" : i + 1}
          </div>
          <span className="mt-1 text-xs" style={{ color: i === step ? "#FFD200" : i < step ? "#fbe9c6" : "rgba(255,255,255,0.5)", fontWeight: i === step ? 700 : 400 }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function StepHeader({ emoji, sticker, title, subtitle }: { emoji: string; sticker: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          {title}
        </h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
      <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-2xl items-center justify-center text-3xl rotate-6 shadow" style={{ background: "#fff4c2" }}>
        {sticker}
      </div>
    </div>
  );
}

function Field({ label, icon, hint, counter, children }: { label: string; icon: string; hint?: string; counter?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
        <span>{icon}</span>
        {label}
      </label>
      {children}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>{hint}</span>
        {counter && <span>{counter}</span>}
      </div>
    </div>
  );
}

// Faint golden campus outline in the background
function CampusSketch() {
  return (
    <svg viewBox="0 0 600 260" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] max-w-none opacity-[0.08] pointer-events-none" fill="none" stroke="#f5d77a" strokeWidth="3">
      <rect x="180" y="130" width="240" height="110" />
      <polygon points="220,130 300,90 380,130" />
      <rect x="270" y="50" width="60" height="42" />
      <path d="M264,52 Q300,-10 336,52" />
      {[200, 235, 270, 305, 340, 375].map((x) => (
        <line key={x} x1={x + 10} y1="140" x2={x + 10} y2="235" />
      ))}
      <path d="M0,240 Q80,200 150,240 M450,240 Q520,195 600,240" />
    </svg>
  );
}
