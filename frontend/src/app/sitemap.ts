import { MetadataRoute } from 'next';
import { getArticles, getCategories, getTags, slugifyAuthor } from '@/lib/strapi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cloudias.my.id').replace(/\/+$/, '');

  const [articles, categories, tags] = await Promise.all([
    getArticles(),
    getCategories(),
    getTags(),
  ]);

  // Extract unique authors
  const authorMap = new Map<string, string>();
  articles.forEach(article => {
    if (article.author?.name) {
      authorMap.set(slugifyAuthor(article.author.name), article.author.name);
    }
  });

  const now = new Date();

  // Root homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Articles
  articles.forEach(article => {
    routes.push({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Categories
  categories.forEach(category => {
    routes.push({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Tags
  tags.forEach(tag => {
    routes.push({
      url: `${siteUrl}/tag/${tag.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  });

  // Authors
  Array.from(authorMap.keys()).forEach(authorSlug => {
    routes.push({
      url: `${siteUrl}/author/${authorSlug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return routes;
}
