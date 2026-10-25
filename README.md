# 🐢 Terp Time Capsule

Write a letter to your future self, sealed until graduation. The capsule's fingerprint is recorded on **Solana**, so nobody can edit or backdate it. On graduation day you answer your secret question, the app proves the letter is untouched, and you get a **Terp Class of 20XX** badge NFT.

Built for the **Best Use of Solana** and **UMD Challenge** tracks.

---

## Set it up on your laptop (about 10 minutes)

You need [Node.js](https://nodejs.org) (version 20 or newer) and Git.

**1. Get the code**

```bash
git clone https://github.com/mannetheeksha/GDEV-Hacktoberfest-Project.git
cd GDEV-Hacktoberfest-Project
npm install
```

**2. Add the secret keys**

Create a file called `.env.local` in the project folder (same level as `package.json`) with these two lines. Ask Theeksha to send you the real values in a **private message**:

```
SOLANA_SECRET_KEY=[...the numbers...]
PINATA_JWT=eyJ...
```

- `SOLANA_SECRET_KEY` is the server wallet that pays for every Solana transaction (devnet only, fake money).
- `PINATA_JWT` uploads the badge pictures to IPFS.

⚠️ Never commit `.env.local` or paste these keys anywhere public. Git already ignores this file.

**3. Run it**

```bash
npm run dev
```

Open http://localhost:3000.

> If you change `.env.local`, stop the server (Ctrl + C) and run `npm run dev` again.

---

## Try the demo

1. **Write** → fill in the form. For the wallet, paste a **Solana** wallet address (e.g. from Phantom). Pick a secret question and remember your answer.
2. **Seal my capsule** → watch the sealing animation → **View on Solana Explorer** shows the `TERP-CAPSULE:<hash>` memo.
3. **Go to the Vault** → your capsule is 🔒 Locked until graduation.
4. Click **⏩ Skip to Graduation** → **Open** → answer your secret question.
5. Watch the fingerprint scan (✅ unedited), the envelope open, and the badge mint with confetti.
6. **View badge on Explorer** shows the NFT on Solana. (To see it in Phantom, turn on Settings → Developer Settings → Testnet Mode → Solana Devnet.)

**Tamper test:** open `data/capsules.json`, change one word in a capsule's `"letter"`, save, and open that capsule again → ⚠️ Tampered.

---

## Good to know

- **Capsules live on each laptop.** They're saved in `data/capsules.json` and photos in `public/uploads/`. Neither is in Git, so your teammates won't see your capsules. Run the final demo from **one** laptop.
- **Devnet only.** Nothing here uses real money.
- **Server wallet out of SOL?** Paste its public address (`8E1jzK8FrJwbPoSyrjdvzsxrmfLpoCRg2pfkJ1Y372Me`) into https://faucet.solana.com, choose Devnet, and request more.
- The full build spec is in [`CLAUDE.md`](CLAUDE.md).

## How it works

| Piece | Where |
|---|---|
| Pages: write, sealing, vault, capsule | `app/` |
| Save / list capsules (JSON file) | `lib/capsules.ts`, `app/api/seal`, `app/api/capsules` |
| Secret question unlock | `app/api/open` |
| Solana memo seal + verify | `lib/solana.ts`, `app/api/seal`, `app/api/verify` |
| Badge picture (drawn in code, any class year) | `lib/badge.ts`, `app/api/badge/[year]` |
| Badge NFT (Pinata + Metaplex) | `lib/nft.ts`, `app/api/mint-badge` |
| Opening animation + confetti | `app/capsule/[id]/`, `app/animations.css` |
| Make a new server wallet | `npm run make-wallet` |

Tech: Next.js + TypeScript + Tailwind, `@solana/web3.js` v1, Metaplex Umi, Pinata (IPFS), Solana devnet.
