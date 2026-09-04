import Image from 'next/image';
import { RichBlock } from '@/lib/types';
import CodeBlock from './CodeBlock';
import CalloutBox from './CalloutBox';
import VideoEmbed from './VideoEmbed';

interface RichContentRendererProps {
  blocks: RichBlock[];
}

export default function RichContentRenderer({ blocks }: RichContentRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-500 italic">Konten artikel belum tersedia.</p>;
  }

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  return (
    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
      {blocks.map((block, idx) => {
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
