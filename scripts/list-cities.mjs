import { createClient } from '@sanity/client'
const client = createClient({
  projectId: 's9zhmx70',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
const rows = await client.fetch(`*[_type == "city"]{ name, "slug": slug.current, _id }`)
console.log(rows)
