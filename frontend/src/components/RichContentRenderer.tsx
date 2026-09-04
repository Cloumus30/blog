'use client';

import Image from 'next/image';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import CodeBlock from './CodeBlock';
import CalloutBox from './CalloutBox';
import VideoEmbed from './VideoEmbed';

interface RichContentRendererProps {
  blocks: any;
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

  // Cek apakah data bertipe Strapi 5 native Blocks (memiliki elemen dengan properti 'children')
  const isStrapiBlocks = Array.isArray(blocks) && blocks.length > 0 && 'children' in blocks[0];

  if (isStrapiBlocks) {
    return (
      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
        <BlocksRenderer
          content={blocks as BlocksContent}
          blocks={{
            paragraph: ({ children }) => (
              <p className="my-4 leading-relaxed text-base text-slate-700 dark:text-slate-300">
                {children}
              </p>
            ),
            heading: ({ children, level }) => {
              const textContent = Array.isArray(children)
                ? children.map(c => (typeof c === 'string' ? c : (c as any)?.props?.text || '')).join('')
                : String(children || '');
              const headingId = slugify(textContent || 'section');
              if (level === 3) {
                return (
                  <h3
                    id={headingId}
                    className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-24"
                  >
                    {children}
                  </h3>
                );
              }
              return (
                <h2
                  id={headingId}
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 scroll-mt-24"
                >
                  {children}
                </h2>
              );
            },
            code: ({ children }) => {
              const codeString = Array.isArray(children)
                ? children.map(c => (typeof c === 'string' ? c : (c as any)?.props?.text || '')).join('')
                : String(children || '');
              return <CodeBlock code={codeString} language="code" />;
            },
            quote: ({ children }) => (
              <blockquote className="my-6 border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 py-2 rounded-r-lg">
                {children}
              </blockquote>
            ),
            image: ({ image }) => {
              const src = image.url.startsWith('http')
                ? image.url
                : `http://localhost:1337${image.url}`;
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
                  {image.caption && (
                    <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              );
            },
            link: ({ children, url }) => {
              // Jika link merupakan video YouTube, langsung render sebagai video player!
              if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                return <VideoEmbed url={url} />;
              }
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {children}
                </a>
              );
            }
          }}
        />
      </div>
    );
  }

  // Format blok kustom / demo fallback
  return (
    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
      {Array.isArray(blocks) &&
        blocks.map((block: any, idx: number) => {
          switch (block.type) {
            case 'heading': {
              const headingId = slugify(block.text || `section-${idx}`);
              if (block.level === 3) {
                return (
                  <h3
                    key={idx}
                    id={headingId}
                    className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-24"
                  >
                    {block.text}
                  </h3>
                );
              }
              return (
                <h2
                  key={idx}
                  id={headingId}
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 scroll-mt-24"
                >
                  {block.text}
                </h2>
              );
            }

            case 'paragraph':
              return (
                <p key={idx} className="my-4 leading-relaxed text-base text-slate-700 dark:text-slate-300">
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
