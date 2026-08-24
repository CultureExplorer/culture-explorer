import { defineField, defineType } from 'sanity'

export const masterpiece = defineType({
  name: 'masterpiece',
  title: 'Masterpiece',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist / maker',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year / period',
      type: 'string',
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Painting', value: 'painting' },
          { title: 'Sculpture', value: 'sculpture' },
          { title: 'Architecture', value: 'architecture' },
          { title: 'Artifact', value: 'artifact' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{ type: 'city' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'location' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cardBlurb',
      title: 'Card blurb',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'timerSeconds',
      title: 'Looking timer (seconds)',
      type: 'number',
      options: {
        list: [
          { title: '2 minutes', value: 120 },
          { title: '3 minutes', value: 180 },
          { title: '5 minutes', value: 300 },
          { title: '10 minutes', value: 600 },
        ],
      },
      initialValue: 300,
    }),
    defineField({
      name: 'lookingPrompts',
      title: 'Looking prompts',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(1).max(8),
    }),
    defineField({
      name: 'whatItAsked',
      title: 'What it asked',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'whatItFormed',
      title: 'What it formed',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist',
      kind: 'kind',
      media: 'image',
    },
    prepare({ title, artist, kind, media }) {
      return {
        title,
        subtitle: [artist, kind].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
