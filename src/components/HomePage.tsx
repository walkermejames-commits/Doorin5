import { ArrowRight, BadgeCheck, Bike, ClipboardList, MapPin, PackageCheck, Route, Sparkles } from "lucide-react";
import Link from "next/link";
import { serviceAreas } from "../lib/local-delivery";
import { ActionButton } from "./ui/ActionButton";
import { SectionCard } from "./ui/SectionCard";

const flow = [
  { title: "Tell us what you need", copy: "Shop, items, notes, urgency and dropoff details.", icon: ClipboardList },
  { title: "FC prices it", copy: "A human checks distance, stock risk, service fee and item cost.", icon: PackageCheck },
  { title: "You approve", copy: "No payment is taken until you accept the quote.", icon: Sparkles },
  { title: "Driver handles it", copy: "Paid jobs move to dispatch, driver progress and tracking.", icon: Bike },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-[#241124]">
      <section className="relative isolate overflow-hidden">
        <img src="/pantiles-hero.jpg" alt="The Pantiles in Royal Tunbridge Wells" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#241124]/92 via-[#3a1737]/72 to-[#0f6b4f]/24" />

        <div className="relative mx-auto flex min-h-[74vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl pb-5">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ec]/14 px-4 py-2 text-sm font-black uppercase text-[#f1c979] ring-1 ring-white/20">
              <MapPin size={16} />
              Tunbridge Wells concierge delivery
            </p>
            <h1 className="text-5xl font-black leading-tight text-[#fff8ec] sm:text-6xl lg:text-7xl">Doorin5</h1>
            <p className="mt-4 text-2xl font-black text-[#f1c979]">Local errands, properly handled.</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#f8ead5] sm:text-xl sm:leading-8">
              Tell us what you need. FC prices it. You approve before paying.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionButton href="/order" tone="secondary" className="text-[#241124]">
                Start a request <ArrowRight size={18} />
              </ActionButton>
              <ActionButton href="/quote/demo-1001" tone="ghost" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                View demo quote <Sparkles size={18} />
              </ActionButton>
            </div>
          </div>

          <div className="grid max-w-5xl gap-3 sm:grid-cols-3">
            {["No instant surprise charges", "FC-led quote approval", "Paid jobs only reach drivers"].map((signal) => (
              <div key={signal} className="rounded-2xl border border-white/16 bg-white/12 p-4 font-black text-[#fff8ec] backdrop-blur">
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {flow.map((item) => (
            <SectionCard key={item.title}>
              <item.icon className="text-[#0f6b4f]" size={24} />
              <h2 className="mt-4 text-xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#726456]">{item.copy}</p>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="border-y border-[#eadfce] bg-[#241124] text-[#fff8ec]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#f1c979]">Local coverage</p>
            <h2 className="mt-2 text-3xl font-black">Serving Tunbridge Wells, Southborough, Rusthall, Pembury and nearby.</h2>
            <p className="mt-4 leading-7 text-[#f8ead5]">
              The app is built around careful FC judgement: realistic item costs, clear delivery fees, age checks and friendly quote notes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceAreas.map((area) => (
              <div key={area} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                <BadgeCheck className="text-[#f1c979]" size={20} />
                <span className="font-bold">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <SectionCard title="Show the FC workflow" intro="Perfect for demoing the control centre and quote builder.">
          <ActionButton href="/fc" tone="dark">
            Open FC board <PackageCheck size={18} />
          </ActionButton>
        </SectionCard>
        <SectionCard title="Show live customer tracking" intro="A paid assigned demo job is ready at demo-1002.">
          <ActionButton href="/track/demo-1002" tone="primary">
            Track demo order <Route size={18} />
          </ActionButton>
        </SectionCard>
      </section>
    </main>
  );
}
