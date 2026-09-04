# TechHobby CMS & Blog Platform

Platform publikasi konten dan blog modern untuk artikel teknologi dan hobi, dibangun dengan arsitektur **Headless CMS** performa tinggi menggunakan **Strapi v5**, **Next.js 16 (App Router)**, **Bun**, **PostgreSQL**, dan **Cloudflare Tunnel**.

---

## Arsitektur & Teknologi

* **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS 4, Standalone Mode, Incremental Static Regeneration / ISR).
* **Backend**: Strapi CMS v5 (TypeScript, REST API, Media Upload).
* **Plugin Editor**: `@qkix/strapi-plugin-better-blocks` & `@qkix/better-blocks-react-renderer` (Warna teks, highlight, tabel dinamis, embed video YouTube/Vimeo, to-do list, rumus KaTeX, diagram Mermaid, callouts).
* **Database**: PostgreSQL 16 (Alpine).
* **Runtime & Package Manager**: **Bun 1.3.x**.
* **Containerization**: Multi-container Docker Compose.
* **Network & Ingress**: Terhubung langsung ke network `cloudflare-net` bersama container **Cloudflare Tunnel (`cloudflared`)** untuk ekspos publik aman (*Zero Inbound Open Ports* & auto SSL).

---

## Struktur Direktori

```text
├── backend/                  # Source code Strapi v5 (CMS Backend)
│   ├── config/               # Konfigurasi plugins, middlewares, dan database
│   ├── src/api/              # Content-types (articles, categories, tags, authors)
│   ├── Dockerfile            # Multi-stage build Strapi dengan Bun & Node Alpine
│   └── package.json
├── frontend/                 # Source code Next.js 16 (Blog Publik)
│   ├── src/app/              # App router (/ beranda, /article/[slug], /category/[slug])
│   ├── src/components/       # UI Components (RichContentRenderer, Callout, VideoEmbed, dll)
│   ├── Dockerfile            # Multi-stage build Next.js Standalone
│   └── package.json
├── docs/                     # Arsip dokumentasi perencanaan (PRD, Editorial Guide, System Design, Roadmap)
├── docker-compose.yml        # Orkestrasi Docker (db, strapi, frontend, cloudflare-net)
└── .env.example              # Template environment variable untuk server produksi
```

---

## Panduan Lengkap Deployment ke Server (Step-by-Step)

Ikuti langkah-langkah di bawah ini untuk mendeploy aplikasi ini ke server homelab atau VPS Anda:

### Tahap 1: Di Komputer Lokal (Push Kode Terbaru)

Pastikan seluruh perubahan lokal Anda telah di-commit, lalu jalankan push ke GitHub:
```bash
git push origin main
```

---

### Tahap 2: Di Server (Clone / Pull Proyek & Setup Environment)

1. **Masuk ke Server via SSH**:
   ```bash
   ssh user@ip-server-anda
   ```

2. **Clone atau Pull Repositori**:
   * *Jika deploy pertama kali*:
     ```bash
     git clone git@github.com:Cloumus30/blog.git
     cd blog
     ```
   * *Jika memperbarui proyek yang sudah ada*:
     ```bash
     cd /path/ke/blog
     git pull origin main
     ```

3. **Pastikan Docker Network `cloudflare-net` Aktif**:
   Periksa apakah network tunnel sudah ada di server:
   ```bash
   docker network ls | grep cloudflare-net
   ```
   *(Jika belum ada, buat dengan `docker network create cloudflare-net`).*

4. **Siapkan Berkas `.env` di Server**:
   Salin template `.env.example`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Konfigurasikan nilai berikut:
   * **`POSTGRES_PASSWORD`**: Ganti dengan password database yang aman.
   * **Strapi Secrets**: Ganti `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, dll dengan string acak (bisa gunakan `openssl rand -base64 32`).
   * **`NEXT_PUBLIC_STRAPI_API_URL`**: Masukkan domain publik Strapi Anda yang diarahkan via Cloudflare Tunnel (contoh: `https://cms.domainanda.com`).
   * *Catatan*: Biarkan `STRAPI_API_TOKEN` kosong terlebih dahulu pada tahap ini.

---

### Tahap 3: Build & Jalankan Container

Jalankan Docker Compose untuk mengompilasi dan mengaktifkan seluruh service di background:
```bash
docker compose up -d --build
```

Periksa status container:
```bash
docker compose ps
```
Pastikan ketiga container berikut berstatus `Up` / `healthy`:
* `cms_postgres`
* `cms_strapi`
* `cms_frontend`

---

### Tahap 4: Setup Akun Admin & API Token Strapi

1. **Akses Panel Admin Strapi**:
   * Buka browser di `https://cms.domainanda.com/admin` (atau `http://ip-server:1337/admin`).
   * Isi formulir untuk membuat akun Administrator utama Anda.

2. **Generate API Token untuk Next.js**:
   * Buka menu **Settings** (ikon gerigi) &rarr; **API Tokens**.
   * Klik tombol **Create new API Token**:
     - **Name**: `Nextjs Frontend Token`
     - **Token type**: **Full Access** *(atau Read-Only)*
     - **Token duration**: **Unlimited**
   * Klik **Save**, lalu **salin (*copy*) token panjang** yang ditampilkan di layar.

3. **Simpan Token ke `.env` Server**:
   Buka kembali berkas `.env` di server:
   ```bash
   nano .env
   ```
   Tempelkan token ke variabel:
   ```env
   STRAPI_API_TOKEN=paste_token_panjang_anda_disini
   ```

4. **Restart Container Frontend**:
   Jalankan perintah ini agar container Next.js membaca token yang baru dimasukkan:
   ```bash
   docker compose up -d frontend
   ```

---

### Tahap 5: Konfigurasi Routing Cloudflare Tunnel

Karena container `cms_frontend` dan `cms_strapi` terhubung ke network `cloudflare-net` bersama container `cloudflared`, Anda cukup menambahkan 2 Public Hostname di dashboard **Cloudflare Zero Trust** (atau berkas konfigurasi tunnel):

| Subdomain | Service Type | URL Target di Tunnel |
| :--- | :---: | :--- |
| **`blog.domainanda.com`** | `HTTP` | `cms_frontend:3000` |
| **`cms.domainanda.com`** | `HTTP` | `cms_strapi:1337` |

> [!NOTE]
> Anda tidak perlu menggunakan IP host atau localhost, karena Cloudflare Tunnel dapat langsung menjangkau container menggunakan DNS internal Docker (`cms_frontend:3000` dan `cms_strapi:1337`).

---

### Tahap 6: Verifikasi & Pengujian

1. **Uji Penulisan Konten**: Masuk ke Strapi Admin (`https://cms.domainanda.com/admin`), buat 1 artikel baru dengan fitur Better Blocks (tabel, teks berwarna, atau embed video), lalu klik **Publish**.
2. **Uji Tampilan Publik**: Buka blog Anda (`https://blog.domainanda.com`). Artikel baru akan langsung muncul berkat fitur ISR (Incremental Static Regeneration).

---

## Pengembangan Lokal (Local Development)

Jika ingin menjalankan proyek secara lokal tanpa Docker:

```bash
# 1. Menjalankan Strapi Backend
cd backend
bun install
bun run dev

# 2. Menjalankan Next.js Frontend (di terminal terpisah)
cd frontend
bun install
bun run dev
```

* Strapi Admin: `http://localhost:1337/admin`
* Next.js Blog: `http://localhost:3000`

---

## Dokumentasi Lengkap

Dokumentasi detail arsitektur, PRD, dan panduan editorial tersimpan di direktori [`docs/`](./docs/):
* [01 - Product Requirements Document & Executive Summary](./docs/01_EXECUTIVE_SUMMARY_AND_PRD.md)
* [02 - Editorial Workflow & Writing Guide](./docs/02_EDITORIAL_WORKFLOW_AND_GUIDE.md)
* [03 - System Architecture & Database Design](./docs/03_SYSTEM_ARCHITECTURE_AND_DESIGN.md)
* [04 - Project Roadmap & Timeline](./docs/04_PROJECT_ROADMAP_AND_TIMELINE.md)
