import React from 'react';
import { Head } from '@inertiajs/react';
import site from '@/config/site';

export default function Seo({ description, image, url, robots = 'index,follow' }) {
  const metaDescription = description ?? site.seo?.description ?? '';
  const metaImage = image ?? site.seo?.image ?? '';
  const metaUrl = url ?? (typeof window !== 'undefined' ? window.location.href : site.url);

  return (
    <Head>
      {/* Basic SEO */}
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />
      <meta name="robots" content={robots} />

      {/* Open Graph */}
      <meta property="og:site_name" content={site.name} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={site.seo?.twitter ?? ''} />
      <meta name="twitter:title" content={site.name} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
