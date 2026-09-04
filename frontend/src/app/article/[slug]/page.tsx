import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag as TagIcon, Share2 } from 'lucide-react';
import { getArticleBySlug, getArticles } from '@/lib/strapi';
import RichContentRenderer from '@/components/RichContentRenderer';
import TableOfContents from '@/components/TableOfContents';
import VideoEmbed from '@/components/VideoEmbed';

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
    <div className="py-8 sm:py-12 max-w-5xl mx-auto">
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

      {/* Article Header */}
      <header className="mb-8">
        {article.category && (
          <div className="mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: article.category.color || '#3b82f6' }}
            >
              {article.category.name}
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {article.excerpt}
        </p>

        {/* Author & Publish Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {article.author?.avatarUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-sm">
                {article.author?.name.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {article.author?.name || 'Admin'}
              </div>
              <div className="text-[11px] text-slate-500">
                {article.author?.bio || 'Penulis TechHobby'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} menit baca
            </span>
          </div>
        </div>
      </header>

      {/* Main Cover Image */}
      {article.coverImageUrl && (
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      )}

      {/* Article Body & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Content */}
        <div className="lg:col-span-8">
          {article.videoUrl && (
            <div className="mb-8">
              <VideoEmbed url={article.videoUrl} caption="Video Terkait Artikel" />
            </div>
          )}
          <RichContentRenderer blocks={article.content} />

          {/* Tags Section */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
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
        </div>

        {/* Sidebar: Table of Contents & Sticky Actions */}
        <div className="lg:col-span-4 hidden lg:block">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </div>
  );
}
