
import { Check, X } from "lucide-react";
import Wrapper from "../Wrapper";

const rows = [
  { feature: "ATS scan + builder in one", us: true, others: false },
  { feature: "Deterministic, explainable score", us: true, others: false },
  { feature: "7 free AI scans daily", us: true, others: false },
  { feature: "Truthful AI (no hallucination)", us: true, others: false },
  { feature: "100% ATS formatting", us: true, others: false },
  { feature: "No credit card to start", us: true, others: false },
];

export default function ComparisonSection() {
  return (
    <section className="font-plex bg-white dark:bg-stone-950 py-14 md:py-16 lg:py-14 xl:py-16 2xl:py-20">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700">
            Comparison
          </span> */}
          <h2 className="font-fraunces text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
            Why CVScan over others?
          </h2>
        </div>

        <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-stone-900 dark:bg-stone-800 text-xs md:text-sm font-semibold text-stone-50">
            <span>Feature</span>
            <span className="text-center text-lime-300">CVScan</span>
            <span className="text-center text-stone-400">Others</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 gap-4 px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 items-center"
            >
              <span className="text-xs md:text-sm text-stone-700 dark:text-stone-300">{row.feature}</span>
              <span className="flex justify-center">
                {row.us ? (
                  <Check className="w-5 h-5 text-stone-900 dark:text-lime-300" />
                ) : (
                  <X className="w-5 h-5 text-stone-300 dark:text-stone-700" />
                )}
              </span>
              <span className="flex justify-center">
                {row.others ? (
                  <Check className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                ) : (
                  <X className="w-5 h-5 text-stone-300 dark:text-stone-700" />
                )}
              </span>
            </div>
          ))}
        </div>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </section>
  );
}