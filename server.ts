import { Hono } from 'hono'

import {
  buildOutlierDeckFromParams,
  createOutlierDeckMetadata,
  createOutlierDeckSvg,
  parseOutlierDeckParams,
} from './src/outlierdeck/data-access/outlierdeck-deck'

const app = new Hono()
const port = Number(process.env.PORT ?? 3000)
const distRoot = new URL('./dist/', import.meta.url)
const publicRoot = new URL('./public/', import.meta.url)

app.get('/health', (context) => context.json({ ok: true, project: 'OutlierDeck 094' }))
app.get('/api/health', (context) => context.json({ ok: true, project: 'OutlierDeck 094' }))

app.get('/api/outlierdeck/metadata', (context) => {
  const params = parseOutlierDeckParams(new URL(context.req.url).searchParams)

  if (!params) {
    return context.json({ error: 'Invalid OutlierDeck trait query.' }, 400)
  }

  const deck = buildOutlierDeckFromParams(params)
  return context.json(createOutlierDeckMetadata(deck, context.req.query('o') ?? 'unknown-holder'), 200, {
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=300',
  })
})

app.get('/api/outlierdeck/image', (context) => {
  const params = parseOutlierDeckParams(new URL(context.req.url).searchParams)

  if (!params) {
    return context.json({ error: 'Invalid OutlierDeck trait query.' }, 400)
  }

  const deck = buildOutlierDeckFromParams(params)
  return context.body(createOutlierDeckSvg(deck), 200, {
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=300',
    'content-type': 'image/svg+xml; charset=utf-8',
  })
})

app.get('*', async (context) => {
  const url = new URL(context.req.url)

  if (url.pathname.includes('..')) {
    return context.text('Bad request', 400)
  }

  const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1)
  const distFile = Bun.file(new URL(filePath, distRoot))

  if (await distFile.exists()) {
    return new Response(distFile)
  }

  const publicFile = Bun.file(new URL(filePath, publicRoot))

  if (await publicFile.exists()) {
    return new Response(publicFile)
  }

  if (filePath.startsWith('assets/') || filePath.startsWith('opos-outliers/') || /\.[a-z0-9]+$/i.test(filePath)) {
    return context.text('Not found', 404)
  }

  return new Response(Bun.file(new URL('index.html', distRoot)))
})

Bun.serve({
  fetch: app.fetch,
  port,
})

console.log(`OutlierDeck 094 server listening on ${port}`)
