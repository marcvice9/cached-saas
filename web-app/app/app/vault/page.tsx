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
        <h1 className="text-2xl font-bold text-brand-dark">Learning Vault</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-generated summaries and takeaways from your consumed content
        </p>
      </div>

      <VaultExplorer initialSummaries={summaries} categories={categories} />
    </div>
  );
}
