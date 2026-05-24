import { useMutation } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'

import type { OutlierDeck } from '@/outlierdeck/data-access/outlierdeck-deck'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { executeMintOutlierDeckAsset } from '@/outlierdeck/data-access/execute-mint-outlierdeck-asset'

export function useMintOutlierDeckAsset({ account, client }: { account: UiWalletAccount; client: SolanaClient }) {
  const transactionSigner = useWalletUiSigner({ account })
  const { data, error, isPending, mutateAsync, reset } = useMutation({
    mutationFn: (deck: OutlierDeck) => executeMintOutlierDeckAsset({ client, deck, transactionSigner }),
  })

  return {
    error,
    isMinting: isPending,
    mintOutlierDeckAsset: mutateAsync,
    resetMint: reset,
    result: data,
  }
}
