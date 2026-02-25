import { listVaultSummaries } from "@/lib/actions/ai";
import { listCategories } from "@/lib/actions/categories";
import VaultExplorer from "@/components/app/VaultExplorer";

export default async function VaultPage() {
  const [summaries, categories] = await Promise.all([
    listVaultSummaries(),
    listCategories(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">The Knowledge Journal</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Read your AI summaries as clean journal pages.
        </p>
      </div>

      <VaultExplorer initialSummaries={summaries} categories={categories} />
    </div>
  );
}
