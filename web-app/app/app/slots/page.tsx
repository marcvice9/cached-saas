import { listSlots } from "@/lib/actions/slots";
import { listCategories } from "@/lib/actions/categories";
import SlotManager from "@/components/app/SlotManager";

export default async function SlotsPage() {
  const [slots, categories] = await Promise.all([
    listSlots(false),
    listCategories(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Learning Slots</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Define when you want to learn during the week
        </p>
      </div>

      <SlotManager initialSlots={slots} categories={categories} />
    </div>
  );
}
