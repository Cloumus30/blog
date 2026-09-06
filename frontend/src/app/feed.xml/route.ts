import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/strapi';

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cloudias.my.id').replace(/\/+$/, '');
  const articles = await getArticles();

  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const itemsXml = articles
    .map(article => {
      const articleUrl = `${siteUrl}/article/${article.slug}`;
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : new Date().toUTCString();
      const authorName = escapeXml(article.author?.name || 'Logikanya.tech Team');
      const categoryName = escapeXml(article.category?.name || 'Teknologi');

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <author>${authorName}</author>
      <category>${categoryName}</category>
    </item>`;
    })
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Logikanya.tech — Wawasan Logika, Kode &amp; Teknologi</title>
    <link>${siteUrl}</link>
    <description>Platform publikasi artikel teknologi, tutorial coding, eksplorasi logika, dan catatan rekayasa perangkat lunak.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
