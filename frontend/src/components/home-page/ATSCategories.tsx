import { Search, Code2, MessageCircle, ClipboardCheck, FileType } from "lucide-react";
import Wrapper from "../Wrapper";

const categories = [
  { icon: Search, label: "Searchability", weight: "30%", desc: "Job title match, detectable structure" },
  { icon: Code2, label: "Hard Skills", weight: "35%", desc: "Missing skills, variant-aware matching" },
  { icon: MessageCircle, label: "Soft Skills", weight: "15%", desc: "Communication, leadership coverage" },
  { icon: ClipboardCheck, label: "Recruiter Tips", weight: "10%", desc: "Summary length, measurable results, action verbs" },
  { icon: FileType, label: "Formatting", weight: "10%", desc: "Single-column, standard font, no tables/images" },
];

export default function ATSCategories() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-secondary/20 border-y border-gray-100 dark:border-gray-800">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-cyan-700 border border-cyan-200 dark:bg-gray-800 dark:text-cyan-300 dark:border-cyan-500/20">
            Transparent Scoring
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Not a black-box score. 5 categories, fully explainable.
          </h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AI structures your resume & JD — scoring is deterministic and repeatable. Know exactly what to fix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <cat.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-600 text-white">
                {cat.weight}
              </span>
              <h3 className="mt-3 text-sm xl:text-base font-semibold text-gray-900 dark:text-gray-100">
                {cat.label}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          Overall score 0–100 • Contact 50+40+10 pts • Measurable results need 5+ • Summary ≥30 words
        </p>
      </Wrapper>
    </section>
  );
}
