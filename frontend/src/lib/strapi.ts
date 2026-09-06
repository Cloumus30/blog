import { cache } from 'react';
import { Article, Category, Author, Tag } from './types';

const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  return headers;
}

// Contoh data artikel bawaan (Demo fallback) untuk pengujian langsung
export const DEMO_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Panduan Praktis Setup Docker & Cloudflare Tunnel untuk Self-Hosting',
    slug: 'panduan-setup-docker-cloudflare-tunnel',
    excerpt: 'Cara aman dan hemat biaya menjalankan web server dan CMS sendiri dari rumah tanpa membuka port router fisik.',
    readingTime: 4,
    publishedAt: '2026-09-04T08:00:00Z',
    featured: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
    category: {
      id: 1,
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      color: '#D95D39',
    },
    tags: [
      { id: 1, name: 'docker', slug: 'docker' },
      { id: 2, name: 'cloudflare', slug: 'cloudflare' },
      { id: 3, name: 'self-hosting', slug: 'self-hosting' }
    ],
    author: {
      id: 1,
      name: 'Cloudias',
      bio: 'Software Engineer & Homelab Enthusiast',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      socialLinks: [
        { platform: 'github', url: 'https://github.com' },
        { platform: 'website', url: 'https://cloudias.dev' }
      ]
    },
    content: [
      {
        type: 'heading',
        level: 2,
        text: 'Mengapa Memilih Cloudflare Tunnel?'
      },
      {
        type: 'paragraph',
        text: 'Menjalankan server di rumah atau VPS pribadi sering kali menghadapi kendala IP publik dinamis (Dynamic IP) atau firewall dari ISP yang memblokir port 80 dan 443. Cloudflare Tunnel memberikan solusi revolusioner: koneksi terenkripsi keluar (outbound-only) langsung ke edge network Cloudflare.'
      },
      {
        type: 'callout',
        calloutType: 'info',
        text: 'Dengan Cloudflare Tunnel, Anda tidak perlu lagi melakukan Port Forwarding di modem/router WiFi Anda. Ini secara dramatis meningkatkan keamanan homelab Anda dari serangan port scanner otomatis di internet.'
      },
      {
        type: 'heading',
        level: 2,
        text: 'Video Demonstrasi: Arsitektur Cloudflare Tunnel'
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ey4u7OUAF3c',
        caption: 'Penjelasan cara kerja Cloudflare Zero Trust & Cloudflared Tunnel'
      },
      {
        type: 'heading',
        level: 2,
        text: 'Konfigurasi Docker Compose'
      },
      {
        type: 'paragraph',
        text: 'Berikut adalah contoh konfigurasi multi-container `docker-compose.yml` untuk menjalankan layanan web lokal yang siap disambungkan ke Tunnel:'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `version: '3.8'

services:
  web_app:
    image: nginx:alpine
    container_name: my_local_service
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro`
      },
      {
        type: 'callout',
        calloutType: 'warning',
        text: 'Pastikan selalu melakukan binding port ke 127.0.0.1 (bukan 0.0.0.0) agar port layanan Anda hanya bisa diakses dari localhost server Anda sendiri!'
      },
      {
        type: 'heading',
        level: 2,
        text: 'Kesimpulan'
      },
      {
        type: 'paragraph',
        text: 'Kombinasi Docker dan Cloudflare Tunnel adalah standar emas saat ini bagi siapa saja yang ingin memiliki kontrol penuh atas datanya sendiri tanpa mengorbankan keamanan atau kemudahan akses.'
      }
    ]
  },
  {
    id: 2,
    title: 'Merakit Mechanical Keyboard Custom: Panduan Pemula dari Nol',
    slug: 'panduan-merakit-mechanical-keyboard-custom',
    excerpt: 'Eksplorasi hobi keyboard mekanikal: memilih layout 65% vs 75%, jenis switch (linear, tactile), hingga teknik lubing.',
    readingTime: 5,
    publishedAt: '2026-09-03T14:30:00Z',
    featured: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    category: {
      id: 2,
      name: 'Hobi & Gadget',
      slug: 'hobi-gadget',
      color: '#ec4899',
    },
    tags: [
      { id: 4, name: 'keyboard', slug: 'keyboard' },
      { id: 5, name: 'diy', slug: 'diy' },
      { id: 6, name: 'gadget', slug: 'gadget' }
    ],
    author: {
      id: 1,
      name: 'Cloudias',
      bio: 'Software Engineer & Homelab Enthusiast',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    content: [
      {
        type: 'heading',
        level: 2,
        text: 'Anatomi Mechanical Keyboard'
      },
      {
        type: 'paragraph',
        text: 'Berbeda dari keyboard membran biasa yang murah, keyboard mekanikal custom tersusun atas komponen independen: Case, PCB (Printed Circuit Board), Plate, Stabilizer, Switch, dan Keycaps.'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
        caption: 'Keycaps PBT dengan profil Cherry dan switch custom',
        alt: 'Mechanical keyboard aesthetic workspace'
      },
      {
        type: 'heading',
        level: 2,
        text: 'Video Review Suara (Sound Test)'
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=34d7KjWw96c',
        caption: 'Contoh sound test tactile switch setelah dilube dengan Krytox 205g0'
      },
      {
        type: 'callout',
        calloutType: 'info',
        text: 'Tips: Jika Anda mengetik di ruang kerja bersama atau kantor, gunakan Silent Linear Switch untuk meredam kebisingan.'
      }
    ]
  },
  {
    id: 3,
    title: 'Mengenal Bun 1.x: Mengapa Ekosistem JavaScript Bergerak Semakin Cepat',
    slug: 'mengenal-bun-javascript-runtime-cepat',
    excerpt: 'Ulasan arsitektur runtime Bun, kompatibilitas Node.js, dan bagaimana Bun menghemat waktu build dalam pipeline CI/CD.',
    readingTime: 3,
    publishedAt: '2026-09-02T10:15:00Z',
    featured: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    category: {
      id: 1,
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      color: '#D95D39',
    },
    tags: [
      { id: 7, name: 'bun', slug: 'bun' },
      { id: 8, name: 'javascript', slug: 'javascript' },
      { id: 9, name: 'performance', slug: 'performance' }
    ],
    author: {
      id: 1,
      name: 'Cloudias',
      bio: 'Software Engineer & Homelab Enthusiast',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    content: [
      {
        type: 'heading',
        level: 2,
        text: 'Keunggulan Bun Dibandingkan Node & npm Tradisional'
      },
      {
        type: 'paragraph',
        text: 'Ditulis dari awal menggunakan bahasa pemrograman Zig dan ditenagai oleh mesin JavaScriptCore milik WebKit Apple, Bun dirancang khusus untuk kecepatan ekstrem.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Instalasi dependensi dengan Bun hanya butuh hitungan detik:
bun install

# Menjalankan server development:
bun run dev`
      },
      {
        type: 'callout',
        calloutType: 'info',
        text: 'Bun secara bawaan mendukung TypeScript dan berkas .env tanpa perlu konfigurasi ts-node atau dotenv manual.'
      }
    ]
  }
];

function formatCoverUrl(url?: string): string {
  if (!url) return DEMO_ARTICLES[0].coverImageUrl;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

export const getArticles = cache(async function getArticles(options?: { isDraft?: boolean }): Promise<Article[]> {
  try {
    const isDraft = options?.isDraft;
    const draftParam = isDraft ? '&status=draft&publicationState=preview' : '';
    const fetchOptions: RequestInit = isDraft
      ? {
          headers: getHeaders(),
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        }
      : {
          headers: getHeaders(),
          next: { revalidate: 3600, tags: ['articles'] },
          signal: AbortSignal.timeout(3000),
        };

    const res = await fetch(
      `${STRAPI_URL}/api/articles?populate[0]=category&populate[1]=tags&populate[2]=cover_image&populate[3]=author.avatar&populate[4]=author.social_links&sort=publishedAt:desc${draftParam}`,
      fetchOptions
    );
    if (!res.ok) {
      console.warn(`Strapi fetch returned status ${res.status}`);
      return DEMO_ARTICLES;
    }
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      return DEMO_ARTICLES;
    }
    type StrapiArticleItem = {
      id: number;
      title: string;
      slug: string;
      excerpt?: string;
      better_content?: unknown;
      content?: unknown;
      video_url?: string;
      cover_image?: { url?: string };
      reading_time?: number;
      publishedAt?: string;
      createdAt?: string;
      category?: { id: number; name: string; slug: string; color?: string };
      tags?: Array<{ id: number; name: string; slug: string }>;
      author?: {
        id: number;
        name: string;
        bio?: string;
        avatar?: { url?: string };
        social_links?: Array<{ id?: number; platform?: string; url?: string }>;
      };
    };

    // Mapping Strapi v5 data structure
    return (data.data as StrapiArticleItem[]).map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: (item.better_content && (Array.isArray(item.better_content) ? item.better_content.length > 0 : true))
        ? item.better_content
        : (item.content || []),
      videoUrl: item.video_url || undefined,
      coverImageUrl: formatCoverUrl(item.cover_image?.url),
      readingTime: item.reading_time || 3,
      publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        color: item.category.color || '#D95D39'
      } : undefined,
      tags: item.tags?.map(t => ({ id: t.id, name: t.name, slug: t.slug })) || [],
      author: item.author ? {
        id: item.author.id,
        name: item.author.name,
        bio: item.author.bio,
        avatarUrl: item.author.avatar?.url ? formatCoverUrl(item.author.avatar.url) : undefined,
        socialLinks: Array.isArray(item.author.social_links)
          ? item.author.social_links.map(s => ({
              id: s.id,
              platform: s.platform || '',
              url: s.url || ''
            }))
          : undefined
      } : undefined
    }));
  } catch (err) {
    console.error('Error fetching articles from Strapi:', err);
    // Fallback ke data demo jika server Strapi offline
    return DEMO_ARTICLES;
  }
});

export async function getArticleBySlug(
  slug: string,
  options?: { isDraft?: boolean }
): Promise<Article | null> {
  const articles = await getArticles(options);
  const found = articles.find(a => a.slug === slug);
  return found || null;
}

export async function getCategories(): Promise<Category[]> {
  const articles = await getArticles();
  const categoryMap = new Map<string, Category>();
  articles.forEach(a => {
    if (a.category) {
      categoryMap.set(a.category.slug, a.category);
    }
  });
  return Array.from(categoryMap.values());
}

export async function getRelatedArticles(
  currentSlug: string,
  categorySlug?: string,
  limit: number = 3
): Promise<Article[]> {
  const articles = await getArticles();
  const filtered = articles.filter(a => a.slug !== currentSlug);

  if (categorySlug) {
    const sameCategory = filtered.filter(a => a.category?.slug === categorySlug);
    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit);
    }
    const others = filtered.filter(a => a.category?.slug !== categorySlug);
    return [...sameCategory, ...others].slice(0, limit);
  }

  return filtered.slice(0, limit);
}

export async function getAdjacentArticles(currentSlug: string): Promise<{
  prev: Article | null;
  next: Article | null;
}> {
  const articles = await getArticles();
  const currentIndex = articles.findIndex(a => a.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // articles diurutkan dari yang terbaru (index 0) ke terlama
  const next = currentIndex > 0 ? articles[currentIndex - 1] : null; // Lebih baru
  const prev = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null; // Lebih lama

  return { prev, next };
}

export function slugifyAuthor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export async function getAuthorByIdOrSlug(identifier: string): Promise<Author | null> {
  const articles = await getArticles();
  const decoded = decodeURIComponent(identifier).toLowerCase();
  const matchedArticle = articles.find(
    a => a.author && (String(a.author.id) === decoded || slugifyAuthor(a.author.name) === decoded)
  );
  return matchedArticle?.author || null;
}

export async function getArticlesByAuthor(identifier: string): Promise<Article[]> {
  const articles = await getArticles();
  const decoded = decodeURIComponent(identifier).toLowerCase();
  return articles.filter(
    a => a.author && (String(a.author.id) === decoded || slugifyAuthor(a.author.name) === decoded)
  );
}

export async function getTags(): Promise<Tag[]> {
  const articles = await getArticles();
  const tagMap = new Map<string, Tag>();
  articles.forEach(a => {
    a.tags?.forEach(t => {
      tagMap.set(t.slug, t);
    });
  });
  return Array.from(tagMap.values());
}

export async function getArticlesByTag(tagSlug: string): Promise<Article[]> {
  const articles = await getArticles();
  const decoded = decodeURIComponent(tagSlug).toLowerCase();
  return articles.filter(a => a.tags?.some(t => t.slug.toLowerCase() === decoded));
}


