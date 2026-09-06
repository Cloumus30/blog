'use client';

import React from 'react';
import Image from 'next/image';
import { BlocksRenderer } from '@qkix/better-blocks-react-renderer';
import CodeBlock from './CodeBlock';
import CalloutBox from './CalloutBox';
import VideoEmbed from './VideoEmbed';

interface FallbackBlock {
  type: string;
  level?: number;
  text?: string;
  code?: string;
  language?: string;
  calloutType?: 'info' | 'warning' | 'danger';
  url?: string;
  caption?: string;
  alt?: string;
}

interface RichContentRendererProps {
  blocks: unknown;
}

export default function RichContentRenderer({ blocks }: RichContentRendererProps) {
  if (!blocks || (Array.isArray(blocks) && blocks.length === 0)) {
    return <p className="text-slate-500 italic">Konten artikel belum tersedia.</p>;
  }

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Cek apakah data bertipe Strapi 5 native Blocks atau Better Blocks
  const isBlocksFormat =
    Array.isArray(blocks) &&
    blocks.length > 0 &&
    typeof blocks[0] === 'object' &&
    blocks[0] !== null &&
    'type' in blocks[0] &&
    ('children' in blocks[0] ||
      blocks[0].type === 'table' ||
      blocks[0].type === 'embed' ||
      blocks[0].type === 'media-embed' ||
      blocks[0].type === 'button');

  if (isBlocksFormat) {
    return (
      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
        <BlocksRenderer
          content={blocks as React.ComponentProps<typeof BlocksRenderer>['content']}
          codeCopyButton={true}
          blocks={{
            paragraph: ({ children, style }) => (
              <p style={style} className="my-5 leading-[1.8] sm:leading-[1.85] text-[17px] sm:text-[18px] text-slate-700 dark:text-slate-300 font-normal">
                {children}
              </p>
            ),
            heading: ({ children, level, style }) => {
              const textContent = Array.isArray(children)
                ? children
                    .map(c =>
                      typeof c === 'string'
                        ? c
                        : React.isValidElement(c)
                        ? String((c.props as { children?: React.ReactNode })?.children || '')
                        : ''
                    )
                    .join('')
                : String(children || '');
              const headingId = slugify(textContent || 'section');
              if (level === 3) {
                return (
                  <h3
                    id={headingId}
                    style={style}
                    className="group flex items-center text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3.5 scroll-mt-24 tracking-tight"
                  >
                    <span>{children}</span>
                    <a
                      href={`#${headingId}`}
                      aria-label="Tautan langsung ke bagian ini"
                      className="ml-2 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-normal"
                    >
                      #
                    </a>
                  </h3>
                );
              }
              return (
                <h2
                  id={headingId}
                  style={style}
                  className="group flex items-center text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 pb-2.5 border-b border-slate-200 dark:border-slate-800 scroll-mt-24 tracking-tight"
                >
                  <span>{children}</span>
                  <a
                    href={`#${headingId}`}
                    aria-label="Tautan langsung ke bagian ini"
                    className="ml-2.5 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl font-normal"
                  >
                    #
                  </a>
                </h2>
              );
            },
            code: ({ plainText, language }) => {
              return <CodeBlock code={plainText} language={language || 'text'} />;
            },
            callout: ({ variant, title, children }) => {
              const typeMap: Record<string, 'info' | 'warning' | 'danger'> = {
                note: 'info',
                tip: 'info',
                important: 'warning',
                warning: 'warning',
                caution: 'danger',
              };
              return (
                <CalloutBox type={typeMap[variant] || 'info'} title={title}>
                  {children}
                </CalloutBox>
              );
            },
            quote: ({ children, style }) => (
              <blockquote
                style={style}
                className="my-7 border-l-4 border-blue-500 pl-5 italic text-[17px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 py-3.5 rounded-r-xl"
              >
                {children}
              </blockquote>
            ),
            image: ({ image, caption }) => {
              const strapiBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
              const src = image.url.startsWith('http')
                ? image.url
                : `${strapiBase}${image.url}`;
              return (
                <figure className="my-8">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-md">
                    <Image
                      src={src}
                      alt={image.alternativeText || 'Gambar artikel'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                  {caption && (
                    <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              );
            },
            link: ({ children, url, target, rel }) => {
              if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                return <VideoEmbed url={url} />;
              }
              return (
                <a
                  href={url}
                  target={target || '_blank'}
                  rel={rel || 'noopener noreferrer'}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {children}
                </a>
              );
            },
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            'table-row': ({ children }) => (
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                {children}
              </tr>
            ),
            'table-cell': ({ children, style }) => (
              <td style={style} className="p-3 text-slate-700 dark:text-slate-300">
                {children}
              </td>
            ),
            'table-header-cell': ({ children, style }) => (
              <th
                style={style}
                className="p-3 font-semibold bg-slate-100/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100"
              >
                {children}
              </th>
            ),
          }}
        />
      </div>
    );
  }

  // Format blok kustom / demo fallback
  return (
    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
      {Array.isArray(blocks) &&
        (blocks as FallbackBlock[]).map((block, idx) => {
          switch (block.type) {
            case 'heading': {
              const headingId = slugify(block.text || `section-${idx}`);
              if (block.level === 3) {
                return (
                  <h3
                    key={idx}
                    id={headingId}
                    className="group flex items-center text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3.5 scroll-mt-24 tracking-tight"
                  >
                    <span>{block.text}</span>
                    <a
                      href={`#${headingId}`}
                      aria-label="Tautan langsung ke bagian ini"
                      className="ml-2 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-normal"
                    >
                      #
                    </a>
                  </h3>
                );
              }
              return (
                <h2
                  key={idx}
                  id={headingId}
                  className="group flex items-center text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 pb-2.5 border-b border-slate-200 dark:border-slate-800 scroll-mt-24 tracking-tight"
                >
                  <span>{block.text}</span>
                  <a
                    href={`#${headingId}`}
                    aria-label="Tautan langsung ke bagian ini"
                    className="ml-2.5 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl font-normal"
                  >
                    #
                  </a>
                </h2>
              );
            }

            case 'paragraph':
              return (
                <p key={idx} className="my-5 leading-[1.8] sm:leading-[1.85] text-[17px] sm:text-[18px] text-slate-700 dark:text-slate-300 font-normal">
                  {block.text}
                </p>
              );

            case 'code':
              return (
                <CodeBlock
                  key={idx}
                  code={block.code || ''}
                  language={block.language || 'text'}
                />
              );

            case 'callout':
              return (
                <CalloutBox
                  key={idx}
                  type={block.calloutType || 'info'}
                  text={block.text || ''}
                />
              );

            case 'video':
              return (
                <VideoEmbed
                  key={idx}
                  url={block.url || ''}
                  caption={block.caption}
                />
              );

            case 'image':
              return (
                <figure key={idx} className="my-8">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-md">
                    <Image
                      src={block.url || ''}
                      alt={block.alt || 'Gambar artikel'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );

            default:
              return null;
          }
        })}
    </div>
  );
}
