'use client';

import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Set first item as active initially if none active
    if (!activeId && items.length > 0) {
      setActiveId(items[0].id);
    }

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
    <div>
      <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        Table of contents
      </h4>
      <ul className="space-y-1 text-sm">
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
                className={`w-full text-left transition-all px-2.5 py-1.5 rounded-lg text-xs font-medium line-clamp-2 cursor-pointer ${
                  isActive
                    ? 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
