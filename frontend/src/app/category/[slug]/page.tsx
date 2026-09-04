import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getArticles, getCategories } from '@/lib/strapi';
import BlogCard from '@/components/BlogCard';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(c => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [allArticles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ]);

  const currentCategory = categories.find(c => c.slug === slug);
  if (!currentCategory) {
    notFound();
  }

  const articles = allArticles.filter(a => a.category?.slug === slug);

  return (
    <div className="py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Semua Artikel</span>
        </Link>

        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentCategory.color || '#3b82f6' }}
          />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Kategori: {currentCategory.name}
          </h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Menampilkan {articles.length} artikel dalam kategori ini.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
