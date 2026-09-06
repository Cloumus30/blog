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

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find(c => c.slug === slug);
  if (!currentCategory) return { title: 'Kategori Tidak Ditemukan — Logikanya.tech' };

  return {
    title: `Kategori: ${currentCategory.name} — Logikanya.tech`,
    description: currentCategory.description || `Daftar seluruh artikel dalam kategori ${currentCategory.name}.`,
  };
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
    <div className="py-8 space-y-8 w-full">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Semua Artikel</span>
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#23272F]/60 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shadow-xs"
              style={{ backgroundColor: currentCategory.color || '#D95D39' }}
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Kategori: {currentCategory.name}
            </h1>
          </div>
          {currentCategory.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              {currentCategory.description}
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">
            Menampilkan {articles.length} artikel dalam kategori ini.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
