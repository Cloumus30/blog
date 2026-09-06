import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag as TagIcon, Hash } from 'lucide-react';
import { getTags, getArticlesByTag } from '@/lib/strapi';
import BlogCard from '@/components/BlogCard';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tags = await getTags();
  const currentTag = tags.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
  const tagName = currentTag ? currentTag.name : slug;

  return {
    title: `Artikel #${tagName} — Logikanya.tech`,
    description: `Kumpulan artikel teknologi dan tutorial dengan topik #${tagName}.`,
  };
}

export default async function TagDetailPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tags, articles] = await Promise.all([
    getTags(),
    getArticlesByTag(slug),
  ]);

  const currentTag = tags.find((t) => t.slug.toLowerCase() === slug.toLowerCase());

  if (!currentTag && articles.length === 0) {
    notFound();
  }

  const tagName = currentTag ? currentTag.name : slug;

  return (
    <div className="py-8 space-y-8 w-full">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Tag Header */}
      <header className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#23272F]/60 shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D95D39]/10 text-[#D95D39] flex items-center justify-center font-bold shrink-0">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D95D39] uppercase tracking-wider">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Topik Tag</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              #{tagName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Menampilkan {articles.length} artikel dengan topik ini.
            </p>
          </div>
        </div>
      </header>

      {/* Article Grid */}
      <section className="space-y-6">
        {articles.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
            <p className="text-slate-500">Belum ada artikel untuk tag ini.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}