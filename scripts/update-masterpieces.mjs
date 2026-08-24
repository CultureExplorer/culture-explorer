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

const works = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'masterpieces.json'), 'utf8')
)

async function uploadImageFromUrl(url, filename) {
  if (!url) return null
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const type = res.headers.get('content-type') || ''
  if (!type.includes('image') && !type.includes('octet-stream')) {
    throw new Error(`Not an image (${type})`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buf, { filename })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  }
}

async function main() {
  for (const m of works) {
    const _id = `masterpiece-${m.id}`
    console.log('updating', m.id)
    try {
      let image
      if (m.image) {
        try {
          image = await uploadImageFromUrl(m.image, `${m.id}.jpg`)
          console.log('  image ok')
        } catch (e) {
          console.warn('  image fail:', e.message)
        }
      }

      const doc = {
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
      }

      await client.createOrReplace(doc)
      console.log('  doc ok')
    } catch (e) {
      console.warn('  doc fail', m.id, e.message)
    }
  }
  console.log('Done.')
}

main()
