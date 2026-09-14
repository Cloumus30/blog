# Logikanya.tech — Frontend Web Application

Aplikasi web publik dan antarmuka pembaca untuk blog **Logikanya.tech**, dibangun menggunakan **Next.js 16 (App Router, Turbopack, React 19)** dan dikelola secara eksklusif menggunakan runtime & package manager **Bun**.

---

## ⚡ Fitur Utama Frontend

- **Arsitektur Next.js 16**: Server Components (RSC), App Router, Turbopack, dan Standalone Output untuk deployment container Docker efisien.
- **Strategi Caching & Sinkronisasi Data (On-Demand ISR)**:
  - Cache fetching Strapi v5 berdurasi 3600 detik dengan tag `articles`.
  - Endpoint Webhook [`/api/revalidate`](./src/app/api/revalidate/route.ts) untuk purges cache instan saat ada update dari Strapi.
- **Live Draft Mode**:
  - Endpoint [`/api/preview`](./src/app/api/preview/route.ts) dan [`/api/exit-preview`](./src/app/api/exit-preview/route.ts).
  - Floating status banner [`DraftModeBanner`](./src/components/DraftModeBanner.tsx).
- **SEO & Search Visibility**:
  - [`/sitemap.xml`](./src/app/sitemap.ts): Dynamic Sitemap mencakup Beranda, Artikel, Kategori, Tag, dan Penulis.
  - [`/feed.xml`](./src/app/feed.xml/route.ts): RSS 2.0 XML Feed publik.
  - [`/article/[slug]/opengraph-image`](./src/app/article/[slug]/opengraph-image.tsx): Dynamic OpenGraph Image (1200x630) menggunakan `ImageResponse`.
  - [`ArticleJsonLd`](./src/components/ArticleJsonLd.tsx): Structured data Schema.org (`BlogPosting`, `BreadcrumbList`, `Person`).
- **Desain & Pembaca Modern**:
  - Tailwind CSS v4 dengan dukungan Dark & Light Mode penuh.
  - Palet Brand: Canvas `#F8F9FA`, Primary `#2C303A`, Accent `#D95D39`.
  - **VS Code Style Code Block** ([`src/components/CodeBlock.tsx`](./src/components/CodeBlock.tsx)):
    - Renderer kustom Better Blocks (`vscode-code`) via `@qkix/better-blocks-react-renderer`.
    - Real-time syntax highlighting tematik VS Code Dark+ via modular `highlight.js`.
    - Mac window dots, tab nama file aktif, kolom line numbers, dan tombol copy interaktif.
  - Auto Table of Contents (TOC) sticky di sidebar.
  - Reading Progress Bar atas.
  - Rute arsip dinamis: `/category/[slug]`, `/author/[slug]`, dan `/tag/[slug]`.
  - Navigasi artikel sebelumnya/selanjutnya (`AdjacentArticlesNav`).
- **Keamanan**:
  - Standard HTTP Security Headers di `next.config.ts` (`X-Frame-Options: SAMEORIGIN`, `nosniff`, dll).

---

## 🛠️ Package Manager & Eksekusi

> [!IMPORTANT]
> Proyek frontend ini **wajib** menggunakan **`bun`**. Jangan gunakan `npm`, `yarn`, atau `pnpm` di direktori ini.

```bash
# Instalasi dependensi
bun install

# Menjalankan development server (port 3000)
bun run dev

# Memeriksa linter code style
bun run lint

# Kompilasi build produksi
bun run build

# Menjalankan build produksi
bun run start
```

---

## 🔐 Environment Variables

Konfigurasikan pada berkas `.env.local` (atau environment server):

```env
# URL publik Strapi (diakses browser klien jika diperlukan)
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337

# URL internal Strapi (digunakan server Next.js untuk fetch cepat di network internal Docker)
STRAPI_INTERNAL_URL=http://localhost:1337

# API Token Strapi (Settings -> API Tokens -> Full Access / Read-Only)
STRAPI_API_TOKEN=your_strapi_api_token_here

# Domain kanonikal situs untuk SEO sitemap & RSS
NEXT_PUBLIC_SITE_URL=https://blog.cloudias.my.id

# Secret token untuk memvalidasi webhook revalidasi dari Strapi
REVALIDATION_SECRET=logikanya-secret-token-2026

# Secret token untuk mengakses live preview draf
PREVIEW_SECRET=logikanya-secret-token-2026
```
