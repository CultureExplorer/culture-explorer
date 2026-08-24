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

const locations = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'locations.json'), 'utf8')
)

async function main() {
  for (const loc of locations) {
    const _id = `location-${loc.id}`
    console.log('updating', loc.id)
    try {
      await client.createOrReplace({
        _id,
        _type: 'location',
        name: loc.name,
        slug: { _type: 'slug', current: loc.id },
        kind: loc.kind,
        shortGuide: loc.shortGuide || '',
        city: { _type: 'reference', _ref: `city-${loc.cityId}` },
      })
      console.log('  doc ok')
    } catch (e) {
      console.warn('  doc fail', loc.id, e.message)
    }
  }
  console.log('Done.')
}

main()
