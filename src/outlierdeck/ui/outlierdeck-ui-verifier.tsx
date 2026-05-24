import type { FormEvent } from 'react'

import { SearchCheck } from 'lucide-react'

import type { OutlierDeckVerification } from '@/outlierdeck/data-access/verify-outlierdeck-asset'

import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'

export function OutlierDeckUiVerifier({
  assetAddress,
  isVerifying,
  result,
  setAssetAddress,
  verifyAsset,
  verifyError,
}: {
  assetAddress: string
  isVerifying: boolean
  result?: OutlierDeckVerification
  setAssetAddress: (value: string) => void
  verifyAsset: () => void
  verifyError: null | unknown
}) {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.045] p-4">
      <h2 className="text-lg font-semibold text-white">Asset verifier</h2>
      <p className="text-sm text-cyan-100/60">Read a devnet MPL Core asset and check the metadata/media endpoints.</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          verifyAsset()
        }}
      >
        <Input
          className="min-w-0 flex-1 bg-black/35"
          onChange={(event) => setAssetAddress(event.target.value)}
          placeholder="MPL Core asset address"
          value={assetAddress}
        />
        <Button disabled={isVerifying || !assetAddress.trim()} type="submit">
          <SearchCheck />
          Verify
        </Button>
      </form>
      {verifyError ? (
        <p className="mt-3 text-sm text-red-200">
          {verifyError instanceof Error ? verifyError.message : String(verifyError)}
        </p>
      ) : null}
      {result ? (
        <dl className="mt-4 grid gap-2 text-xs text-cyan-50">
          <div>
            <dt className="text-cyan-100/50">Name</dt>
            <dd>{result.name}</dd>
          </div>
          <div>
            <dt className="text-cyan-100/50">Owner</dt>
            <dd className="break-all">{result.owner}</dd>
          </div>
          <div>
            <dt className="text-cyan-100/50">Update authority</dt>
            <dd className="break-all">{result.updateAuthority}</dd>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span>Attributes {result.metadataAttributes}</span>
            <span>Image HTTP {result.imageStatus}</span>
          </div>
        </dl>
      ) : null}
    </section>
  )
}
