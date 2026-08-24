import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const token = process.env.SANITY_AUTH_TOKEN
if (!token) {
  console.error('Set SANITY_AUTH_TOKEN first')
  process.exit(1)
}

const client = createClient({
  projectId: 's9zhmx70',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8'))
}

async function uploadImageFromUrl(url, filename) {
  if (!url) return undefined
  try {
    const res = await fetch(url)
    if (!res.ok) return undefined
    const buf = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buf, { filename })
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    }
  } catch (e) {
    console.warn('Image skip', filename, e.message)
    return undefined
  }
}

async function main() {
  const cities = load('cities.json')
  const locations = load('locations.json')
  const masterpieces = load('masterpieces.json')

  console.log('Importing cities...', cities.length)
  for (const c of cities) {
    const _id = `city-${c.id}`
    const heroImage = await uploadImageFromUrl(c.heroImage, `${c.id}-hero.jpg`)
    await client.createOrReplace({
      _id,
      _type: 'city',
      name: c.name,
      slug: { _type: 'slug', current: c.id },
      country: c.country,
      tagline: c.tagline || '',
      intro: c.intro || '',
      ...(heroImage ? { heroImage } : {}),
    })
    console.log('  city', c.id)
  }

  console.log('Importing locations...', locations.length)
  for (const l of locations) {
    const _id = `location-${l.id}`
    const image = await uploadImageFromUrl(l.image, `${l.id}.jpg`)
    await client.createOrReplace({
      _id,
      _type: 'location',
      name: l.name,
      slug: { _type: 'slug', current: l.id },
      city: { _type: 'reference', _ref: `city-${l.cityId}` },
      kind: l.kind,
      shortGuide: l.shortGuide,
      ...(l.highlights ? { highlights: l.highlights } : {}),
      ...(image ? { image } : {}),
    })
    console.log('  location', l.id)
  }

  console.log('Importing masterpieces...', masterpieces.length)
  for (const m of masterpieces) {
    const _id = `masterpiece-${m.id}`
    const image = await uploadImageFromUrl(m.image, `${m.id}.jpg`)
    await client.createOrReplace({
      _id,
      _type: 'masterpiece',
      title: m.title,
      slug: { _type: 'slug', current: m.id },
      artist: m.artist || '',
      year: m.year || '',
      kind: m.kind,
      city: { _type: 'reference', _ref: `city-${m.cityId}` },
      ...(m.locationId
        ? { location: { _type: 'reference', _ref: `location-${m.locationId}` } }
        : {}),
      cardBlurb: m.cardBlurb || '',
      timerSeconds: m.timerSeconds || 300,
      lookingPrompts: m.lookingPrompts || [],
      whatItAsked: m.whatItAsked || '',
      whatItFormed: m.whatItFormed || '',
      ...(image ? { image } : {}),
    })
    console.log('  masterpiece', m.id)
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
