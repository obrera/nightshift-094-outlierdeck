# OutlierDeck 094

OutlierDeck is Nightshift build 094: a dark-mode Solana game character collection app that lets players forge an OPOS-art character deck, score its readiness, mint it as a wallet-owned MPL Core devnet asset, and verify the resulting asset from the UI.

Live target: https://outlierdeck094.colmena.dev

Challenge reference: Nightshift build 094, OutlierDeck.
Implementation agent/model: Obrera recovery coding agent, OpenAI GPT-5 Codex, medium reasoning.

## Product

- OPOS trait layer composer with all 88 MIT PNG layers, randomizer, and per-trait locks.
- Character/deck readiness, rarity, focus, tempo, synergy, and squad role preview.
- Wallet-gated MPL Core mint panel using wallet-ui and Solana Kit.
- First-party metadata and SVG media endpoints at `/api/outlierdeck/metadata` and `/api/outlierdeck/image`.
- On-chain verifier that fetches an MPL Core devnet asset, checks metadata JSON, and checks media availability.

## Solana Architecture

Minting is client-side only. The connected wallet signs as payer, authority, owner, and update authority for the MPL Core asset. A browser-generated asset signer creates the new asset account. There is no server mint signer and no custodial authority.

The app uses:

- `@wallet-ui/react` for wallet UI and signer access.
- `@solana/kit` for transaction construction, fee checks, signing, sending, and RPC clients.
- `@obrera/mpl-core-kit-lib@0.0.3` imported by package name for MPL Core generated helpers.

It intentionally does not use `@solana/web3.js`, `@solana/wallet-adapter-react`, or Node `Buffer` in app/server code.

## Metadata API

- `GET /health` returns JSON health.
- `GET /api/outlierdeck/metadata?...` returns short MPL Core JSON metadata for selected traits and owner.
- `GET /api/outlierdeck/image?...` returns SVG media that visibly layers copied OPOS Outliers PNG trait art.
- Missing artwork URLs return 404 instead of falling through to the SPA.
- `/deck?...` is shareable selected trait state for the UI.

## Proof Script

`bun run proof` mirrors the UI mint path with a local devnet signer. It defaults to the live URL metadata endpoints and supports:

```bash
PROOF_KEYPAIR_PATH=/path/to/devnet-keypair.json bun run proof
```

Without `PROOF_KEYPAIR_PATH`, the script generates a temporary signer and requests a devnet airdrop.

## Run Locally

```bash
bun install
bun run dev
```

Production smoke path:

```bash
bun run build
PORT=3001 bun run start &
SERVER_PID=$!
curl http://localhost:3001/health
kill "$SERVER_PID"
wait "$SERVER_PID" 2>/dev/null || true
```

## Deployment

The included `Dockerfile` and `docker-compose.yml` run one Bun/Hono app on port `3000`, serving the Vite build and API routes for Dokploy-style single-container deployment.

## Challenge Reference

- Build number: 094
- Project: OutlierDeck
- Scaffold: `bun x create-seed@latest nightshift-094-outlierdeck -t bun-react-vite-solana-kit`
- Implementation agent/model: Obrera recovery coding agent, OpenAI GPT-5 Codex, medium reasoning

## OPOS Attribution

All 88 OPOS Outliers trait PNG layers in `public/opos-outliers/attributes` are copied from the TipLink OPOS Outliers source art referenced at `/tmp/opos-outliers-read/public/attributes`. TipLink OPOS Outliers is MIT licensed. See `public/opos-outliers/ATTRIBUTION.md`.

The app code, routes, UI composition, metadata server, and mint flow are original to OutlierDeck 094.
