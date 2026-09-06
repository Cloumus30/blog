'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Layers, ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategoryDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function CategoryDrawerModal({
  isOpen,
  onClose,
  categories,
}: CategoryDrawerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pop-over Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#23272F] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 z-10 space-y-6 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D95D39]/10 dark:bg-[#D95D39]/20 text-[#D95D39] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Jelajahi Kategori
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih topik artikel yang ingin Anda pelajari
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Kategori */}
        <div className="overflow-y-auto pr-1 space-y-3 flex-1">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center italic">
              Belum ada kategori artikel yang tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#2C303A]/50 hover:bg-[#D95D39]/5 dark:hover:bg-[#D95D39]/10 hover:border-[#D95D39]/40 dark:hover:border-[#D95D39]/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: category.color || '#D95D39' }}
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-[#D95D39] dark:group-hover:text-[#D95D39] transition-colors truncate block">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 block">
                          {category.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D95D39] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{categories.length} topik terdaftar</span>
          <Link
            href="/"
            onClick={onClose}
            className="text-[#D95D39] hover:underline font-medium"
          >
            Lihat semua artikel →
          </Link>
        </div>
      </div>
    </div>
  );
}
