import { type BaseUpdateAuthority, fetchAssetV1 } from '@obrera/mpl-core-kit-lib/generated'
import { address } from '@solana/kit'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { type OutlierDeckMetadata } from '@/outlierdeck/data-access/outlierdeck-deck'

export interface OutlierDeckVerification {
  assetAddress: string
  imageStatus: number
  metadataAttributes: number
  name: string
  owner: string
  updateAuthority: string
  uri: string
}

export async function verifyOutlierDeckAsset(client: SolanaClient, assetAddress: string) {
  const asset = await fetchAssetV1(client.rpc, address(assetAddress), { commitment: 'confirmed' })
  const metadataResponse = await fetch(asset.data.uri)

  if (!metadataResponse.ok) {
    throw new Error(`Metadata URI returned HTTP ${metadataResponse.status}`)
  }

  const metadata = (await metadataResponse.json()) as OutlierDeckMetadata
  const imageResponse = await fetch(metadata.image)

  if (!imageResponse.ok) {
    throw new Error(`Image URI returned HTTP ${imageResponse.status}`)
  }

  return {
    assetAddress,
    imageStatus: imageResponse.status,
    metadataAttributes: metadata.attributes.length,
    name: asset.data.name,
    owner: asset.data.owner,
    updateAuthority: formatUpdateAuthority(asset.data.updateAuthority),
    uri: asset.data.uri,
  } satisfies OutlierDeckVerification
}

function formatUpdateAuthority(updateAuthority: BaseUpdateAuthority) {
  switch (updateAuthority.__kind) {
    case 'Address':
      return updateAuthority.fields[0]
    case 'Collection':
      return `Collection: ${updateAuthority.fields[0]}`
    case 'None':
      return 'None'
  }
}
