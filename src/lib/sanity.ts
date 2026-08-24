import { createClient } from "@sanity/client"

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "s9zhmx70",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
})

export async function fetchCities() {
  return client.fetch(`*[_type == "city"]|order(name asc){
    "id": slug.current,
    name,
    country,
    tagline,
    intro,
    "heroImage": heroImage.asset->url
  }`)
}

export async function fetchCitySlugs() {
  return client.fetch(`*[_type == "city" && defined(slug.current)].slug.current`)
}

export async function fetchCityBySlug(slug) {
  return client.fetch(
    `*[_type == "city" && slug.current == $slug][0]{
      "id": slug.current,
      name,
      country,
      tagline,
      intro,
      "heroImage": heroImage.asset->url,
      "locations": *[_type == "location" && city._ref == ^._id]|order(name asc){
        "id": slug.current,
        name,
        kind,
        shortGuide,
        "image": coalesce(image.asset->url, imageUrl)
      },
      "masterpieces": *[_type == "masterpiece" && city._ref == ^._id]|order(title asc){
        "id": slug.current,
        title,
        artist,
        year,
        kind,
        cardBlurb,
        "image": image.asset->url
      }
    }`,
    { slug }
  )
}

export async function fetchMasterpieces() {
  return client.fetch(`*[_type == "masterpiece"]|order(title asc){
    "id": slug.current,
    title,
    artist,
    year,
    kind,
    cardBlurb,
    "image": image.asset->url,
    "cityName": city->name,
    "cityId": city->slug.current
  }`)
}

export async function fetchMasterpieceSlugs() {
  return client.fetch(`*[_type == "masterpiece" && defined(slug.current)].slug.current`)
}

export async function fetchMasterpieceBySlug(slug) {
  return client.fetch(
    `*[_type == "masterpiece" && slug.current == $slug][0]{
      "id": slug.current,
      title,
      artist,
      year,
      kind,
      cardBlurb,
      timerSeconds,
      lookingPrompts,
      whatItAsked,
      whatItFormed,
      essayUrl,
      "image": image.asset->url,
      "cityName": city->name,
      "cityId": city->slug.current,
      "locationName": location->name
    }`,
    { slug }
  )
}
