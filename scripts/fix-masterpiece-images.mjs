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
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
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
    if (!m.image) {
      console.log('skip (no url)', m.id)
      continue
    }
    try {
      console.log('uploading', m.id)
      const image = await uploadImageFromUrl(m.image, `${m.id}.jpg`)
      await client.patch(_id).set({ image }).commit()
      console.log('  ok', m.id)
    } catch (e) {
      console.warn('  fail', m.id, e.message)
    }
  }
  console.log('Done.')
}

main()
