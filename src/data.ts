export type MenuItem = {
  id: string
  title: string
  eyebrow: string
  description: string
  url: string
  colors: [string, string]
  motif: 'orbit' | 'grid' | 'wave' | 'arc'
}

export type MenuSection = {
  id: string
  index: string
  title: string
  subtitle: string
  layout: 'home' | 'grid' | 'contacts'
  items: MenuItem[]
}

export const sections: MenuSection[] = [
  { id: 'home', index: '00', title: 'Home', subtitle: 'A versatile starting point for your project.', layout: 'home', items: [] },
  {
    id: 'section-one', index: '01', title: 'Section 01', layout: 'grid',
    subtitle: 'A short introduction to this section. Make it your own.',
    items: [
      { id: 'card-01', title: 'Card 01', eyebrow: 'Category A', description: 'A brief overview of this resource in a line or two.', url: 'https://example.com', colors: ['#ff643e', '#8f2f36'], motif: 'orbit' },
      { id: 'card-02', title: 'Card 02', eyebrow: 'Category B', description: 'A short preview to introduce the content.', url: 'https://example.com', colors: ['#47dfb0', '#10696d'], motif: 'wave' },
      { id: 'card-03', title: 'Card 03', eyebrow: 'Category C', description: 'Flexible placeholder text for any topic.', url: 'https://example.com', colors: ['#8e75ff', '#4430a0'], motif: 'grid' },
      { id: 'card-04', title: 'Card 04', eyebrow: 'Category D', description: 'Add your own title and description here.', url: 'https://example.com', colors: ['#f1be55', '#6d4c1e'], motif: 'arc' },
      { id: 'card-05', title: 'Card 05', eyebrow: 'Category E', description: 'A versatile example of an additional resource.', url: 'https://example.com', colors: ['#55c6ff', '#244b88'], motif: 'grid' },
    ],
  },
  {
    id: 'section-two', index: '02', title: 'Section 02', layout: 'grid',
    subtitle: 'A flexible collection with as many items as you need.',
    items: [
      { id: 'card-06', title: 'Featured resource', eyebrow: 'Collection', description: 'A featured resource to showcase your content.', url: 'https://example.com', colors: ['#ef7fff', '#603166'], motif: 'wave' },
      { id: 'card-07', title: 'New page', eyebrow: 'Update', description: 'A brief description you can easily make your own.', url: 'https://example.com', colors: ['#4ee7bc', '#0e5b58'], motif: 'orbit' },
      { id: 'card-08', title: 'More to explore', eyebrow: 'Resource', description: 'Another resource in your growing collection.', url: 'https://example.com', colors: ['#eab45e', '#6a4b22'], motif: 'grid' },
    ],
  },
  {
    id: 'section-three', index: '03', title: 'Section 03', layout: 'grid',
    subtitle: 'Six sample cards with a varied visual rhythm.',
    items: [
      { id: 'card-09', title: 'Item A', eyebrow: 'Group 01', description: 'A simple introduction to the content.', url: 'https://example.com', colors: ['#ff4f4f', '#651d27'], motif: 'orbit' },
      { id: 'card-10', title: 'Item B', eyebrow: 'Group 01', description: 'A brief caption that works with any topic.', url: 'https://example.com', colors: ['#55c6ff', '#244b88'], motif: 'grid' },
      { id: 'card-11', title: 'Item C', eyebrow: 'Group 02', description: 'Replace this text when adding your content.', url: 'https://example.com', colors: ['#8ed957', '#355b24'], motif: 'wave' },
      { id: 'card-12', title: 'Item D', eyebrow: 'Group 02', description: 'A concise overview of this card.', url: 'https://example.com', colors: ['#d9a7ff', '#533c75'], motif: 'arc' },
      { id: 'card-13', title: 'Item E', eyebrow: 'Group 03', description: 'Sample copy for another item in the collection.', url: 'https://example.com', colors: ['#ffd25a', '#735322'], motif: 'grid' },
      { id: 'card-14', title: 'Item F', eyebrow: 'Group 03', description: 'The final card in this sample collection.', url: 'https://example.com', colors: ['#ff69ad', '#6b2755'], motif: 'orbit' },
    ],
  },
  {
    id: 'section-four', index: '04', title: 'Section 04', layout: 'grid',
    subtitle: 'Another collection showcasing the flexible layout.',
    items: [
      { id: 'card-15', title: 'Example 01', eyebrow: 'Label', description: 'An introduction to the first example.', url: 'https://example.com', colors: ['#ff7657', '#772f2d'], motif: 'arc' },
      { id: 'card-16', title: 'Example 02', eyebrow: 'Label', description: 'An introduction to the second example.', url: 'https://example.com', colors: ['#6bd5c7', '#205c62'], motif: 'wave' },
      { id: 'card-17', title: 'Example 03', eyebrow: 'Label', description: 'An introduction to the third example.', url: 'https://example.com', colors: ['#9f8cff', '#403277'], motif: 'orbit' },
      { id: 'card-18', title: 'Example 04', eyebrow: 'Label', description: 'An introduction to the fourth example.', url: 'https://example.com', colors: ['#d3985d', '#5e3c27'], motif: 'grid' },
    ],
  },
  {
    id: 'section-five', index: '05', title: 'Section 05', layout: 'grid',
    subtitle: 'A focused selection of two featured resources.',
    items: [
      { id: 'card-19', title: 'Featured item', eyebrow: 'Highlight', description: 'A featured card for an important resource or link.', url: 'https://example.com', colors: ['#43dcc0', '#0c5c5e'], motif: 'arc' },
      { id: 'card-20', title: 'Another highlight', eyebrow: 'Highlight', description: 'A second highlight to complete the collection.', url: 'https://example.com', colors: ['#ff795f', '#77352d'], motif: 'orbit' },
    ],
  },
  { id: 'contacts', index: '06', title: 'Contact', subtitle: 'Get in touch and take the next step.', layout: 'contacts', items: [] },
]
