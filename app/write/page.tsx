"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SECRET_QUESTIONS = [
  "What dining hall did you eat at most?",
  "Who was your first friend at UMD?",
  "What was your first dorm?",
  "What class surprised you the most?",
  "Where was your favorite study spot on campus?",
  "What did you rub Testudo's nose for?",
];
const WRITE_OWN = "write-own";

export default function WritePage() {
  const router = useRouter();
  const [captions, setCaptions] = useState(["", "", ""]);
  const [photoUrls, setPhotoUrls] = useState(["", "", ""]);
  const [uploading, setUploading] = useState([false, false, false]);
  const [questionChoice, setQuestionChoice] = useState(SECRET_QUESTIONS[0]);
  const [ownQuestion, setOwnQuestion] = useState("");

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

    // The sealing page picks this up and sends it to /api/seal
    sessionStorage.setItem("capsuleDraft", JSON.stringify(draft));
    router.push("/sealing");
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#fdf8f0" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-sm mb-4 inline-block" style={{ color: "#E21833" }}>
            ← Back
          </Link>
          <div className="text-5xl mb-3">📜</div>
          <h1 className="text-3xl font-bold" style={{ color: "#E21833" }}>
            Write Your Capsule
          </h1>
          <p className="text-gray-500 mt-2">
            Your letter will be sealed on Solana and locked until graduation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Name */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-2 text-gray-700">Your Name</label>
            <input
              type="text"
              name="author"
              required
              placeholder="e.g. Nadia Hassan"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#FFD200" } as React.CSSProperties}
            />
          </div>

          {/* Wallet address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-2 text-gray-700">Solana Wallet Address</label>
            <input
              type="text"
              name="walletAddress"
              required
              placeholder="e.g. 7xKqP3..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2"
            />
            <p className="text-xs text-gray-400 mt-2">Your NFT badge will be minted here on graduation day.</p>
          </div>

          {/* Letter */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-2 text-gray-700">
              Letter to your future self
            </label>
            <textarea
              name="letter"
              required
              rows={7}
              placeholder="Dear future me, I'm writing this from McKeldin Library at midnight..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 resize-none focus:outline-none focus:ring-2"
            />
          </div>

          {/* Semester notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-2 text-gray-700">
              Semester notes
            </label>
            <textarea
              name="notes"
              rows={5}
              placeholder="CMSC132 was rough but I finally got pointers. Joined a16z Future Founders. Ate way too much Stamp food..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 resize-none focus:outline-none focus:ring-2"
            />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-3 text-gray-700">
              Photos <span className="text-gray-400 font-normal">(up to 3, optional)</span>
            </label>
            <div className="flex flex-col gap-5">
              {captions.map((c, i) => (
                <div key={i} className="rounded-xl border-2 border-dashed border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-3">📷 Photo {i + 1}</p>

                  {photoUrls[i] ? (
                    <div className="mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrls[i]}
                        alt={`Photo ${i + 1} preview`}
                        className="w-full max-h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="text-xs mt-2 underline"
                        style={{ color: "#E21833" }}
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex items-center justify-center w-full py-6 mb-3 rounded-xl cursor-pointer text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#fff7cc", color: "#92400e" }}
                    >
                      {uploading[i] ? "Testudo is fetching your photo..." : "Choose an image"}
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
                    onChange={(e) => handleCaptionChange(i, e.target.value)}
                    placeholder={`Caption ${i + 1} — e.g. First football game at SECU Stadium`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Unlock date */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block font-semibold mb-2 text-gray-700">Unlock date</label>
            <input
              type="date"
              name="unlockDate"
              defaultValue="2029-05-20"
              min="2029-01-01"
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2"
            />
            <p className="text-xs text-gray-400 mt-2">Default: May 20, 2029 (Class of 2029 graduation). Your badge says the year your capsule unlocks.</p>
          </div>

          {/* Secret question */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2" style={{ borderColor: "#FFD200" }}>
            <label className="block font-semibold mb-1 text-gray-700">🔑 Your secret unlock question</label>
            <p className="text-xs text-gray-400 mb-3">
              At graduation, you&apos;ll answer this to open your capsule. Pick something only you would know.
            </p>
            <select
              value={questionChoice}
              onChange={(e) => setQuestionChoice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2"
            >
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
                placeholder="e.g. What was the name of my CMSC131 TA?"
                className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2"
              />
            )}
            <input
              type="text"
              name="secretAnswer"
              required
              autoComplete="off"
              placeholder="Your answer (not case sensitive)"
              className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2"
            />
            <p className="text-xs text-gray-400 mt-2">Don&apos;t forget it. Testudo can&apos;t reset it for you! 🐢</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading.some(Boolean)}
            className="w-full py-4 rounded-full font-bold text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ background: "#E21833", color: "white" }}
          >
            🔒 Seal my capsule
          </button>

        </form>
      </div>
    </div>
  );
}
