import type { OutlierDeck } from '@/outlierdeck/data-access/outlierdeck-deck'

export function OutlierDeckUiPortrait({ deck }: { deck: OutlierDeck }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md border border-cyan-200/15 bg-black shadow-2xl shadow-cyan-950/50">
      {deck.layers.map((layer) => (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-contain [image-rendering:auto]"
          key={`${layer.label}-${layer.value}`}
          src={layer.path}
        />
      ))}
      <div className="absolute inset-x-5 bottom-5 rounded-md border border-black/50 bg-black/70 px-4 py-3 backdrop-blur">
        <div className="text-xs font-semibold text-cyan-200/70 uppercase">{deck.role}</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-white md:text-5xl">OutlierDeck</h1>
          <span className="rounded bg-lime-300 px-2 py-1 text-xs font-bold text-slate-950">{deck.callsign}</span>
        </div>
      </div>
    </div>
  )
}
