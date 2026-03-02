// GET /api/sitemap.xml — Generate XML sitemap from JSON data
import { getWatches } from './_lib/data.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const watches = getWatches().filter((w) => w.status === 'AVAILABLE');
    const baseUrl = process.env.APP_URL || 'https://manilawatch.com';

    // Collect unique brands for brand pages
    const brands = [...new Set(watches.map((w) => w.brand))] as string[];
    const brandSlugs = brands.map((b) =>
      b.toLowerCase().replace(/\s+/g, '-')
    );

    const urls = [
      // Static pages
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/inventory', priority: '0.9', changefreq: 'daily' },
      { loc: '/insights', priority: '0.7', changefreq: 'weekly' },
      // Brand pages
      ...brandSlugs.map((slug) => ({
        loc: `/watches/${slug}`,
        priority: '0.8',
        changefreq: 'weekly' as string,
      })),
      // Watch detail pages
      ...watches.map((w) => ({
        loc: `/watch/${w.slug}`,
        priority: '0.8',
        changefreq: 'weekly' as string,
        lastmod: w.updated_at ? w.updated_at.split('T')[0] : undefined,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      'lastmod' in u && u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
