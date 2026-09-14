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
    <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-secondary/20 border-y border-gray-100 dark:border-gray-800">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-cyan-700 border border-cyan-200 dark:bg-gray-800 dark:text-cyan-300 dark:border-cyan-500/20">
            Comparison
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Why CVScan over others?
          </h2>
        </div>

        <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-secondary">
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-900 dark:bg-gray-800 text-xs md:text-sm font-semibold text-white">
            <span>Feature</span>
            <span className="text-center text-cyan-300">CVScan</span>
            <span className="text-center text-gray-400">Others</span>
          </div>
          {rows.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 gap-4 px-6 py-3.5 border-t border-gray-100 dark:border-gray-700 items-center">
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{row.feature}</span>
              <span className="flex justify-center">
                {row.us ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-gray-300" />}
              </span>
              <span className="flex justify-center">
                {row.others ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-400" />}
              </span>
            </div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}
