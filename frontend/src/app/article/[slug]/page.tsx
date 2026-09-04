import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag as TagIcon } from 'lucide-react';
import { getArticleBySlug, getArticles } from '@/lib/strapi';
import RichContentRenderer from '@/components/RichContentRenderer';
import TableOfContents from '@/components/TableOfContents';
import VideoEmbed from '@/components/VideoEmbed';
import ArticleShareButtons from '@/components/ArticleShareButtons';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };

  return {
    title: `${article.title} — TechHobby`,
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
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Ekstraksi item heading untuk Auto Table of Contents (mendukung format Strapi Blocks & custom demo)
  const tocItems = (Array.isArray(article.content) ? article.content : [])
    .filter((b: any) => b.type === 'heading')
    .map((b: any) => {
      let text = '';
      if (b.text) {
        text = b.text;
      } else if (Array.isArray(b.children)) {
        text = b.children.map((c: any) => c.text || '').join('');
      }
      return {
        id: text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        text,
        level: b.level || 2,
      };
    })
    .filter((item: any) => item.text.length > 0);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Article Header (Top Section spanning full width) */}
      <header className="mb-10 max-w-4xl">
        {article.category && (
          <div className="mb-4">
            <Link
              href={`/category/${article.category.slug || ''}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: article.category.color || '#3b82f6' }}
            >
              {article.category.name}
            </Link>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-5">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Main 2-Column Grid: Left (Cover + Content) & Right (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cover Image & Article Content */}
        <main className="lg:col-span-8 space-y-8">
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
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm">
                  {article.author?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {article.author?.name || 'Admin'}
                </div>
                {article.author?.bio && (
                  <div className="text-[11px] text-slate-500">
                    {article.author.bio}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
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

          {/* Mobile-only Table of Contents */}
          {tocItems.length > 0 && (
            <div className="lg:hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <TableOfContents items={tocItems} />
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
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
                  >
                    #{tag.name}
                  </span>
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
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    <Image
                      src={article.author.avatarUrl}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {article.author?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {article.author?.name || 'Admin'}
                  </div>
                  {article.author?.bio && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {article.author.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Block */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                Date
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
                <TableOfContents items={tocItems} />
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
    </div>
  );
}
