import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag as TagIcon } from 'lucide-react';
import {
  getArticleBySlug,
  getArticles,
  getRelatedArticles,
  getAdjacentArticles,
  slugifyAuthor,
} from '@/lib/strapi';
import RichContentRenderer from '@/components/RichContentRenderer';
import TableOfContents from '@/components/TableOfContents';
import VideoEmbed from '@/components/VideoEmbed';
import ArticleShareButtons from '@/components/ArticleShareButtons';
import AuthorSocialLinks from '@/components/AuthorSocialLinks';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AdjacentArticlesNav from '@/components/AdjacentArticlesNav';
import BlogCard from '@/components/BlogCard';
import ArticleJsonLd from '@/components/ArticleJsonLd';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const article = await getArticleBySlug(slug, { isDraft });
  if (!article) return { title: 'Artikel Tidak Ditemukan — Logikanya.tech' };

  return {
    title: `${article.title} — Logikanya.tech`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImageUrl }],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const article = await getArticleBySlug(slug, { isDraft });

  if (!article) {
    notFound();
  }

  const [relatedArticles, adjacent] = await Promise.all([
    getRelatedArticles(slug, article.category?.slug, 3),
    getAdjacentArticles(slug),
  ]);

  // Ekstraksi item heading untuk Auto Table of Contents (mendukung format Strapi Blocks & custom demo)
  type ContentHeadingNode = {
    type?: string;
    text?: string;
    level?: number;
    children?: Array<{ text?: string }>;
  };

  const tocItems = (Array.isArray(article.content) ? (article.content as ContentHeadingNode[]) : [])
    .filter(b => b.type === 'heading')
    .map(b => {
      let text = '';
      if (b.text) {
        text = b.text;
      } else if (Array.isArray(b.children)) {
        text = b.children.map(c => c.text || '').join('');
      }
      return {
        id: text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        text,
        level: b.level || 2,
      };
    })
    .filter(item => item.text.length > 0);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="py-6 sm:py-10 w-full">
      {/* Schema.org Structured Data */}
      <ArticleJsonLd article={article} />

      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Article Header (Editorial Hero Unit) */}
      <header className="mb-8 max-w-4xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {article.category && (
            <Link
              href={`/category/${article.category.slug || ''}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: article.category.color || '#3b82f6' }}
            >
              {article.category.name}
            </Link>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readingTime} mnt baca
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Main 2-Column Grid: Left (Cover + Content) & Right (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cover Image & Article Content */}
        <main className="lg:col-span-8 space-y-8 min-w-0">
          {/* Cover Image at top of left column */}
          {article.coverImageUrl && (
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>
          )}

          {/* Mobile-only Author & Date Bar */}
          <div className="lg:hidden flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              {article.author?.avatarUrl ? (
                <Link
                  href={`/author/${slugifyAuthor(article.author.name)}`}
                  className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity shrink-0"
                >
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </Link>
              ) : (
                <Link
                  href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                  className="w-9 h-9 rounded-full bg-[#D95D39]/15 text-[#D95D39] font-bold flex items-center justify-center text-sm shrink-0"
                >
                  {article.author?.name?.charAt(0) || 'A'}
                </Link>
              )}
              <div>
                <Link
                  href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                  className="font-semibold text-slate-900 dark:text-slate-100 text-sm hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors block"
                >
                  {article.author?.name || 'Admin'}
                </Link>
                {article.author?.bio && (
                  <div className="text-[11px] text-slate-500">
                    {article.author.bio}
                  </div>
                )}
                {article.author?.socialLinks && article.author.socialLinks.length > 0 && (
                  <AuthorSocialLinks links={article.author.socialLinks} className="mt-1" iconSize="w-3 h-3" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[#D95D39] hover:bg-[#D95D39]/10 font-medium text-[11px] transition-colors"
              >
                Artikel Penulis →
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime} mnt
                </span>
              </div>
            </div>
          </div>

          {/* Mobile-only Table of Contents */}
          {tocItems.length > 0 && (
            <div className="lg:hidden p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs">
              <TableOfContents items={tocItems} collapsible={true} />
            </div>
          )}

          {/* Video Embed */}
          {article.videoUrl && (
            <div>
              <VideoEmbed url={article.videoUrl} caption="Video Terkait Artikel" />
            </div>
          )}

          {/* Rich Content Renderer */}
          <RichContentRenderer blocks={article.content} />

          {/* Tags Section */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 mr-2">Topik Terkait:</span>
                {article.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-[#D95D39] hover:text-[#D95D39] dark:hover:border-[#D95D39] dark:hover:text-[#D95D39] transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Mobile-only Share Section */}
          <div className="lg:hidden pt-6 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
              Bagikan Artikel Ini
            </span>
            <ArticleShareButtons title={article.title} />
          </div>

          {/* Navigasi Artikel Sebelumnya & Selanjutnya */}
          <AdjacentArticlesNav prev={adjacent.prev} next={adjacent.next} />
        </main>

        {/* Right Column: Sidebar (Card 1 Author/Date & Card 2 Sticky TOC/Share) */}
        <aside className="lg:col-span-4 hidden lg:block space-y-6">
          {/* Card 1: Author & Date/Reading Time (Statis) */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xs space-y-5">
            {/* Author Block */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">
                Author
              </span>
              <div className="flex items-center gap-3">
                {article.author?.avatarUrl ? (
                  <Link
                    href={`/author/${slugifyAuthor(article.author.name)}`}
                    className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={article.author.avatarUrl}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                    className="w-10 h-10 rounded-full bg-[#D95D39]/15 text-[#D95D39] font-bold flex items-center justify-center text-sm shrink-0"
                  >
                    {article.author?.name?.charAt(0) || 'A'}
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                    className="font-semibold text-slate-900 dark:text-slate-100 text-sm hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors block truncate"
                  >
                    {article.author?.name || 'Admin'}
                  </Link>
                  {article.author?.bio && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {article.author.bio}
                    </div>
                  )}
                  {article.author?.socialLinks && article.author.socialLinks.length > 0 && (
                    <AuthorSocialLinks links={article.author.socialLinks} className="mt-2" />
                  )}
                </div>
              </div>

              {/* Tombol Lihat Semua Artikel Author */}
              <Link
                href={`/author/${slugifyAuthor(article.author?.name || 'admin')}`}
                className="mt-3.5 inline-flex items-center justify-center w-full py-2 px-3 rounded-xl border border-[#D95D39]/30 bg-[#D95D39]/5 hover:bg-[#D95D39]/15 text-[#D95D39] font-semibold text-xs transition-colors"
              >
                Semua Artikel {article.author?.name || 'Penulis'} →
              </Link>
            </div>

            {/* Date Block */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                Date & Waktu Baca
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.readingTime} menit baca</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Table of Contents & Share (Sticky saat di-scroll) */}
          <div className="sticky top-24 z-10 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto shadow-sm">
            {/* Table of Contents Block */}
            {tocItems.length > 0 && (
              <div>
                <TableOfContents items={tocItems} collapsible={false} />
              </div>
            )}

            {/* Share Block */}
            <div className={tocItems.length > 0 ? "pt-5 border-t border-slate-200/80 dark:border-slate-800/80" : ""}>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                Share
              </span>
              <ArticleShareButtons title={article.title} />
            </div>
          </div>
        </aside>
      </div>

      {/* Section: Artikel Terkait (Discovery Loop) */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Rekomendasi Bacaan
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Artikel Terkait Lainnya
              </h3>
            </div>
            {article.category && (
              <Link
                href={`/category/${article.category.slug}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat semua di {article.category.name} →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map(rel => (
              <BlogCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
