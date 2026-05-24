import { type UiWalletAccount } from '@wallet-ui/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import type { OutlierDeck } from '@/outlierdeck/data-access/outlierdeck-deck'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { useMintOutlierDeckAsset } from '@/outlierdeck/data-access/use-mint-outlierdeck-asset'
import { OutlierDeckUiMintPanel } from '@/outlierdeck/ui/outlierdeck-ui-mint-panel'

export function OutlierDeckFeatureMint({
  account,
  client,
  deck,
  setVerifierAsset,
}: {
  account: UiWalletAccount
  client: SolanaClient
  deck: OutlierDeck
  setVerifierAsset: (assetAddress: string) => void
}) {
  const { error, isMinting, mintOutlierDeckAsset, result } = useMintOutlierDeckAsset({ account, client })

  useEffect(() => {
    if (result?.assetAddress) {
      setVerifierAsset(result.assetAddress)
    }
  }, [result?.assetAddress, setVerifierAsset])

  return (
    <OutlierDeckUiMintPanel
      deck={deck}
      error={error}
      isMinting={isMinting}
      mintDeck={() => {
        mintOutlierDeckAsset(deck)
          .then((mintResult) => {
            toast.success('OutlierDeck minted', { description: mintResult.assetAddress })
          })
          .catch((mintError: unknown) => {
            toast.error('OutlierDeck mint failed', {
              description: mintError instanceof Error ? mintError.message : String(mintError),
            })
          })
      }}
      owner={account.address}
      result={result}
    />
  )
}
