import { listContent } from "@/lib/actions/content";
import { listCategories } from "@/lib/actions/categories";
import { getPlanInfo } from "@/lib/actions/billing";
import SaveUrlForm from "@/components/app/SaveUrlForm";
import ContentList from "@/components/app/ContentList";
import CategoryManager from "@/components/app/CategoryManager";

export default async function LibraryPage() {
  const [content, categories, planInfo] = await Promise.all([
    listContent(),
    listCategories(false),
    getPlanInfo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">The Archive Folder</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Paper-slip organization for everything you save.
        </p>
      </div>

      <SaveUrlForm
        categories={categories.filter((c) => c.is_active).map((c) => ({ id: c.id, name: c.name }))}
      />

      <section className="rounded-3xl border border-white/10 bg-[#202327] p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Categories</h2>
          <p className="mt-1 text-sm text-zinc-400">Create and manage categories without leaving Library.</p>
        </div>
        <CategoryManager initialCategories={categories} plan={planInfo.plan} />
      </section>

      <ContentList initialContent={content} />
    </div>
  );
}
