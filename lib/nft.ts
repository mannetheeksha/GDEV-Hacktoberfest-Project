import { readFile, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { badgeSvg } from "@/lib/badge";

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// Remembers the uploaded NFT info for each class year, so we only upload once per year
const BADGES_FILE = path.join(process.cwd(), "data", "badges.json");

async function pinataUpload(endpoint: string, body: BodyInit, headers: Record<string, string> = {}) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is missing from .env.local");

  const res = await fetch(`https://api.pinata.cloud/pinning/${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, ...headers },
    body,
  });
  if (!res.ok) throw new Error(`Pinata upload failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return IPFS_GATEWAY + data.IpfsHash;
}

// Upload the badge picture + its NFT info (name, image, ...) to IPFS → link to the info file
async function getBadgeMetadataUri(year: number): Promise<string> {
  let saved: Record<string, string> = {};
  try {
    saved = JSON.parse(await readFile(BADGES_FILE, "utf-8"));
  } catch {
    // No badges uploaded yet
  }
  if (saved[year]) return saved[year];

  // 1. The picture (PNG works in every wallet)
  const png = await sharp(Buffer.from(badgeSvg(year))).png().toBuffer();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(png)], { type: "image/png" }), `terp-badge-${year}.png`);
  const imageUri = await pinataUpload("pinFileToIPFS", form);

  // 2. The NFT info file that wallets read
  const metadata = {
    name: `Terp Class of ${year}`,
    symbol: "TERP",
    description: `Earned by opening a Terp Time Capsule, sealed on Solana and unedited until graduation. Fear the Turtle! 🐢`,
    image: imageUri,
    attributes: [{ trait_type: "Class", value: String(year) }],
    properties: { files: [{ uri: imageUri, type: "image/png" }], category: "image" },
  };
  const metadataUri = await pinataUpload(
    "pinJSONToIPFS",
    JSON.stringify({ pinataContent: metadata, pinataMetadata: { name: `terp-badge-${year}.json` } }),
    { "Content-Type": "application/json" }
  );

  saved[year] = metadataUri;
  await writeFile(BADGES_FILE, JSON.stringify(saved, null, 2));
  return metadataUri;
}

// Mints a "Terp Class of <year>" NFT into `walletAddress` → the NFT's address
export async function mintBadge(walletAddress: string, year: number): Promise<string> {
  const uri = await getBadgeMetadataUri(year);

  const umi = createUmi("https://api.devnet.solana.com").use(mplTokenMetadata());
  const serverWallet = umi.eddsa.createKeypairFromSecretKey(
    Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY!))
  );
  umi.use(keypairIdentity(serverWallet)); // the server wallet pays

  const mint = generateSigner(umi);
  await createNft(umi, {
    mint,
    name: `Terp Class of ${year}`,
    symbol: "TERP",
    uri,
    sellerFeeBasisPoints: percentAmount(0),
    tokenOwner: publicKey(walletAddress), // the student receives it
  }).sendAndConfirm(umi);

  return mint.publicKey.toString();
}
