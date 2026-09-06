'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ListFilter } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  collapsible?: boolean;
}

export default function TableOfContents({ items, collapsible = false }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(() => items[0]?.id || '');
  const [isOpen, setIsOpen] = useState<boolean>(!collapsible);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items, activeId]);

  if (!items || items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left py-1 text-slate-800 dark:text-slate-200 cursor-pointer font-semibold text-sm select-none"
        >
          <span className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Daftar Isi</span>
            <span className="text-xs font-normal text-slate-500">({items.length} bagian)</span>
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <ListFilter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Daftar Isi
          </h4>
        </div>
      )}

      {isOpen && (
        <ul className={`space-y-1 text-sm ${collapsible ? 'mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80' : ''}`}>
          {items.map((item, index) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={index}
                style={{ paddingLeft: `${Math.max(0, (item.level - 2) * 10)}px` }}
              >
                <button
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full text-left transition-all px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                    isActive
                      ? 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 font-semibold border-l-2 border-blue-600 dark:border-blue-400 pl-2.5'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium'
                  }`}
                >
                  <span className="line-clamp-2">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
