import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  jsonLd?: object;
}

export function SEOHead({
  title = 'Manila Watch Atelier | Luxury Grey Market Watches Philippines',
  description = 'Authenticated luxury watches from Manila\'s trusted grey market dealer. Rolex, Patek Philippe, Audemars Piguet, Omega, Cartier, Tudor. Competitive grey market pricing.',
  ogImage,
  ogType = 'website',
  canonical,
  jsonLd,
}: SEOHeadProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://manilawatch.com';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}
      <meta property="og:site_name" content="Manila Watch Atelier" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to generate Product JSON-LD for a watch
export function getWatchJsonLd(watch: {
  name: string;
  brand: string;
  model: string;
  reference: string;
  description: string;
  pricePHP?: number;
  price_php?: number;
  images: string[];
  condition: string;
  status?: string;
  slug: string;
}) {
  const price = watch.pricePHP || watch.price_php || 0;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://manilawatch.com';
  const imageUrl = watch.images?.[0]?.startsWith('http')
    ? watch.images[0]
    : `${siteUrl}${watch.images?.[0] || ''}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${watch.brand} ${watch.model} Ref. ${watch.reference}`,
    description: watch.description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: watch.brand,
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'PHP',
      availability:
        watch.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : watch.status === 'RESERVED'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Organization',
        name: 'Manila Watch Atelier',
      },
      itemCondition:
        watch.condition === 'brand_new' || watch.condition === 'unworn'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
    url: `${siteUrl}/watch/${watch.slug}`,
  };
}
