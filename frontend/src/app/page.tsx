import { getArticles, getCategories, getTags } from "@/lib/strapi";
import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "Logikanya.tech — Blog Wawasan Logika, Kode & Teknologi",
  description:
    "Artikel, tutorial pemrograman, eksplorasi teknologi, dan catatan rekayasa perangkat lunak.",
};

export default async function HomePage() {
  const [articles, categories, tags] = await Promise.all([
    getArticles(),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="py-8">
      <HomeClient
        initialArticles={articles}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
