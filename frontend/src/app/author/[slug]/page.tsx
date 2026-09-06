import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen } from 'lucide-react';
import {
  getArticles,
  getArticlesByAuthor,
  getAuthorByIdOrSlug,
  slugifyAuthor,
} from '@/lib/strapi';
import BlogCard from '@/components/BlogCard';
import AuthorSocialLinks from '@/components/AuthorSocialLinks';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  const authorSlugs = new Set<string>();

  articles.forEach((a) => {
    if (a.author) {
      authorSlugs.add(slugifyAuthor(a.author.name));
      authorSlugs.add(String(a.author.id));
    }
  });

  return Array.from(authorSlugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorByIdOrSlug(slug);
  if (!author) return { title: 'Penulis Tidak Ditemukan — Logikanya.tech' };

  return {
    title: `Artikel oleh ${author.name} — Logikanya.tech`,
    description: author.bio || `Daftar seluruh artikel teknologi yang ditulis oleh ${author.name}.`,
  };
}

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const [author, articles] = await Promise.all([
    getAuthorByIdOrSlug(slug),
    getArticlesByAuthor(slug),
  ]);

  if (!author) {
    notFound();
  }

  return (
    <div className="py-8 space-y-10 w-full">
      {/* Back to Home */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Author Profile Hero Card */}
      <header className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#23272F]/60 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          {author.avatarUrl ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#D95D39]/30 shadow-md shrink-0">
              <Image
                src={author.avatarUrl}
                alt={author.name}
                fill
                priority
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#D95D39]/15 text-[#D95D39] font-black text-2xl flex items-center justify-center shrink-0 border border-[#D95D39]/30">
              {author.name.charAt(0)}
            </div>
          )}

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D95D39] uppercase tracking-wider">
              <span>Profil Penulis</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 normal-case font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                {articles.length} artikel diterbitkan
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {author.name}
            </h1>

            {author.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {author.bio}
              </p>
            )}

            {author.socialLinks && author.socialLinks.length > 0 && (
              <AuthorSocialLinks links={author.socialLinks} className="pt-1" />
            )}
          </div>
        </div>
      </header>

      {/* Article Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Artikel yang Ditulis ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
            <p className="text-slate-500">Penulis ini belum menerbitkan artikel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}