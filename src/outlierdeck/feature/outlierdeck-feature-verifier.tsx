import { useMutation } from '@tanstack/react-query'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { verifyOutlierDeckAsset } from '@/outlierdeck/data-access/verify-outlierdeck-asset'
import { OutlierDeckUiVerifier } from '@/outlierdeck/ui/outlierdeck-ui-verifier'

export function OutlierDeckFeatureVerifier({
  assetAddress,
  client,
  setAssetAddress,
}: {
  assetAddress: string
  client: SolanaClient
  setAssetAddress: (value: string) => void
}) {
  const { data, error, isPending, mutate } = useMutation({
    mutationFn: () => verifyOutlierDeckAsset(client, assetAddress.trim()),
  })

  return (
    <OutlierDeckUiVerifier
      assetAddress={assetAddress}
      isVerifying={isPending}
      result={data}
      setAssetAddress={setAssetAddress}
      verifyAsset={() => mutate()}
      verifyError={error}
    />
  )
}
