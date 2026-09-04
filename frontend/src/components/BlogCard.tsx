import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, ArrowUpRight } from 'lucide-react';
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
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-blue-950/20 transition-all duration-300">
      {/* Cover Image Container */}
      <Link href={`/article/${article.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {article.category && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm backdrop-blur-md"
              style={{ backgroundColor: article.category.color || '#3b82f6' }}
            >
              {article.category.name}
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5">
        {/* Meta Info: Reading Time & Date */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} min baca
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
          <Link href={`/article/${article.slug}`} className="flex items-center justify-between gap-1">
            <span>{article.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all shrink-0 text-blue-500" />
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 flex-1 leading-relaxed">
          {article.excerpt}
        </p>

        {/* Author Footer */}
        {article.author && (
          <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {article.author.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-bold shrink-0">
                {article.author.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {article.author.name}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
