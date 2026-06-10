import { CircleAlert } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-[#241124] px-3 py-2 text-[#fff8ec]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-black uppercase tracking-wide">
        <CircleAlert size={15} />
        Demo mode: FC quote flow, no real payments locally
      </div>
    </div>
  );
}
