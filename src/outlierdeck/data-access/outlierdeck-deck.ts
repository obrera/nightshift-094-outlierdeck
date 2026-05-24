export interface OutlierDeck {
  attributes: OutlierDeckAttributes
  callsign: string
  deckHash: string
  focus: number
  id: string
  layers: OutlierLayer[]
  momentum: number
  params: OutlierDeckParams
  rarity: number
  readiness: 'Forge-ready' | 'Tune traits'
  role: string
  squad: Array<{ label: string; value: string }>
  synergy: string[]
}

export interface OutlierDeckAttributes {
  background: string
  face: string
  hair: string
  head: string
  logo: string
  pants: string
  shirt: string
  shoes: string
}

export interface OutlierDeckMetadata {
  attributes: Array<{ trait_type: string; value: number | string }>
  description: string
  external_url: string
  image: string
  name: string
  properties: {
    category: string
    files: Array<{ type: string; uri: string }>
    outlier: OutlierDeck
  }
  symbol: string
}

export interface OutlierDeckParams {
  b: number
  f: number
  h: number
  l: number
  p: number
  r: number
  s: number
  x: number
}

export interface OutlierLayer {
  label: keyof OutlierDeckAttributes
  path: string
  value: string
}

export const OUTLIERDECK_ORIGIN = 'https://outlierdeck094.colmena.dev'

const ASSET_ROOT = '/opos-outliers/attributes'
const BACKGROUNDS = ['Abstract', 'Blue', 'Green', 'Purple', 'Red', 'Solana', 'TipLink', 'Yellow']
const HEADS = ['Alien', 'Skin1', 'Skin2', 'Skin3', 'Skin4', 'Skin5', 'Zombie']
const HAIR = [
  'BeanieBlack',
  'BeanieSolana',
  'Bonk',
  'DAA',
  'Daisy',
  'DevilHorns',
  'Halo',
  'Hat',
  'Headband',
  'Mohawk',
  'Pony Tail1',
  'SMB',
  'Samo',
]
const FACES = ['BasicSmile', 'Cursed', 'Duck', 'LaserEyesRed', 'SolanaViper', 'Sus', 'TipLinkViper', 'Vampire', 'Visor']
const SHIRTS = ['Black', 'Blue', 'Gold', 'Green', 'Grey', 'Red', 'SolBlue', 'SolGreen', 'SolPurple', 'White']
const LOGOS = ['3Land', 'Drift', 'Helius', 'Metaplex', 'Solana', 'TipLink']
const PANTS = ['Blue', 'DarkGrey', 'Gold', 'Green', 'Khaki', 'LightGrey', 'Magenta', 'Red', 'Solana']
const SHOES = ['Black', 'Blue', 'Gold', 'Green', 'Grey', 'Red', 'SolBlue', 'SolGreen', 'SolPurple', 'White']
const ROLES = ['Rift Striker', 'Vault Runner', 'Signal Medic', 'Deck Captain', 'Forge Analyst', 'Arena Scout']

export const OUTLIER_TRAITS = {
  background: BACKGROUNDS,
  face: FACES,
  hair: HAIR,
  head: HEADS,
  logo: LOGOS,
  pants: PANTS,
  shirt: SHIRTS,
  shoes: SHOES,
}

export function buildOutlierDeck(seed: string): OutlierDeck {
  return buildOutlierDeckFromParams(createOutlierDeckParams(seed))
}

export function buildOutlierDeckFromParams(params: OutlierDeckParams): OutlierDeck {
  const safeParams = sanitizeOutlierDeckParams(params)
  const attributes: OutlierDeckAttributes = {
    background: BACKGROUNDS[safeParams.b] ?? BACKGROUNDS[0],
    face: FACES[safeParams.f] ?? FACES[0],
    hair: HAIR[safeParams.h] ?? HAIR[0],
    head: HEADS[safeParams.x] ?? HEADS[0],
    logo: LOGOS[safeParams.l] ?? LOGOS[0],
    pants: PANTS[safeParams.p] ?? PANTS[0],
    shirt: SHIRTS[safeParams.s] ?? SHIRTS[0],
    shoes: SHOES[safeParams.r] ?? SHOES[0],
  }
  const deckHash = getOutlierDeckHash(attributes)
  const rareSignals = [
    attributes.background === 'TipLink',
    attributes.background === 'Solana',
    attributes.head === 'Alien',
    attributes.head === 'Zombie',
    attributes.face.includes('Viper'),
    attributes.face === 'LaserEyesRed',
    attributes.hair === 'Halo',
    attributes.hair === 'DevilHorns',
    attributes.logo === 'Metaplex',
    attributes.logo === 'TipLink',
    attributes.shirt === 'Gold',
    attributes.pants === 'Solana',
    attributes.shoes === 'Gold',
  ].filter(Boolean).length
  const brandMatch =
    Number(attributes.background === 'Solana') +
    Number(attributes.logo === 'Solana') +
    Number(attributes.pants === 'Solana') +
    Number(attributes.shirt.startsWith('Sol')) +
    Number(attributes.shoes.startsWith('Sol'))
  const focus = clamp(54 + rareSignals * 5 + brandMatch * 3 + (hashNumber(deckHash) % 13), 0, 100)
  const momentum = clamp(48 + brandMatch * 7 + (Math.abs(hashNumber(attributes.face + attributes.hair)) % 24), 0, 100)
  const rarity = clamp(38 + rareSignals * 9 + Math.round((focus + momentum) / 12), 0, 100)
  const role = ROLES[Math.abs(hashNumber(deckHash)) % ROLES.length] ?? ROLES[0]

  return {
    attributes,
    callsign: `OD-${deckHash.slice(0, 6)}`,
    deckHash,
    focus,
    id: `OutlierDeck ${deckHash.slice(0, 8)}`,
    layers: createOutlierLayers(attributes),
    momentum,
    params: safeParams,
    rarity,
    readiness: focus >= 62 && momentum >= 58 ? 'Forge-ready' : 'Tune traits',
    role,
    squad: [
      { label: 'Lead', value: role },
      { label: 'Patch', value: attributes.logo },
      { label: 'Tempo', value: momentum > 70 ? 'Fast lane' : 'Steady lane' },
    ],
    synergy: createSynergy(attributes, rareSignals, brandMatch),
  }
}

export function createMetadataUri(deck: OutlierDeck, owner: string) {
  return `${OUTLIERDECK_ORIGIN}/api/outlierdeck/metadata?${createOutlierDeckQueryString(deck.params, owner)}`
}

export function createOutlierDeckImageUrl(deck: OutlierDeck) {
  return `${OUTLIERDECK_ORIGIN}/api/outlierdeck/image?${createOutlierDeckQueryString(deck.params)}`
}

export function createOutlierDeckMetadata(deck: OutlierDeck, owner: string): OutlierDeckMetadata {
  const image = createOutlierDeckImageUrl(deck)

  return {
    attributes: [
      { trait_type: 'Callsign', value: deck.callsign },
      { trait_type: 'Role', value: deck.role },
      { trait_type: 'Background', value: deck.attributes.background },
      { trait_type: 'Head', value: deck.attributes.head },
      { trait_type: 'Hair', value: deck.attributes.hair },
      { trait_type: 'Face', value: deck.attributes.face },
      { trait_type: 'Shirt', value: deck.attributes.shirt },
      { trait_type: 'Logo', value: deck.attributes.logo },
      { trait_type: 'Rarity Score', value: deck.rarity },
      { trait_type: 'Owner', value: owner },
    ],
    description:
      'A wallet-signed MPL Core OutlierDeck character forged from OPOS Outliers trait layers. Ownership binds the selected deck, role, rarity score, and visual composition to the holder wallet.',
    external_url: `${OUTLIERDECK_ORIGIN}/deck?${createOutlierDeckQueryString(deck.params)}`,
    image,
    name: `OutlierDeck ${deck.callsign}`,
    properties: {
      category: 'game-character-deck',
      files: [{ type: 'image/svg+xml', uri: image }],
      outlier: deck,
    },
    symbol: 'OD094',
  }
}

export function createOutlierDeckParams(seed: string): OutlierDeckParams {
  const random = seededRandom(seed.trim() || 'outlierdeck-094')

  return {
    b: Math.floor(random() * BACKGROUNDS.length),
    f: Math.floor(random() * FACES.length),
    h: Math.floor(random() * HAIR.length),
    l: Math.floor(random() * LOGOS.length),
    p: Math.floor(random() * PANTS.length),
    r: Math.floor(random() * SHOES.length),
    s: Math.floor(random() * SHIRTS.length),
    x: Math.floor(random() * HEADS.length),
  }
}

export function createOutlierDeckQueryString(params: OutlierDeckParams, owner?: string) {
  const safeParams = sanitizeOutlierDeckParams(params)
  const query = new URLSearchParams({
    b: safeParams.b.toString(10),
    f: safeParams.f.toString(10),
    h: safeParams.h.toString(10),
    l: safeParams.l.toString(10),
    p: safeParams.p.toString(10),
    r: safeParams.r.toString(10),
    s: safeParams.s.toString(10),
    x: safeParams.x.toString(10),
  })

  if (owner) {
    query.set('o', owner)
  }

  return query.toString()
}

export function createOutlierDeckSvg(deck: OutlierDeck) {
  const images = deck.layers
    .map((layer) => {
      const href = `${OUTLIERDECK_ORIGIN}${layer.path}`
      return `<image href="${escapeXml(href)}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" />`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" role="img" aria-label="${escapeXml(deck.id)}"><rect width="1000" height="1000" fill="#090d12"/><g>${images}</g><rect x="38" y="802" width="924" height="126" rx="18" fill="#05070a" opacity=".72"/><text x="72" y="858" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#f6f7fb">${escapeXml(deck.callsign)}</text><text x="72" y="902" font-family="Arial, sans-serif" font-size="28" fill="#91f7d3">${escapeXml(deck.role)} / Rarity ${deck.rarity}</text></svg>`
}

export function getOutlierDeckHash(attributes: OutlierDeckAttributes) {
  const stable = JSON.stringify(attributes)
  return Math.abs(hashNumber(stable)).toString(36).toUpperCase().padStart(8, '0')
}

export function parseOutlierDeckParams(searchParams: URLSearchParams): null | OutlierDeckParams {
  const keys = ['b', 'f', 'h', 'l', 'p', 'r', 's', 'x'] as const
  const values = Object.fromEntries(keys.map((key) => [key, Number(searchParams.get(key))]))

  if (keys.some((key) => !Number.isFinite(values[key]))) {
    return null
  }

  return sanitizeOutlierDeckParams(values as unknown as OutlierDeckParams)
}

export function setOutlierDeckParam(
  params: OutlierDeckParams,
  key: keyof OutlierDeckParams,
  value: number,
): OutlierDeckParams {
  return sanitizeOutlierDeckParams({ ...params, [key]: value })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createOutlierLayers(attributes: OutlierDeckAttributes): OutlierLayer[] {
  return [
    {
      label: 'background',
      path: `${ASSET_ROOT}/Backgrounds/${attributes.background}.png`,
      value: attributes.background,
    },
    { label: 'pants', path: `${ASSET_ROOT}/Legs/Pants/${attributes.pants}.png`, value: attributes.pants },
    { label: 'shoes', path: `${ASSET_ROOT}/Feet/Shoes/${attributes.shoes}.png`, value: attributes.shoes },
    { label: 'shirt', path: `${ASSET_ROOT}/Torso/Shirt/${attributes.shirt}.png`, value: attributes.shirt },
    { label: 'logo', path: `${ASSET_ROOT}/Torso/Logos/${attributes.logo}.png`, value: attributes.logo },
    { label: 'head', path: `${ASSET_ROOT}/Heads/Color/${attributes.head}.png`, value: attributes.head },
    { label: 'face', path: `${ASSET_ROOT}/Heads/Faces/${attributes.face}.png`, value: attributes.face },
    { label: 'hair', path: `${ASSET_ROOT}/Heads/Hair/${attributes.hair}.png`, value: attributes.hair },
  ]
}

function createSynergy(attributes: OutlierDeckAttributes, rareSignals: number, brandMatch: number) {
  return [
    brandMatch >= 3 ? 'Solana colorway chain bonus' : 'Mixed-brand flex lane',
    rareSignals >= 4 ? 'High-rarity visual pressure' : 'Balanced rarity curve',
    attributes.face.includes('Viper') ? 'Viper threat read' : `${attributes.face} social read`,
  ]
}

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function hashNumber(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash
}

function sanitizeOutlierDeckParams(params: OutlierDeckParams): OutlierDeckParams {
  return {
    b: clamp(Math.round(params.b), 0, BACKGROUNDS.length - 1),
    f: clamp(Math.round(params.f), 0, FACES.length - 1),
    h: clamp(Math.round(params.h), 0, HAIR.length - 1),
    l: clamp(Math.round(params.l), 0, LOGOS.length - 1),
    p: clamp(Math.round(params.p), 0, PANTS.length - 1),
    r: clamp(Math.round(params.r), 0, SHOES.length - 1),
    s: clamp(Math.round(params.s), 0, SHIRTS.length - 1),
    x: clamp(Math.round(params.x), 0, HEADS.length - 1),
  }
}

function seededRandom(seed: string) {
  let state = Math.abs(hashNumber(seed)) || 1

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}
