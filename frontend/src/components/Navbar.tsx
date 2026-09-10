'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Terminal, ExternalLink, Layers, ChevronDown } from 'lucide-react';
import { Category } from '@/lib/types';
import CategoryDrawerModal from './CategoryDrawerModal';

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const cmsStrApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  useEffect(() => {
    // Check saved theme: default to light unless explicitly saved as 'dark'
    const saved = localStorage.getItem('theme');
    const shouldBeDark = saved === 'dark';

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const timer = setTimeout(() => {
      setIsDark(shouldBeDark);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F8F9FA]/80 dark:bg-[#2C303A]/85 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#D95D39] flex items-center justify-center text-white shadow-md shadow-[#D95D39]/30 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-[#D95D39] dark:group-hover:text-[#D95D39] transition-colors">
                Logikanya<span className="text-[#D95D39]">.tech</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Logic, Code & Engineering
              </span>
            </div>
          </Link>

          {/* Navigation Links & Action */}
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors">
                Beranda
              </Link>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors cursor-pointer text-sm font-medium"
              >
                <Layers className="w-4 h-4 text-[#D95D39]" />
                <span>Kategori</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </nav>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* CMS Admin Link */}
            {cmsStrApiUrl && (
              <a
                href={cmsStrApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-[#D95D39]/10 text-slate-700 dark:text-slate-300 hover:text-[#D95D39] dark:hover:text-[#D95D39] transition-colors border border-slate-200 dark:border-slate-800"
              >
                <span>CMS Admin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Pop-over Drawer Modal Kategori */}
      <CategoryDrawerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
      />
    </>
  );
}
