import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/strapi';

export const alt = 'Logikanya.tech Article Cover';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title || 'Wawasan Logika, Kode & Teknologi';
  const categoryName = article?.category?.name || 'Teknologi';
  const authorName = article?.author?.name || 'Logikanya.tech Team';
  const readingTime = article?.readingTime || 4;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#2C303A',
          backgroundImage:
            'radial-gradient(circle at 90% 10%, rgba(217, 93, 57, 0.2) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(44, 48, 58, 0.8) 0%, transparent 50%)',
          color: '#F8F9FA',
          fontFamily: 'sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header: Brand & Category */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#D95D39',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              L
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                letterSpacing: '-0.5px',
                color: '#F8F9FA',
              }}
            >
              Logikanya<span style={{ color: '#D95D39' }}>.tech</span>
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#D95D39',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '18px',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {categoryName}
          </div>
        </div>

        {/* Middle: Article Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            margin: 'auto 0',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 50 ? '48px' : '56px',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#FFFFFF',
              letterSpacing: '-1px',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom Bar: Author & Reading Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(217, 93, 57, 0.2)',
                color: '#D95D39',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                border: '1px solid rgba(217, 93, 57, 0.4)',
              }}
            >
              {authorName.charAt(0)}
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#F8F9FA',
              }}
            >
              {authorName}
            </span>
          </div>

          <div
            style={{
              fontSize: '18px',
              color: '#A0AEC0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{readingTime} menit baca</span>
            <span>•</span>
            <span>Wawasan Logika & Kode</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
