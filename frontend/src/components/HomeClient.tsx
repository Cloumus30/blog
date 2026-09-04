'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, Clock, Calendar, ArrowRight } from 'lucide-react';
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

  return (
    <div className="space-y-12">
      {/* Featured Article Hero Banner */}
      {featuredArticle && selectedCategory === 'all' && !searchQuery && (
        <section className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl group">
          <div className="grid md:grid-cols-2 items-center">
            {/* Image Side */}
            <div className="relative aspect-[16/10] md:aspect-auto md:h-full min-h-[280px] w-full bg-slate-800 overflow-hidden">
              <Image
                src={featuredArticle.coverImageUrl}
                alt={featuredArticle.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
              {featuredArticle.category && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md flex items-center gap-1.5"
                    style={{ backgroundColor: featuredArticle.category.color || '#3b82f6' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {featuredArticle.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Text Side */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readingTime} min baca
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-4">
                <Link href={`/article/${featuredArticle.slug}`}>
                  {featuredArticle.title}
                </Link>
              </h1>

              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                {featuredArticle.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Oleh {featuredArticle.author?.name || 'Admin'}
                </span>
                <Link
                  href={`/article/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:gap-2.5 transition-all"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search Bar Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Semua Artikel
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
            placeholder="Cari artikel, topik, kode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </section>

      {/* Article Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {searchQuery ? `Hasil Pencarian (${filteredArticles.length})` : 'Artikel Terbaru'}
          </h2>
          <span className="text-xs text-slate-500">
            Menampilkan {filteredArticles.length} artikel
          </span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
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
