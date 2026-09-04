'use client';

import { ListFilter } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  if (!items || items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-sm sticky top-24">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold text-sm">
        <ListFilter className="w-4 h-4 text-blue-500" />
        <span>Daftar Isi (TOC)</span>
      </div>
      <ul className="space-y-2 text-xs">
        {items.map((item, index) => (
          <li
            key={index}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 py-0.5"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
