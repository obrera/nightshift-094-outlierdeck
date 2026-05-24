import { Lock, Shuffle } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Checkbox } from '@/core/ui/checkbox'
import { Label } from '@/core/ui/label'
import { OUTLIER_TRAITS, type OutlierDeckParams } from '@/outlierdeck/data-access/outlierdeck-deck'

interface ComposerProps {
  lockedTraits: Set<keyof OutlierDeckParams>
  params: OutlierDeckParams
  randomizeDeck: () => void
  setLockedTraits: (traits: Set<keyof OutlierDeckParams>) => void
  setTraitIndex: (key: keyof OutlierDeckParams, value: number) => void
}

const ROWS: Array<{ key: keyof OutlierDeckParams; label: string; values: string[] }> = [
  { key: 'b', label: 'Backdrop', values: OUTLIER_TRAITS.background },
  { key: 'x', label: 'Head', values: OUTLIER_TRAITS.head },
  { key: 'h', label: 'Hair', values: OUTLIER_TRAITS.hair },
  { key: 'f', label: 'Face', values: OUTLIER_TRAITS.face },
  { key: 's', label: 'Shirt', values: OUTLIER_TRAITS.shirt },
  { key: 'l', label: 'Logo', values: OUTLIER_TRAITS.logo },
  { key: 'p', label: 'Pants', values: OUTLIER_TRAITS.pants },
  { key: 'r', label: 'Shoes', values: OUTLIER_TRAITS.shoes },
]

export function OutlierDeckUiComposer({
  lockedTraits,
  params,
  randomizeDeck,
  setLockedTraits,
  setTraitIndex,
}: ComposerProps) {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Trait layer forge</h2>
          <p className="text-sm text-cyan-100/60">Lock favorites, then roll the remaining OPOS layers.</p>
        </div>
        <Button onClick={randomizeDeck} size="lg">
          <Shuffle />
          Roll
        </Button>
      </div>
      <div className="grid gap-3">
        {ROWS.map((row) => {
          const isLocked = lockedTraits.has(row.key)
          return (
            <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3" key={row.key}>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-semibold text-cyan-100/70 uppercase" htmlFor={`trait-${row.key}`}>
                  {row.label}
                </Label>
                <label className="flex items-center gap-2 text-xs text-cyan-100/60">
                  <Checkbox
                    checked={isLocked}
                    onCheckedChange={(checked) => {
                      const next = new Set(lockedTraits)
                      if (checked) {
                        next.add(row.key)
                      } else {
                        next.delete(row.key)
                      }
                      setLockedTraits(next)
                    }}
                  />
                  <Lock className="size-3" />
                </label>
              </div>
              <select
                className="h-9 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-lime-300"
                id={`trait-${row.key}`}
                onChange={(event) => setTraitIndex(row.key, Number(event.target.value))}
                value={params[row.key]}
              >
                {row.values.map((value, index) => (
                  <option key={value} value={index}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </section>
  )
}
