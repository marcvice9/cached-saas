import { listCategories } from "@/lib/actions/categories";
import { getPlanInfo } from "@/lib/actions/billing";
import CategoryManager from "@/components/app/CategoryManager";

export default async function CategoriesPage() {
  const [categories, planInfo] = await Promise.all([
    listCategories(false),
    getPlanInfo(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Organize your content into learning topics
        </p>
      </div>

      <CategoryManager initialCategories={categories} plan={planInfo.plan} />
    </div>
  );
}
