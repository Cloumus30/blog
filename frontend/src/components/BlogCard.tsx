import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Article } from '@/lib/types';

interface BlogCardProps {
  article: Article;
}

export default function BlogCard({ article }: BlogCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-blue-950/20 transition-all duration-300">
      {/* Cover Image Container */}
      <Link href={`/article/${article.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 block">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Author & Date Meta */}
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
          {article.author?.name || 'Admin'} • {formattedDate}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2.5 leading-snug">
          <Link href={`/article/${article.slug}`} className="flex items-start justify-between gap-2">
            <span>{article.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-y-0.5 translate-x-0.5 transition-all shrink-0 text-blue-500 mt-1" />
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {article.excerpt}
        </p>

        {/* Category and Tags Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {article.category && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
            >
              {article.category.name}
            </span>
          )}
          {article.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
