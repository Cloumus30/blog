# 03. Arsitektur Sistem & Spesifikasi Teknis (System Architecture & Design)

| Metadata Teknis | Keterangan |
| :--- | :--- |
| **Arsitektur Utama** | Decoupled / Headless CMS |
| **Runtime & Package Manager** | **pnpm** (Backend / Strapi) & **Bun 1.x** (Frontend / Next.js) |
| **Backend Service** | Strapi v4/v5 |
| **Frontend Framework** | Next.js (App Router, Server Components) / Astro |
| **Database** | PostgreSQL 15+ |
| **Asset / Media Storage** | Cloudinary / AWS S3 Compatible (Cloudflare R2 / Supabase Storage) |
| **Target Lingkungan** | Docker Multi-Container di Server Pribadi (Private Server/Homelab) |
| **Ingress & SSL** | Cloudflare Tunnel (Docker container yang sudah aktif di server) |

---

## 1. Diagram Arsitektur Sistem (System Architecture)

```mermaid
graph TB
    subgraph "Public Internet & Cloudflare Edge"
        Visitor["Pengunjung Publik"]
        AuthorUser["Tim Penulis / Admin"]
        CFEdge["Cloudflare Edge (Auto SSL, CDN, DDoS Shield)"]
    end

    subgraph "Private Server (Docker Host)"
        subgraph "Existing Container"
            CFTunnel["Cloudflare Tunnel (cloudflared container)"]
        end

        subgraph "CMS Docker Compose Network"
            FrontendContainer["Next.js / Astro Frontend (Port 3000)"]
            StrapiContainer["Strapi CMS Engine & Admin (Port 1337)"]
            PostgresContainer[("PostgreSQL 16 DB (Port 5432)")]
            NamedVol[("Docker Named Volumes: postgres_data & strapi_uploads")]
        end
    end

    subgraph "Cloud Storage (Opsional / Terpisah)"
        CloudMedia[("Cloudinary / Cloudflare R2")]
    end

    Visitor -->|blog.domain.com| CFEdge
    AuthorUser -->|cms.domain.com| CFEdge
    CFEdge <==>|Encrypted Tunnel (No Open Inbound Ports)| CFTunnel

    CFTunnel -->|Route to port 3000 / network| FrontendContainer
    CFTunnel -->|Route to port 1337 / network| StrapiContainer

    FrontendContainer -.->|Fetch API Data| StrapiContainer
    StrapiContainer --> PostgresContainer
    PostgresContainer --- NamedVol
    StrapiContainer --- NamedVol
    StrapiContainer -.-> CloudMedia
```

---

## 2. Pemodelan Data & Skema Konten (Content Schema)

Berikut adalah definisi *Content-Types* utama yang dikonfigurasi di dalam Strapi:

### 2.1 Collection Type: `articles`
Menyimpan data postingan blog:
* `id`: Integer (Primary Key)
* `title`: String (Required, Max 150)
* `slug`: UID (Target field: `title`, Unique, Indexed)
* `excerpt`: Text (Short description, Max 250)
* `content`: Rich Block JSON (Struktur blok terstandar: teks, code snippets, list, callouts, media gambar lokal/eksternal URL, serta blok embed video YouTube/Vimeo)
* `cover_image`: Media Relation (Single image, Required)
* `status`: Enumeration (`draft`, `published`, `archived`)
* `published_at`: DateTime (Nullable)
* `reading_time`: Integer (Estimasi menit, auto-calculated on save)
* `author`: Relation `manyToOne` ke `authors`
* `category`: Relation `manyToOne` ke `categories`
* `tags`: Relation `manyToMany` ke `tags`
* `created_at`, `updated_at`: DateTime (Timestamp bawaan)

### 2.2 Collection Type: `categories`
* `id`: Integer
* `name`: String (Unique)
* `slug`: UID (Target field: `name`, Unique)
* `description`: Text (Optional)
* `color`: Custom Field (`plugin::color-picker.color` via `@strapi/plugin-color-picker`, default: `#D95D39`)

### 2.3 Collection Type: `tags`
* `id`: Integer
* `name`: String (Unique)
* `slug`: UID (Target field: `name`, Unique)

### 2.4 Collection Type: `authors`
* `id`: Integer
* `name`: String (Required)
* `bio`: Text
* `avatar`: Media Relation (Single image)
* `social_links`: Repeatable Component (`shared.social-link`: `platform` [String], `url` [String])
* `user_account`: Relation `oneToOne` ke akun `admin::user` Strapi

---

## 3. Strategi Performa, Rendering, & Caching

Untuk menjamin waktu respon di bawah 1 detik dan ketahanan traffic tinggi:

1. **On-Demand Incremental Static Regeneration (ISR)**:
   * Next.js menerapkan fetch cache berdurasi default `revalidate: 3600` dengan cache tag `articles`.
   * Ketika artikel di-publish, di-update, di-unpublish, atau dihapus di Strapi, Strapi mengirimkan HTTP POST ke endpoint Next.js `/api/revalidate` dengan header rahasia `Authorization: Bearer <REVALIDATION_SECRET>`.
   * Next.js memicu `revalidateTag('articles', 'max')` dan `revalidatePath('/article/[slug]')` seketika untuk membuang cache lama tanpa perlu me-rebuild atau me-restart aplikasi.
2. **Next.js Live Draft Mode & Preview**:
   * Endpoint `/api/preview?secret=<PREVIEW_SECRET>&slug=<slug>` mengaktifkan cookie `draftMode()`.
   * Halaman detail artikel memeriksa status draf dan memanggil Strapi dengan query parameter `status=draft&publicationState=preview` serta `cache: 'no-store'` untuk melihat konten belum rilis.
   * Floating banner `DraftModeBanner` tampil di atas halaman dengan tombol instan `/api/exit-preview`.
3. **Kemandirian Operasional (High Resilience)**:
   * Karena frontend memanfaatkan static caching di Edge/CDN, blog publik tetap dapat dibaca pembaca 100% normal meskipun backend Strapi sedang di-restart atau mengalami *maintenance*.
4. **Pencarian Cepat Sisi Klien (Client-side / Hybrid Search)**:
   * Frontend mengunduh index pencarian ringan (berisi `title`, `slug`, `excerpt`, `category`, `tags`) saat pertama kali dibuka, memungkinkan pencarian instan tanpa membebani database backend.

---

## 4. Keamanan & Kontrak API (API & Security)

### 4.1 Endpoint REST API Utama (Strapi $\rightarrow$ Frontend)
Frontend menggunakan API Token berjenis **Read-Only** untuk mengakses konten yang berstatus `published`:

* `GET /api/articles?populate=*&filters[status][$eq]=published&sort=published_at:desc`: Mengambil daftar artikel terbaru untuk halaman beranda.
* `GET /api/articles?filters[slug][$eq]={slug}&populate=*`: Mengambil detail artikel tunggal berdasarkan slug.
* `GET /api/categories`: Mengambil seluruh daftar kategori.
* `GET /api/tags`: Mengambil seluruh daftar tag.

### 4.2 Prinsip Keamanan
* **Prinsip Hak Akses Terkecil (Least Privilege)**: Endpoint publik Strapi hanya mengizinkan pembacaan data publik. Seluruh endpoint mutasi (Create, Update, Delete) terkunci hanya untuk token admin/penulis yang terautentikasi.
* **CORS & Rate Limiting Backend**: Backend Strapi dilengkapi middleware in-memory rate limiting (`src/middlewares/rate-limit.ts`) yang membatasi 120 request/menit per IP untuk endpoint `/api/*` guna mencegah scraping masif dan serangan DDoS.
* **HTTP Security Headers Frontend**: Next.js menginjeksi header perlindungan standar industri: `X-Frame-Options: SAMEORIGIN` (mencegah Clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Permissions-Policy`.
* **Penyimpanan Media Terisolasi**: File media disimpan di Cloud Storage (Cloudinary/S3/R2), tidak membebani kapasitas disk lokal server database.

---

## 5. Spesifikasi Deployment Docker & Cloudflare Tunnel

### 5.1 Struktur Layanan Docker Compose (`docker-compose.yml`)
Seluruh komponen inti dijalankan di server pribadi dengan koordinasi Docker Compose:

1. **`service: db` (PostgreSQL 16)**:
   * Image: `postgres:16-alpine`.
   * Environment: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
   * Volume: `postgres_data:/var/lib/postgresql/data` (Named Volume untuk performa I/O tinggi & persistensi data).
   * Keamanan: Port tidak diekspos ke host publik, hanya dapat diakses oleh container `strapi` melalui Docker internal network.
2. **`service: strapi` (CMS Backend)**:
   * Build: Multi-stage Dockerfile memanfaatkan Node Alpine dengan `pnpm` untuk manajemen dependensi backend yang terisolasi dan stabil.
   * Port Mapping: `127.0.0.1:1337:1337` (hanya mendengarkan antarmuka lokal localhost server).
   * Volume: `strapi_uploads:/app/public/uploads` (Named Volume untuk penyimpanan aset lokal).
   * Depends On: `db` (menunggu database siap sebelum Strapi menyala).
3. **`service: frontend` (Next.js Blog)**:
   * Build: Multi-stage Dockerfile memanfaatkan Bun (`bun install` & `bun run build`) dengan fitur `output: 'standalone'` Next.js (menghasilkan image super ringan < 150MB).
   * Port Mapping: `127.0.0.1:3000:3000` (hanya mendengarkan antarmuka lokal localhost server).
   * Environment: `NEXT_PUBLIC_STRAPI_API_URL=https://cms.domain.com` dan `STRAPI_INTERNAL_URL=http://strapi:1337`.

### 5.2 Integrasi Cloudflare Tunnel (Tanpa Reverse Proxy Eksternal)
Karena server pribadi Anda telah memiliki container **Cloudflare Tunnel (`cloudflared`)** yang berjalan, kita tidak membutuhkan Nginx / Caddy terpisah:

* **Mekanisme Ingress**:
  - Di Cloudflare Zero Trust Dashboard (atau berkas `config.yml` container `cloudflared`), tambahkan ingress rule:
    - Public Hostname `blog.domain.com` $\rightarrow$ Service `http://127.0.0.1:3000` (atau IP/nama container jika berada di Docker network yang sama).
    - Public Hostname `cms.domain.com` $\rightarrow$ Service `http://127.0.0.1:1337`.
* **Keunggulan Arsitektur**:
  - **Zero Inbound Port**: Port 80, 443, atau IP publik server Anda sama sekali tidak perlu dibuka/di-forward di router WiFi / ISP.
  - **Automated SSL & DDoS Shield**: Seluruh sertifikat HTTPS (SSL) dikelola penuh oleh Cloudflare Edge.

### 5.3 Alur Build & Update di Server Pribadi
Build image dilakukan langsung di server pribadi tanpa perlu container registry eksternal:
```bash
# Prosedur pembaruan kode dan deployment di server
git pull origin main
docker compose build --no-cache
docker compose up -d --remove-orphans
```
