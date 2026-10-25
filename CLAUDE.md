# Terp Time Capsule — Build Spec

## Who we are
We are 4 beginner coders at a 6-hour hackathon. We're entering **Best Use of Solana** and the **UMD Challenge**.
- Explain things simply. Do ONE step at a time.
- After every step, tell us exactly how to test it in the browser or terminal.
- Keep code simple and readable. No extra features we didn't ask for.
- If something can be faked for the demo without hurting the story, say so.

## The product
Students write a letter to their future selves (or to next year's freshmen), sealed until graduation.
- The capsule's SHA-256 hash is recorded on Solana devnet, so nobody can edit or backdate it.
- On opening, the app re-checks the hash against Solana and shows "Unedited since <date> ✅".
- Opening mints a "Terp Class of <year>" badge NFT (year = the unlock date's year, starting at 2029) to the student's wallet.
- Each capsule has a secret question; the student must answer it to open the capsule.
- A "Skip to Graduation" button unlocks everything for the live demo.

## Tech stack (do not change)
- Next.js (App Router) + TypeScript + Tailwind CSS
- Storage: a local JSON file `data/capsules.json`, read/written by API routes. No database.
- Photo storage: uploaded images are saved to `public/uploads/` (served at `/uploads/<file>`). Only the file path goes in the JSON. Images only, max 5 MB each.
- Solana: **devnet only**. `@solana/web3.js` for memo transactions. Metaplex Umi + `mpl-token-metadata` for the NFT.
- A server keypair pays for everything. Its secret key lives in `.env.local` as `SOLANA_SECRET_KEY` (JSON array). Users only paste a wallet address — no wallet-connect code.
- `@solana/web3.js` is pinned to v1 (Metaplex Umi needs it).
- Badge picture + NFT info are uploaded to IPFS via Pinata (`PINATA_JWT` in `.env.local`), once per class year; links cached in `data/badges.json`.
- No smart contracts / no Rust.
- No AI features.
- Never commit `.env.local`.

## Data shape
```ts
type Capsule = {
  id: string;
  author: string;
  walletAddress: string;
  letter: string;
  notes: string;
  photoUrls: string[];      // up to 3, e.g. "/uploads/abc123.jpg"
  photoCaptions: string[];  // one caption per photo (same order as photoUrls)
  unlockDate: string;       // ISO date, default 2029-05-20 (earliest class is 2029)
  hash: string;             // SHA-256 of letter + notes
  sealTx: string;           // Solana signature
  badgeMintAddress?: string;
  sealedAt: string;         // ISO datetime
  secretQuestion: string;   // asked before opening
  answerHash: string;       // SHA-256 of the trimmed, lowercased answer (never store the answer itself)
};
```

## Pages
1. `/` — Landing: title, one-line pitch, "Write your capsule" button.
2. `/write` — Form: name, wallet address, letter, semester notes, 3 photo upload sections (each: an image picker with a preview + a caption box; all optional), unlock date, secret question (dropdown of UMD questions or "Write my own") + answer. Button: "Seal my capsule".
3. `/sealing` — Animated wax-seal / envelope closing. Calls `/api/seal`, then shows "Sealed on Solana" with an Explorer link, then a button to the vault.
4. `/vault` — Your wallet is your identity: every new visit asks you to sign in with a wallet address (kept only for the current tab in sessionStorage; "Sign out" clears it) and lists only that wallet's capsules. This does not prove ownership — see "Sign in with Phantom" stretch goal. Locked: countdown to unlock date. Unlocked: "Open" button. Top-right: "⏩ Skip to Graduation" toggle (starts OFF; remembered only for the current tab via sessionStorage) that treats all as unlocked.
5. `/capsule/[id]` — Locked view asks the secret question → `/api/open`. Once unlocked: calls `/api/verify` → shows verified badge or "⚠️ tampered", reveals letter + notes + the uploaded photos with their captions, then calls `/api/mint-badge` and shows the badge image + Explorer link.

## API routes
- `GET /api/capsules?wallet=<address>` → id, author, unlockDate, sealedAt of that wallet's capsules, newest first (used by `/vault`; never letters)
- `POST /api/open` → `{ id, answer }` → full capsule (without `answerHash`) if the answer is right, else 401
- `GET /api/badge/<year>` → the badge SVG for that class year (design: Testudo peeking out of an envelope, drawn in `lib/badge.ts`)
- `POST /api/upload` → form-data with one `file` → saves it to `public/uploads/` with a random name → `{ url }`
- `POST /api/seal` → saves capsule, hashes it, sends a devnet memo tx containing `TERP-CAPSULE:<hash>` → `{ id, sealTx, explorerUrl }`
- `POST /api/verify` → `{ id }` → re-hashes, reads the memo from `sealTx` on chain, compares → `{ verified, sealedAt }`
- `POST /api/mint-badge` → `{ id }` → mints NFT (name "Terp Class of <year>", PNG of `/api/badge/<year>` on IPFS); only called after verify passes; never mints twice for one capsule to the capsule's wallet → `{ mintAddress, explorerUrl }`
- Explorer links use `?cluster=devnet`.

## Design
- UMD colors: red #E21833, gold #FFD200, black, white. Warm, nostalgic, slightly playful.
- Turtle-shell / wax-seal motif. Rounded cards, generous spacing, readable fonts.
- Fun loading text: "Testudo is guarding your capsule...", "Pressing the wax seal...", "Asking Solana to remember this forever..."
- Mobile-friendly.

## Build order (do one step at a time; each must work before the next)
1. Scaffold the Next.js app, Tailwind, all 5 pages with hardcoded sample data and the design style. **Done when:** you can click through every page.
2. JSON storage: `/write` saves a capsule, `/vault` lists real ones. **Done when:** a new capsule shows in the vault after refresh.
3. Photo uploads: 3 upload sections on `/write` + `/api/upload`; photos show on `/capsule/[id]`. **Done when:** an uploaded photo appears in `public/uploads/` and on the opened capsule.
4. Script `scripts/make-wallet.ts` that generates the server keypair and prints the public key + the line to paste into `.env.local`. **Done when:** we've funded it at faucet.solana.com.
5. `/api/seal` memo transaction. **Done when:** the Explorer link opens and shows our memo.
6. `/api/verify`. **Done when:** an unchanged capsule shows ✅, and manually editing the letter in the JSON shows ⚠️.
7. `/api/mint-badge`. **Done when:** the badge appears in a Phantom wallet set to devnet.
8. Polish: animations, loading text, empty states, Skip to Graduation. **Done when:** the full demo runs 3 times with no errors.

## Stretch goals (only if time is left after step 8)
- Face ID with FACEIO (fio.js, free plan or trial): scan face on seal, scan again on open. Keep the secret question as a "Can't scan?" backup. Needs the FACEIO app Public ID.
- "Sign in with Phantom": prove wallet ownership with a signature instead of typing the address (needs wallet-connect code).
