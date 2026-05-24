import { ExternalLink, Pickaxe } from 'lucide-react'

import type { MintOutlierDeckAssetResult } from '@/outlierdeck/data-access/execute-mint-outlierdeck-asset'
import type { OutlierDeck } from '@/outlierdeck/data-access/outlierdeck-deck'

import { Button } from '@/core/ui/button'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'

export function OutlierDeckUiMintPanel({
  error,
  isMinting,
  mintDeck,
  owner,
  result,
}: {
  deck: OutlierDeck
  error: null | unknown
  isMinting: boolean
  mintDeck: () => void
  owner: string
  result?: MintOutlierDeckAssetResult
}) {
  return (
    <section className="rounded-md border border-lime-300/20 bg-lime-300/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Wallet forge</h2>
          <p className="text-sm text-lime-100/70">
            Connected wallet signs as payer, authority, owner, and update authority.
          </p>
        </div>
        <Pickaxe className="size-5 text-lime-200" />
      </div>
      <p className="mt-3 text-xs break-all text-lime-50/70">Owner {owner}</p>
      <Button className="mt-4 w-full" disabled={isMinting} onClick={mintDeck} size="lg">
        <Pickaxe />
        {isMinting ? 'Minting MPL Core asset...' : 'Mint MPL Core OutlierDeck'}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-red-200">{error instanceof Error ? error.message : String(error)}</p>
      ) : null}
      {result ? (
        <div className="mt-4 rounded-md border border-white/10 bg-black/35 p-3 text-sm text-lime-50">
          <div className="font-semibold">{result.verified ? 'Verified mint' : 'Mint submitted'}</div>
          <div className="mt-2 text-xs break-all text-lime-50/70">Asset {result.assetAddress}</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <SolanaUiExplorerLink
              className="inline-flex items-center gap-1 underline"
              label="Transaction"
              path={`/tx/${result.signature}`}
            />
            <SolanaUiExplorerLink
              className="inline-flex items-center gap-1 underline"
              label="Asset"
              path={`/address/${result.assetAddress}`}
            />
            <a className="inline-flex items-center gap-1 underline" href={result.uri} rel="noreferrer" target="_blank">
              Metadata <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      ) : null}
    </section>
  )
}
