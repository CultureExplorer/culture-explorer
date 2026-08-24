import { defineField, defineType } from 'sanity'

export const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
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
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Museum', value: 'museum' },
          { title: 'Church / sacred', value: 'church' },
          { title: 'Ruins', value: 'ruins' },
          { title: 'Square', value: 'square' },
          { title: 'Palace', value: 'palace' },
          { title: 'Garden', value: 'garden' },
          { title: 'Bridge', value: 'bridge' },
          { title: 'Viewpoint', value: 'viewpoint' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortGuide',
      title: 'Short guide',
      type: 'text',
      rows: 4,
      description: '2–4 sentences for slow attention',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Optional — useful for museums',
      hidden: ({ parent }) => parent?.kind !== 'museum',
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
    }),
  ],
  preview: {
    select: {
      title: 'name',
      kind: 'kind',
      cityName: 'city.name',
      media: 'image',
    },
    prepare({ title, kind, cityName, media }) {
      return {
        title,
        subtitle: [cityName, kind].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})