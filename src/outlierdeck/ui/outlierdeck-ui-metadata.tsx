import { Copy } from 'lucide-react'

import { Button } from '@/core/ui/button'
import {
  createMetadataUri,
  createOutlierDeckImageUrl,
  type OutlierDeck,
} from '@/outlierdeck/data-access/outlierdeck-deck'

export function OutlierDeckUiMetadata({ deck, owner }: { deck: OutlierDeck; owner?: string }) {
  const metadataUri = createMetadataUri(deck, owner ?? 'connected-wallet')
  const imageUri = createOutlierDeckImageUrl(deck)

  return (
    <section className="rounded-md border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">First-party metadata</h2>
        <Button
          onClick={() => void navigator.clipboard.writeText(metadataUri)}
          size="icon"
          title="Copy metadata URI"
          variant="outline"
        >
          <Copy />
        </Button>
      </div>
      <dl className="mt-3 grid gap-2 text-xs">
        <div>
          <dt className="text-cyan-100/50">Metadata URI</dt>
          <dd className="break-all text-cyan-50">{metadataUri}</dd>
        </div>
        <div>
          <dt className="text-cyan-100/50">Media URI</dt>
          <dd className="break-all text-cyan-50">{imageUri}</dd>
        </div>
      </dl>
    </section>
  )
}
