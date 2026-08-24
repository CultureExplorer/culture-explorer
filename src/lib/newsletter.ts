export type LatestPost = {
  title: string
  link: string
  description: string
  image: string
}

const FEED = "https://newsletter.thecultureexplorer.com/feed"

const FALLBACK: LatestPost = {
  title: "Open the newsletter",
  link: "https://newsletter.thecultureexplorer.com",
  description: "Essays and looking notes from Culture Explorer.",
  image:
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function pick(xml: string, re: RegExp) {
  const m = xml.match(re)
  return (m?.[1] || m?.[2] || "").trim()
}

export async function fetchLatestPost(): Promise<LatestPost> {
  try {
    const res = await fetch(FEED)
    if (!res.ok) return FALLBACK
    const xml = await res.text()
    const item = pick(xml, /<item>([\s\S]*?)<\/item>/i)
    if (!item) return FALLBACK

    let title = pick(item, /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)
    if (!title) title = stripTags(pick(item, /<title>([\s\S]*?)<\/title>/i))

    const link = pick(item, /<link>([\s\S]*?)<\/link>/i)

    let description = pick(
      item,
      /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i
    )
    if (!description)
      description = stripTags(pick(item, /<description>([\s\S]*?)<\/description>/i))
    description = stripTags(description).slice(0, 180)
    if (description.length === 180) description += "…"

    const image =
      pick(item, /<enclosure[^>]+url="([^"]+)"/i) ||
      FALLBACK.image

    if (!title || !link) return FALLBACK
    return { title, link, description, image }
  } catch {
    return FALLBACK
  }
}