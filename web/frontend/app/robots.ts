import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://streakyy.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/', '/setup/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
