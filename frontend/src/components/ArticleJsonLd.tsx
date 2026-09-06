import { Article } from '@/lib/types';
import { slugifyAuthor } from '@/lib/strapi';

interface ArticleJsonLdProps {
  article: Article;
}

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cloudias.my.id').replace(/\/+$/, '');
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const authorName = article.author?.name || 'Logikanya.tech Team';
  const authorSlug = slugifyAuthor(authorName);

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${siteUrl}/author/${authorSlug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Logikanya.tech',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    articleSection: article.category?.name,
    keywords: article.tags?.map(t => t.name).join(', '),
  };

  const breadcrumbsList = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: siteUrl,
    },
  ];

  if (article.category) {
    breadcrumbsList.push({
      '@type': 'ListItem',
      position: 2,
      name: article.category.name,
      item: `${siteUrl}/category/${article.category.slug}`,
    });
  }

  breadcrumbsList.push({
    '@type': 'ListItem',
    position: breadcrumbsList.length + 1,
    name: article.title,
    item: articleUrl,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbsList,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
