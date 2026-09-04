'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight } from 'lucide-react';
import { Article, Category } from '@/lib/types';
import BlogCard from './BlogCard';

interface HomeClientProps {
  initialArticles: Article[];
  categories: Category[];
}

export default function HomeClient({ initialArticles, categories }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter artikel berdasarkan pencarian dan kategori
  const filteredArticles = initialArticles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || article.category?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticle = initialArticles.find(a => a.featured) || initialArticles[0];

  // Pada tampilan default (tanpa pencarian & kategori 'all'), artikel unggulan tidak diduplikasi di grid bawah
  const isDefaultView = !searchQuery && selectedCategory === 'all';
  const gridArticles = (isDefaultView && featuredArticle)
    ? filteredArticles.filter(a => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Centered Hero Header (Untitled UI Style) */}
      <section className="text-center pt-6 sm:pt-10 max-w-3xl mx-auto space-y-4">
        <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
          The blog
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          <span className="relative inline-block">
            Writings from our team
            <svg
              className="absolute -top-3 -right-6 sm:-right-8 w-6 h-6 text-slate-400 dark:text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 3v3M18.5 5.5l-2.5 2M21 12h-3" />
            </svg>
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The latest industry news, interviews, technologies, and resources.
        </p>
      </section>

      {/* Featured Article Hero Card (Full-Width Image with Overlay Content) */}
      {featuredArticle && isDefaultView && (
        <section className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[360px] sm:min-h-[460px] rounded-3xl overflow-hidden shadow-2xl group border border-slate-200/80 dark:border-slate-800 bg-slate-900">
          <Image
            src={featuredArticle.coverImageUrl}
            alt={featuredArticle.title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="100vw"
          />
          {/* Dark gradient overlay from bottom to top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Content overlay at bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 text-white space-y-3 sm:space-y-4 max-w-4xl">
            {/* Author & Date */}
            <div className="text-xs sm:text-sm font-medium text-white/80">
              {featuredArticle.author?.name || 'Admin'} •{' '}
              {new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              <Link
                href={`/article/${featuredArticle.slug}`}
                className="hover:underline flex items-center gap-2 group-hover:text-blue-200 transition-colors"
              >
                <span>{featuredArticle.title}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 inline-block opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Link>
            </h2>

            {/* Excerpt */}
            {featuredArticle.excerpt && (
              <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
                {featuredArticle.excerpt}
              </p>
            )}

            {/* Tags / Category Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {featuredArticle.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-colors">
                  {featuredArticle.category.name}
                </span>
              )}
              {featuredArticle.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 border border-white/20 transition-colors"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search Bar Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Semua Artikel
          </button>
          {categories.map(cat => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari artikel, topik, kata kunci..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </section>

      {/* Article Grid (3 Columns) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {searchQuery ? `Hasil Pencarian (${filteredArticles.length})` : 'Artikel Terbaru'}
          </h2>
          <span className="text-xs text-slate-500">
            Menampilkan {gridArticles.length} artikel
          </span>
        </div>

        {gridArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridArticles.map(article => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 text-sm">Tidak ada artikel yang cocok dengan kriteria pencarian.</p>
          </div>
        )}
      </section>
    </div>
  );
}
