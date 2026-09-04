# Arsip Dokumentasi Perencanaan CMS (Tech & Hobby Publishing Platform)

Selamat datang di repositori dokumentasi perencanaan pembuatan **Content Management System (CMS)** untuk blog teknologi dan hobi. Dokumen-dokumen ini disusun untuk memudahkan koordinasi antara **Tim Manajemen**, **Tim Penulis/Editor**, dan **Tim Pengembang (Engineer)**.

---

## Daftar Panduan & Dokumen Perencanaan

| No | Dokumen | Target Pembaca | Ringkasan Isi |
| :---: | :--- | :--- | :--- |
| **01** | [**01_EXECUTIVE_SUMMARY_AND_PRD.md**](./01_EXECUTIVE_SUMMARY_AND_PRD.md) | Tim Manajemen, Sponsor, & Lead | Visi produk, sasaran bisnis, KPI, batasan MVP, dan matriks hak akses pengguna. |
| **02** | [**02_EDITORIAL_WORKFLOW_AND_GUIDE.md**](./02_EDITORIAL_WORKFLOW_AND_GUIDE.md) | Tim Editor & Penulis Artikel | Alur kerja penerbitan mandiri (*Direct Publish*), panduan blok editor (kode, callout, media), serta standar metadata SEO. |
| **03** | [**03_SYSTEM_ARCHITECTURE_AND_DESIGN.md**](./03_SYSTEM_ARCHITECTURE_AND_DESIGN.md) | Tim Engineer & Manajemen Teknis | Diagram arsitektur Headless (Strapi + Next.js), skema database PostgreSQL, strategi caching (ISR), dan spesifikasi API. |
| **04** | [**04_PROJECT_ROADMAP_AND_TIMELINE.md**](./04_PROJECT_ROADMAP_AND_TIMELINE.md) | Tim Manajemen & Eksekusi | Jadwal sprint (4 minggu), backlog tugas tiap tahap, matriks tanggung jawab RACI, dan kriteria kelayakan rilis MVP. |

---

## Ringkasan Spesifikasi Kunci Proyek

* **Model Arsitektur**: Headless CMS terpisah (Strapi v4/v5) + Frontend publik modern (Next.js App Router / Astro).
* **Runtime & Package Manager**: **Bun 1.x** (performa instalasi dependensi dan eksekusi koding ultra-cepat).
* **Basis Data & Media**: PostgreSQL 15+ dan Cloud Storage (Cloudinary / S3 / Cloudflare R2).
* **Alur Editorial**: *Direct Publish* — penulis dapat membuat draf dan mempublikasikan artikel secara mandiri, lengkap dengan editor blok khusus (blok kode bersintaks, callout, upload gambar, embed URL gambar, serta embed video YouTube/Vimeo).
* **Fitur Utama Pembaca**: *Clean Reader Mode* — pencarian cepat, filter taksonomi (kategori & tag), daftar isi otomatis (*auto-TOC*), pemutar video responsif lazy-load, sintaks koding berwarna dengan tombol salin, dan dukungan Dark/Light mode.
* **Strategi Deployment**: Multi-container Docker Compose di server pribadi (Postgres, Strapi, Next.js) dengan akses publik via **Cloudflare Tunnel** (*Zero Inbound Open Ports* & auto SSL).
