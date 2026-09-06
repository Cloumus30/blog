import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DraftModeBanner from "@/components/DraftModeBanner";
import { getCategories } from "@/lib/strapi";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cloudias.my.id'),
  title: "Logikanya.tech — Wawasan Logika, Kode & Teknologi",
  description: "Platform publikasi artikel teknologi, tutorial coding, eksplorasi logika, dan catatan rekayasa perangkat lunak.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] dark:bg-[#2C303A] text-[#2C303A] dark:text-[#F8F9FA] transition-colors">
        <DraftModeBanner />
        <Navbar categories={categories} />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
