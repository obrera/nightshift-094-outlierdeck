import type { OutlierDeck } from '@/outlierdeck/data-access/outlierdeck-deck'

import { Badge } from '@/core/ui/badge'

export function OutlierDeckUiDeckReadiness({ deck }: { deck: OutlierDeck }) {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Deck readiness</h2>
          <p className="text-sm text-cyan-100/60">{deck.id}</p>
        </div>
        <Badge variant={deck.readiness === 'Forge-ready' ? 'default' : 'outline'}>{deck.readiness}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Rarity" value={deck.rarity} />
        <Metric label="Focus" value={deck.focus} />
        <Metric label="Tempo" value={deck.momentum} />
      </div>
      <div className="mt-4 grid gap-2">
        {deck.squad.map((item) => (
          <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm" key={item.label}>
            <span className="text-cyan-100/55">{item.label}</span>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {deck.synergy.map((item) => (
          <span className="rounded bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100" key={item}>
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-lime-200/15 bg-lime-200/10 px-3 py-2 text-center">
      <div className="text-[10px] font-semibold text-lime-100/60 uppercase">{label}</div>
      <div className="text-2xl font-black text-lime-100">{value}</div>
    </div>
  )
}
