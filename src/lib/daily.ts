/** Stable day index (UTC) so the same day shows the same works. */
export function dayIndex(d = new Date()) {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000)
}

/** Pick `count` items from a list, rotating by date. */
export function pickDaily<T>(items: T[], count: number, d = new Date()): T[] {
  if (!items?.length) return []
  const start = dayIndex(d) % items.length
  const out: T[] = []
  for (let i = 0; i < Math.min(count, items.length); i++) {
    out.push(items[(start + i) % items.length])
  }
  return out
}