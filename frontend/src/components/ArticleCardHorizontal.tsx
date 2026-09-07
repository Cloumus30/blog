import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, User } from 'lucide-react';
import { Article } from '@/lib/types';

interface ArticleCardHorizontalProps {
  article: Article;
}

export default function ArticleCardHorizontal({ article }: ArticleCardHorizontalProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group flex flex-col sm:flex-row bg-white dark:bg-[#23272F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:border-[#D95D39]/50 dark:hover:border-[#D95D39]/50 hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300">
      {/* Thumbnail Container */}
      <Link
        href={`/article/${article.slug}`}
        className="relative w-full sm:w-56 md:w-64 aspect-[16/10] sm:aspect-auto sm:h-full min-h-[170px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 block"
      >
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Mobile Category Badge */}
        {article.category && (
          <div className="sm:hidden absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D95D39] text-white shadow-sm">
              {article.category.name}
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex flex-col justify-between flex-1 p-5 sm:p-6">
        <div>
          {/* Category Pill & Reading Time */}
          <div className="flex items-center gap-2.5 mb-2.5">
            {article.category && (
              <Link
                href={`/category/${article.category.slug}`}
                className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#D95D39]/30 bg-[#D95D39]/10 text-[#D95D39] hover:bg-[#D95D39]/20 transition-colors"
              >
                {article.category.name}
              </Link>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#D95D39]" />
              {article.readingTime || 3} mnt baca
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#D95D39] dark:group-hover:text-[#D95D39] transition-colors line-clamp-2 mb-2 leading-snug">
            <Link href={`/article/${article.slug}`} className="flex items-start justify-between gap-2">
              <span>{article.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-y-0.5 translate-x-0.5 transition-all shrink-0 text-[#D95D39] mt-1" />
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Author & Date Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {article.author?.avatarUrl ? (
              <Image
                src={article.author.avatarUrl}
                alt={article.author.name}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {article.author?.name || 'Admin'}
            </span>
          </div>
          <time dateTime={article.publishedAt}>{formattedDate}</time>
        </div>
      </div>
    </article>
  );
}
