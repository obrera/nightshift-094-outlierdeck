import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  buildOutlierDeck,
  buildOutlierDeckFromParams,
  createOutlierDeckParams,
  type OutlierDeckParams,
  parseOutlierDeckParams,
  setOutlierDeckParam,
} from '@/outlierdeck/data-access/outlierdeck-deck'
import { OutlierDeckFeatureMint } from '@/outlierdeck/feature/outlierdeck-feature-mint'
import { OutlierDeckFeatureVerifier } from '@/outlierdeck/feature/outlierdeck-feature-verifier'
import { OutlierDeckUiComposer } from '@/outlierdeck/ui/outlierdeck-ui-composer'
import { OutlierDeckUiDeckReadiness } from '@/outlierdeck/ui/outlierdeck-ui-deck-readiness'
import { OutlierDeckUiMetadata } from '@/outlierdeck/ui/outlierdeck-ui-metadata'
import { OutlierDeckUiPortrait } from '@/outlierdeck/ui/outlierdeck-ui-portrait'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'

export function Component() {
  return <OutlierDeckFeatureEntry />
}

function HeroMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-cyan-200/15 bg-cyan-200/10 px-3 py-2">
      <div className="text-[10px] font-semibold text-cyan-100/55 uppercase">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function OutlierDeckFeatureEntry() {
  const [searchParams] = useSearchParams()
  const initialParams = useMemo(() => parseOutlierDeckParams(searchParams), [searchParams])
  const [params, setParams] = useState<OutlierDeckParams>(() => initialParams ?? createOutlierDeckParams('build-094'))
  const [lockedTraits, setLockedTraits] = useState<Set<keyof OutlierDeckParams>>(() => new Set())
  const [verifierAsset, setVerifierAsset] = useState('')
  const client = useSolanaClient()
  const deck = useMemo(() => buildOutlierDeckFromParams(params), [params])

  const randomizeDeck = useCallback(() => {
    const next = buildOutlierDeck(`${Date.now()}:${deck.deckHash}`).params
    setParams((current) => {
      const merged = { ...next }
      lockedTraits.forEach((key) => {
        merged[key] = current[key]
      })
      return merged
    })
  }, [deck.deckHash, lockedTraits])

  return (
    <div className="min-h-full bg-[#07090d] text-cyan-50">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 xl:grid-cols-[minmax(420px,1fr)_410px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold text-lime-200/70 uppercase">OPOS character deck forge</p>
              <h1 className="mt-1 text-4xl font-black text-white md:text-6xl">OutlierDeck</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <HeroMetric label="Rarity" value={deck.rarity} />
              <HeroMetric label="Focus" value={deck.focus} />
              <HeroMetric label="Tempo" value={deck.momentum} />
            </div>
          </div>
          <OutlierDeckUiPortrait deck={deck} />
        </section>

        <aside className="grid min-w-0 content-start gap-4">
          <OutlierDeckUiComposer
            lockedTraits={lockedTraits}
            params={params}
            randomizeDeck={randomizeDeck}
            setLockedTraits={setLockedTraits}
            setTraitIndex={(key, value) => setParams((current) => setOutlierDeckParam(current, key, value))}
          />
          <OutlierDeckUiDeckReadiness deck={deck} />
          <SolanaUiWalletGuard
            render={({ account }) => (
              <>
                <OutlierDeckUiMetadata deck={deck} owner={account.address} />
                <OutlierDeckFeatureMint
                  account={account}
                  client={client}
                  deck={deck}
                  setVerifierAsset={setVerifierAsset}
                />
              </>
            )}
          />
          <OutlierDeckFeatureVerifier assetAddress={verifierAsset} client={client} setAssetAddress={setVerifierAsset} />
        </aside>
      </div>
    </div>
  )
}
