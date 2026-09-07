'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Clock, Sparkles, Hash, BookOpen } from 'lucide-react';
import { Article, Category, Tag } from '@/lib/types';
import ArticleCardHorizontal from './ArticleCardHorizontal';

interface HomeClientProps {
  initialArticles: Article[];
  categories: Category[];
  tags?: Tag[];
}

export default function HomeClient({
  initialArticles,
  categories,
  tags = [],
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter artikel berdasarkan pencarian dan kategori
  const filteredArticles = initialArticles.filter((article) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags?.some((t) => t.name.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || article.category?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Penentuan artikel unggulan & trending dari Strapi
  const featuredArticle = initialArticles.find((a) => a.featured) || initialArticles[0];

  // 3 artikel berikutnya setelah featured article sebagai trending
  const trendingArticles = initialArticles
    .filter((a) => a.id !== featuredArticle?.id)
    .slice(0, 3);

  // Status tampilan default (hero bento hanya aktif saat tanpa search & kategori 'all')
  const isDefaultView = !searchQuery && selectedCategory === 'all';

  // Artikel di feed bawah (tanpa duplikasi dari hero & trending pada default view)
  const feedArticles = isDefaultView
    ? initialArticles.filter(
        (a) =>
          a.id !== featuredArticle?.id &&
          !trendingArticles.some((t) => t.id === a.id)
      )
    : filteredArticles;

  // Kumpulan tag dinamis: gunakan prop tags atau fallback dari tag artikel
  const dynamicTags =
    tags.length > 0
      ? tags
      : Array.from(
          new Map(
            initialArticles
              .flatMap((a) => a.tags || [])
              .map((t) => [t.slug, t])
          ).values()
        );

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* ========================================================================= */}
      {/* 1. BENTO HERO SECTION (Hanya tampil pada Default View)                   */}
      {/* ========================================================================= */}
      {isDefaultView && featuredArticle && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#D95D39] uppercase">
            <Sparkles className="w-4 h-4 text-[#D95D39]" />
            <span>Sorotan & Trending</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Bento Kiri: Main Featured Article (Col-span 8 atau 12 jika tidak ada trending) */}
            <div
              className={`relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-2xl group transition-all duration-300 hover:border-[#D95D39]/50 min-h-[400px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 ${
                trendingArticles.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {/* Background Image */}
              <Image
                src={featuredArticle.coverImageUrl}
                alt={featuredArticle.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />

              {/* Content Overlay */}
              <div className="relative z-20 space-y-3.5 max-w-3xl text-white">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D95D39] text-white shadow-sm">
                    Unggulan
                  </span>
                  {featuredArticle.category && (
                    <Link
                      href={`/category/${featuredArticle.category.slug}`}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-colors"
                    >
                      {featuredArticle.category.name}
                    </Link>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-white/80">
                    <Clock className="w-3.5 h-3.5 text-[#D95D39]" />
                    {featuredArticle.readingTime || 3} mnt baca
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  <Link
                    href={`/article/${featuredArticle.slug}`}
                    className="hover:underline flex items-start gap-2 group-hover:text-orange-200 transition-colors"
                  >
                    <span>{featuredArticle.title}</span>
                  </Link>
                </h1>

                {featuredArticle.excerpt && (
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {featuredArticle.author?.avatarUrl ? (
                      <Image
                        src={featuredArticle.author.avatarUrl}
                        alt={featuredArticle.author.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-white/40"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#D95D39] flex items-center justify-center font-bold text-xs text-white">
                        {featuredArticle.author?.name?.slice(0, 2).toUpperCase() || 'DA'}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {featuredArticle.author?.name || 'Admin'}
                      </div>
                      <div className="text-[11px] text-white/70">
                        {new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/article/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D95D39] hover:text-white transition-colors group-hover:translate-x-1"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bento Kanan: 3 Trending Articles Stack (Col-span 4) */}
            {trendingArticles.length > 0 && (
              <div className="lg:col-span-4 flex flex-col justify-between bg-white dark:bg-[#23272F] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    <span className="text-[#D95D39]">⚡</span> Trending Minggu Ini
                  </div>
                  <span className="text-[11px] text-slate-400">Paling banyak dibaca</span>
                </div>

                <div className="flex flex-col justify-between gap-3 flex-1">
                  {trendingArticles.map((article, idx) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#2C303A] border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-[#D95D39] font-mono text-sm font-black">
                          0{idx + 1}
                        </span>
                        {article.category && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {article.category.name}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          • {article.readingTime || 3} mnt baca
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#D95D39] dark:group-hover:text-[#D95D39] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. FILTER KATEGORI & PENCARIAN (Sticky Top Topic Bar)                   */}
      {/* ========================================================================= */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30'
                : 'bg-slate-100 dark:bg-[#2C303A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#343946]'
            }`}
          >
            Semua Artikel
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30'
                  : 'bg-slate-100 dark:bg-[#2C303A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#343946]'
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#2C303A] border border-transparent focus:border-[#D95D39] dark:focus:border-[#D95D39] text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAGAZINE FEED & SIDEBAR SECTION (2 Columns)                          */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Feed Artikel Horizontal (Col-span 8) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D95D39]" />
              <span>
                {searchQuery
                  ? `Hasil Pencarian (${filteredArticles.length})`
                  : selectedCategory !== 'all'
                  ? `Kategori: ${
                      categories.find((c) => c.slug === selectedCategory)?.name ||
                      selectedCategory
                    }`
                  : 'Artikel Terbaru'}
              </span>
            </h2>
            <span className="text-xs text-slate-500">
              Menampilkan {feedArticles.length} artikel
            </span>
          </div>

          {feedArticles.length > 0 ? (
            <div className="space-y-4">
              {feedArticles.map((article) => (
                <ArticleCardHorizontal key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Tidak ada artikel yang cocok dengan kriteria pencarian atau kategori ini.
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Sticky Sidebar (Col-span 4) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Widget 1: Tentang Logikanya.tech */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#23272F] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="text-xs font-bold text-[#D95D39] uppercase tracking-wider">
              Tentang Publikasi
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Logikanya.tech
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Jurnal catatan rekayasa perangkat lunak, eksplorasi logika komputasi,
              dan arsitektur web modern tanpa basa-basi teknis.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2C303A] text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700/60">
                Next.js 16
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2C303A] text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700/60">
                Strapi v5
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2C303A] text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700/60">
                Bun
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2C303A] text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700/60">
                Tailwind v4
              </span>
            </div>
          </div>

          {/* Widget 2: Topik Hangat Dinamis (#Tags) */}
          {dynamicTags.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#23272F] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5 text-[#D95D39]" />
                <span>Topik Hangat</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {dynamicTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#2C303A] text-slate-700 dark:text-slate-300 hover:text-[#D95D39] hover:border-[#D95D39]/50 hover:bg-[#D95D39]/10 transition-all cursor-pointer"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
