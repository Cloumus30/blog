import { getArticles, getCategories } from '@/lib/strapi';
import HomeClient from '@/components/HomeClient';

export const metadata = {
  title: 'TechHobby — Blog Teknologi & Catatan Hobi',
  description: 'Artikel, tutorial pemrograman, ulasan teknologi, dan catatan hobi mandiri.',
};

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ]);

  return (
    <div className="py-8">
      <HomeClient initialArticles={articles} categories={categories} />
    </div>
  );
}
