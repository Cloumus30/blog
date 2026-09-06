# Logikanya.tech — Headless CMS & Blog Platform

Platform publikasi konten dan blog modern untuk artikel wawasan logika, kode, dan teknologi, dibangun dengan arsitektur **Headless CMS** performa tinggi menggunakan **Strapi v5 (pnpm)**, **Next.js 16 (Bun)**, **PostgreSQL**, dan **Cloudflare Tunnel**.

---

## 🎨 Identitas Brand & Desain (Brand Guide)

* **Nama Brand**: **Logikanya.tech**
* **Palet Warna**:
  - **Canvas Background**: `#F8F9FA` (Light mode) / `#2C303A` (Dark mode)
  - **Primary Dark**: `#2C303A`
  - **Brand Accent**: `#D95D39` (*Copper Orange* — digunakan pada aksen tombol, badge kategori, dan status preview)
* **Tipografi**: Geist Sans & Geist Mono
* **Tema**: Dark / Light Mode otomatis tersinkronisasi dengan preferensi sistem dan tombol toggle.

---

## ⚡ Arsitektur & Teknologi

* **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4, Standalone Mode, On-Demand ISR).
* **Backend**: Strapi CMS v5 (TypeScript, REST API, Media Upload, In-Memory Rate Limiter).
* **Plugin Strapi**:
  - `@strapi/plugin-color-picker`: Custom field pemilih warna hex visual untuk kategori artikel.
  - `@qkix/strapi-plugin-better-blocks` & `@qkix/better-blocks-react-renderer`: Blok konten rich text (tabel, sintaks koding, rumus KaTeX, diagram Mermaid, callout info/warning, video YouTube/Vimeo).
* **Basis Data**: PostgreSQL 16 (Alpine).
* **Runtime & Package Manager**:
  - **Backend (`backend/`)**: Wajib menggunakan **`pnpm`**.
  - **Frontend (`frontend/`)**: Wajib menggunakan **`bun`**.
* **Containerization**: Multi-container Docker Compose.
* **Network & Ingress**: Terhubung ke network `cloudflare-net` bersama container **Cloudflare Tunnel (`cloudflared`)** untuk ekspos publik aman (*Zero Inbound Open Ports* & auto SSL).

---

## 📁 Struktur Direktori Proyek

```text
├── backend/                  # Source code Strapi v5 (CMS Backend - Package Manager: pnpm)
│   ├── config/               # Konfigurasi plugins, middlewares, dan database
│   ├── src/api/              # Content-types (articles, categories, tags, authors)
│   ├── src/middlewares/      # Custom middleware (rate-limit in-memory)
│   ├── Dockerfile            # Multi-stage build Strapi dengan pnpm & Node Alpine
│   └── package.json
├── frontend/                 # Source code Next.js 16 (Blog Publik - Package Manager: Bun)
│   ├── src/app/              # App router (/ beranda, /article/[slug], /category/[slug], /author/[slug], /tag/[slug])
│   │   ├── api/              # Route Handlers (/api/revalidate, /api/preview, /api/exit-preview)
│   │   ├── feed.xml/         # RSS 2.0 XML Feed endpoint
│   │   ├── sitemap.ts        # Dynamic Next.js Sitemap
│   │   └── article/[slug]/opengraph-image.tsx # Dynamic OG Image (1200x630)
│   ├── src/components/       # UI Components (DraftModeBanner, ArticleJsonLd, RichContentRenderer, dll)
│   ├── src/lib/              # Client Strapi v5 dengan On-Demand Tagged Cache (3600s)
│   ├── Dockerfile            # Multi-stage build Next.js Standalone dengan Bun
│   └── package.json
├── docs/                     # Arsip dokumentasi perencanaan (PRD, Editorial Guide, System Design, Roadmap)
├── docker-compose.yml        # Orkestrasi Docker (db, strapi, frontend, cloudflare-net)
└── .env.example              # Template environment variable untuk server produksi
```

---

## 🚀 Fitur Utama & Integrasi Lanjutan

### 1. Sinkronisasi Data On-Demand & Webhook Revalidation
Next.js menggunakan strategi **On-Demand ISR (Incremental Static Regeneration)** dengan cache tag `articles` (durasi default 3600s). Setiap kali ada artikel dibuat, diubah, dipublikasikan, atau dihapus di Strapi, Strapi Webhook akan memanggil endpoint `/api/revalidate` untuk membuang cache lama seketika tanpa perlu build ulang atau restart container.

### 2. Live Draft Mode / Preview Konten
Penulis dapat melihat tampilan draf artikel sebelum dipublikasikan ke publik:
- Buka URL: `/api/preview?secret=<PREVIEW_SECRET>&slug=<slug-artikel>`
- Next.js akan mengaktifkan cookie `draftMode()`, mem-bypass cache, dan memanggil Strapi dengan parameter `status=draft`.
- Muncul floating banner **`DraftModeBanner`** di bagian atas layar dengan tombol instan *"Keluar Preview"* (`/api/exit-preview`).

### 3. SEO & Visibilitas Mesin Pencari (Google Ready)
- **Dynamic Sitemap (`/sitemap.xml`)**: Otomatis mengindeks beranda, seluruh artikel, kategori, tag, dan author dengan URL kanonikal berbasis `NEXT_PUBLIC_SITE_URL`.
- **RSS 2.0 XML Feed (`/feed.xml`)**: Format RSS 2.0 lengkap untuk pembaca feed reader.
- **Dynamic OpenGraph Image**: Menghasilkan gambar media sosial 1200x630px otomatis via `ImageResponse` dengan judul artikel, kategori, dan brand Logikanya.tech.
- **JSON-LD Schema.org**: Data terstruktur `BlogPosting`, `BreadcrumbList`, dan `Person` di setiap artikel untuk Google Rich Snippets.

### 4. Keamanan & Hardening Produksi
- **HTTP Security Headers**: Dikonfigurasi di `next.config.ts` (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
- **Strapi In-Memory Rate Limiting**: Membatasi request publik ke `/api/*` (120 req/menit per IP) untuk mencegah scraping masif dan serangan brute-force.

---

## 📖 Panduan Konfigurasi Webhook Strapi ke Next.js

Agar perubahan artikel di Strapi langsung ter-update di blog Next.js:

1. Buka **Strapi Admin Panel** (`https://cms.domainanda.com/admin` atau `http://localhost:1337/admin`).
2. Masuk ke **Settings** &rarr; **Webhooks** (di bawah *Global Settings*).
3. Klik **+ Create new webhook**.
4. Isi data konfigurasi:
   - **Name**: `Next.js Revalidation`
   - **Url**: `https://blog.domainanda.com/api/revalidate` *(atau `http://localhost:3000/api/revalidate` saat testing)*
   - **Headers**:
     - Key: `Authorization`
     - Value: `Bearer logikanya-secret-token-2026` *(sesuaikan dengan `REVALIDATION_SECRET` di `.env`)*
   - **Events**: Pada bagian **Entry**, centang:
     - `Create`, `Update`, `Delete`, `Publish`, `Unpublish`
5. Klik **Save**.
6. Klik tombol **Trigger** untuk menguji — respon akan mengembalikan status `200 OK` bertanda hijau.

---

## 🛠️ Pengembangan Lokal (Local Development)

Pastikan mematuhi aturan package manager resmi:

```bash
# 1. Menjalankan Strapi Backend (Wajib pnpm)
cd backend
pnpm install
pnpm run develop

# 2. Menjalankan Next.js Frontend (Wajib bun di terminal terpisah)
cd frontend
bun install
bun run dev
```

* **Blog Publik**: `http://localhost:3000`
* **Strapi Admin**: `http://localhost:1337/admin`
* **Sitemap**: `http://localhost:3000/sitemap.xml`
* **RSS Feed**: `http://localhost:3000/feed.xml`

---

## 🚢 Panduan Deployment ke Server (Docker Compose)

### 1. Di Komputer Lokal (Push Kode Terbaru)
```bash
git push origin main
```

### 2. Di Server (Clone / Pull Proyek)
```bash
ssh user@ip-server-anda
cd /path/ke/blog
git pull origin main
```

### 3. Konfigurasi Berkas `.env` di Server
Salin dari `.env.example` dan lengkapi:
```bash
cp .env.example .env
nano .env
```
Pastikan variabel berikut terisi:
```env
NEXT_PUBLIC_SITE_URL=https://blog.domainanda.com
NEXT_PUBLIC_STRAPI_API_URL=https://cms.domainanda.com
STRAPI_INTERNAL_URL=http://cms_strapi:1337
STRAPI_API_TOKEN=token_strapi_full_access
REVALIDATION_SECRET=string_rahasia_webhook_anda
PREVIEW_SECRET=string_rahasia_preview_anda
```

### 4. Build & Jalankan Container
```bash
docker compose up -d --build
```

### 5. Routing Cloudflare Tunnel (Zero Inbound Open Ports)
Di dashboard Cloudflare Zero Trust (atau file konfigurasi cloudflared), arahkan:
- **`blog.domainanda.com`** &rarr; `HTTP` ke `cms_frontend:3000`
- **`cms.domainanda.com`** &rarr; `HTTP` ke `cms_strapi:1337`

---

## 📚 Dokumentasi Teknis Tambahan

Dokumentasi detail arsitektur, PRD, dan panduan editorial tersimpan di direktori [`docs/`](./docs/):
* [01 - Product Requirements Document & Executive Summary](./docs/01_EXECUTIVE_SUMMARY_AND_PRD.md)
* [02 - Editorial Workflow & Writing Guide](./docs/02_EDITORIAL_WORKFLOW_AND_GUIDE.md)
* [03 - System Architecture & Database Design](./docs/03_SYSTEM_ARCHITECTURE_AND_DESIGN.md)
* [04 - Project Roadmap & Timeline](./docs/04_PROJECT_ROADMAP_AND_TIMELINE.md)
