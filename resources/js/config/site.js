export default {
  // Basic site identity
  name: 'Boarding House Management',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000',

  // Default SEO values (can be overridden per-page)
  seo: {
    description: 'A lightweight boarding house management system built with Laravel and React — manage rooms, tenants, and billing with ease.',
    image: '/images/boarding-illustration.svg',
    twitter: '@yourtwitter',
  },

  leftPanel: {
    title: 'Boarding House',
    subtitle: 'Management System',
    image: '/images/boarding-illustration.svg',
    imageAlt: 'Illustration of a boarding house floorplan',
  },
};
