import { getPlanInfo } from "@/lib/actions/billing";
import BillingPanel from "@/components/app/BillingPanel";

export default async function BillingPage() {
  const planInfo = await getPlanInfo();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your subscription and plan
        </p>
      </div>

      <BillingPanel planInfo={planInfo} />
    </div>
  );
}
