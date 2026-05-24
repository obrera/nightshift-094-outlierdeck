import { airdropFactory, createKeyPairSignerFromBytes, devnet, generateKeyPairSigner, lamports } from '@solana/kit'
import { readFile } from 'node:fs/promises'

import { executeMintOutlierDeckAsset } from '../src/outlierdeck/data-access/execute-mint-outlierdeck-asset'
import { buildOutlierDeck, createMetadataUri } from '../src/outlierdeck/data-access/outlierdeck-deck'
import { createSolanaClient } from '../src/solana/data-access/create-solana-client'

const http = devnet(process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com')
const ws = devnet(process.env.SOLANA_WS_URL ?? 'wss://api.devnet.solana.com')
const client = createSolanaClient({ http, ws })
const payer = process.env.PROOF_KEYPAIR_PATH
  ? await readProofSigner(process.env.PROOF_KEYPAIR_PATH)
  : await generateKeyPairSigner()
const deck = buildOutlierDeck(process.env.PROOF_DECK_SEED ?? 'proof-094-outlierdeck')
const proofAirdropLamports = BigInt(process.env.PROOF_AIRDROP_LAMPORTS ?? '200000000')

console.log(`Proof signer: ${payer.address}`)
console.log(`Deck: ${deck.callsign} / ${deck.deckHash}`)

const uri = createMetadataUri(deck, payer.address)
const preflightMetadataResponse = await fetch(uri)

if (
  !preflightMetadataResponse.ok ||
  !preflightMetadataResponse.headers.get('content-type')?.includes('application/json')
) {
  throw new Error(`Metadata preflight failed for ${uri}: HTTP ${preflightMetadataResponse.status}`)
}

const airdrop = airdropFactory({ rpc: client.rpc, rpcSubscriptions: client.rpcSubscriptions })
await requestProofAirdrop()

const result = await executeMintOutlierDeckAsset({
  client,
  deck,
  transactionSigner: payer,
})
const metadataResponse = await fetch(result.uri)

if (!metadataResponse.ok) {
  throw new Error(`Minted metadata URI returned HTTP ${metadataResponse.status}`)
}

const metadata = await metadataResponse.json()
const imageResponse = await fetch(metadata.image)

if (!imageResponse.ok || !imageResponse.headers.get('content-type')?.includes('image/svg+xml')) {
  throw new Error(`Minted image URI returned HTTP ${imageResponse.status}`)
}

console.log(
  JSON.stringify(
    {
      assetAddress: result.assetAddress,
      assetName: result.assetName,
      attributes: metadata.attributes.length,
      deckHash: result.deckHash,
      imageStatus: imageResponse.status,
      owner: result.owner,
      signature: result.signature,
      uri: result.uri,
      uriLength: result.uri.length,
      verified: result.verified,
    },
    null,
    2,
  ),
)

async function readProofSigner(path: string) {
  const keypairBytes = new Uint8Array(JSON.parse(await readFile(path, 'utf8')) as number[])
  return createKeyPairSignerFromBytes(keypairBytes)
}

async function requestProofAirdrop() {
  const { value: balance } = await client.rpc.getBalance(payer.address, { commitment: 'confirmed' }).send()

  if (balance >= 50_000_000n) {
    return
  }

  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await airdrop({
        commitment: 'confirmed',
        lamports: lamports(proofAirdropLamports),
        recipientAddress: payer.address,
      })
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
    }
  }

  throw lastError
}
