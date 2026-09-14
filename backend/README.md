# 🚀 Logikanya.tech — Backend CMS (Strapi v5)

Backend sistem publikasi konten dan Headless CMS untuk platform **Logikanya.tech**, dibangun menggunakan **Strapi v5 (TypeScript)** dan dikelola secara eksklusif menggunakan package manager **`pnpm`**.

---

## 📦 Standar Package Manager

> [!IMPORTANT]
> Backend ini **wajib** menggunakan **`pnpm`** (misal: `pnpm install`, `pnpm run build`, `pnpm run dev`, `pnpm run start`). Jangan gunakan `npm`, `yarn`, atau `bun` secara langsung di direktori ini.

---

## ⚡ Fitur Utama & Kustomisasi Backend

### 1. Custom VS Code Block (`vscode-code`)
Didaftarkan di [`src/admin/app.tsx`](./src/admin/app.tsx) melalui ekstensi API `@qkix/strapi-plugin-better-blocks/strapi-admin`:
- **Antarmuka VS Code Dark+**: Header dengan Mac window controls (merah, kuning, hijau) dan tab berkas aktif yang dapat diedit langsung.
- **Dukungan 15+ Bahasa**: TypeScript, JavaScript, Python, Bash/Shell, SQL, HTML, CSS, JSON, Go, Rust, Java, C++, PHP, YAML, dan Markdown.
- **Line Numbers Gutter**: Nomor baris otomatis bertambah seiring penambahan baris kode.
- **Smart Tab Indentation**: Tombol <kbd>Tab</kbd> menyisipkan 2 spasi tanpa kehilangan fokus kursor.
- **Real-Time Syntax Highlighting**: Pewarnaan syntax langsung pada editor admin menggunakan arsitektur modular `highlight.js/lib/core` yang kebal terhadap *chunk loading race condition* pada Vite.
- **Sinkronisasi Slate AST Persisten**: Setiap blok memiliki `id` unik stabil (`blockIdRef`) dan terhubung ke pelacak editor global (`window.__betterBlocksEditors`), sehingga perubahan nama berkas, bahasa, dan teks kode langsung memperbarui AST Slate dan mengaktifkan tombol **Save** / **Publish** secara otomatis.

### 2. Sticky Top Toolbar pada Editor Rich Text (Better Blocks)
Dikonfigurasi di [`src/admin/app.tsx`](./src/admin/app.tsx) melalui hook `bootstrap(app: StrapiApp)` untuk menyuntikkan styling toolbar cerdas:
- **Sticky Navigation**: Toolbar formatting (pilihan heading, font, ukuran, link, kode, alignment, list) otomatis menempel di bagian atas layar saat pengguna scroll ke bawah di area editor artikel yang panjang.
- **Scroll Context Un-trapping**: Mengatasi batasan `overflow-y: auto` dan `overflow-x: hidden` bawaan plugin agar konteks sticky menempel langsung relatif terhadap scroll halaman (`[data-strapi-main-content]`).
- **Dynamic Theme Inheritance**: Menggunakan `background-color: inherit` sehingga otomatis menyesuaikan warna latar belakang editor (Light Mode `#ffffff` dan Dark Mode `#212134`) secara solid tanpa tembus pandang.
- **Elevation & Bound Isolation**: Dilengkapi border pemisah dan bayangan halus (`box-shadow`); toolbar berhenti menempel secara alami ketika kursor keluar dari batas bawah editor konten artikel.
- **Support Modal Dialog**: Tetap berfungsi optimal dan menempel di `top: 0` pada mode Fullscreen / Expanded View editor.

### 3. Optimasi Vite Bundler Admin Panel
Dikonfigurasi di [`src/admin/vite.config.ts`](./src/admin/vite.config.ts) untuk menghemat alokasi memori RAM saat kompilasi admin panel Strapi:
- `reportCompressedSize: false` (mencegah komputasi gzip 770+ chunk di memori RAM).
- `sourcemap: false` untuk build produksi.
- `maxParallelFileOps: 2` untuk mencegah kehabisan file descriptor / heap spike.
- Skrip `build` di [`package.json`](./package.json) dikonfigurasi dengan `NODE_OPTIONS="--max-old-space-size=2560"`.

### 4. Keamanan & Performa API
- **In-Memory Rate Limiting** ([`src/middlewares/rate-limit.ts`](./src/middlewares/rate-limit.ts)): Membatasi 120 req/menit per IP untuk endpoint `/api/*`.
- **Database Support**: PostgreSQL 16 untuk server produksi (Docker) dan SQLite (`.tmp/data.db`) untuk pengembangan lokal cepat.

---

## 🛠️ Perintah Eksekusi (CLI Commands)

```bash
# 1. Instalasi dependensi
pnpm install

# 2. Menjalankan development server dengan auto-reload (port 1337)
pnpm run develop
# atau alias:
pnpm run dev

# 3. Kompilasi build admin panel produksi
pnpm run build

# 4. Menjalankan server produksi
pnpm run start
```

---

## 📂 Struktur Direktori Backend

```text
├── config/               # Konfigurasi database, middlewares, dan plugins
├── database/             # Database migrations
├── src/
│   ├── admin/            # Kustomisasi Strapi Admin Panel
│   │   ├── app.tsx       # Registrasi Custom Block VS Code & Slate AST Sync
│   │   └── vite.config.ts# Optimasi build Vite (RAM / Heap friendly)
│   ├── api/              # Content-Types (articles, categories, tags, authors)
│   ├── components/       # Reusable Strapi components
│   └── middlewares/      # Custom middleware (rate-limiting)
├── Dockerfile            # Multi-stage production container build dengan pnpm
└── package.json
```
