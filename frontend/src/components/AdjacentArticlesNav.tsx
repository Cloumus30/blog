import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Article } from '@/lib/types';

interface AdjacentArticlesNavProps {
  prev: Article | null;
  next: Article | null;
}

export default function AdjacentArticlesNav({ prev, next }: AdjacentArticlesNavProps) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Navigasi Artikel Terkait" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
      {/* Artikel Sebelumnya (Older) */}
      {prev ? (
        <Link
          href={`/article/${prev.slug}`}
          className="group flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all text-left"
        >
          {prev.coverImageUrl ? (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200/70 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              <Image
                src={prev.coverImageUrl}
                alt={prev.title}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              <ArrowLeft className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Sebelumnya</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
              {prev.title}
            </h4>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Artikel Selanjutnya (Newer) */}
      {next && (
        <Link
          href={`/article/${next.slug}`}
          className="group flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all text-right sm:text-right"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              <span>Selanjutnya</span>
              <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
              {next.title}
            </h4>
          </div>
          {next.coverImageUrl ? (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200/70 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              <Image
                src={next.coverImageUrl}
                alt={next.title}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </Link>
      )}
    </nav>
  );
}
