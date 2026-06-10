import { CheckCircle2, Circle } from "lucide-react";

type TimelineStep = {
  status: string;
  label: string;
  done: boolean;
  active: boolean;
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div
          key={step.status}
          className={`flex items-center gap-3 rounded-2xl border p-4 ${
            step.active ? "border-[#0f6b4f] bg-[#e8f4ed]" : step.done ? "border-[#d8cdbd] bg-white" : "border-[#e7decf] bg-[#fffaf1] text-[#8a7a69]"
          }`}
        >
          <span className={`flex size-9 items-center justify-center rounded-full ${step.done ? "bg-[#0f6b4f] text-white" : "bg-[#eadfce] text-[#8a7a69]"}`}>
            {step.done ? <CheckCircle2 size={18} /> : <Circle size={16} />}
          </span>
          <div>
            <p className="font-black">{step.label}</p>
            {step.active && <p className="text-sm font-semibold text-[#0f6b4f]">Current step</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
