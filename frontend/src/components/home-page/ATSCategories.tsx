import {
  Search,
  Code2,
  MessageCircle,
  ClipboardCheck,
  FileType,
} from "lucide-react";
import Wrapper from "../Wrapper";

const categories = [
  {
    icon: Search,
    label: "Searchability",
    weight: 30,
    desc: "Job title match, detectable structure",
  },
  {
    icon: Code2,
    label: "Hard Skills",
    weight: 35,
    desc: "Missing skills, variant-aware matching",
  },
  {
    icon: MessageCircle,
    label: "Soft Skills",
    weight: 15,
    desc: "Communication, leadership coverage",
  },
  {
    icon: ClipboardCheck,
    label: "Recruiter Tips",
    weight: 10,
    desc: "Summary length, measurable results, action verbs",
  },
  {
    icon: FileType,
    label: "Formatting",
    weight: 10,
    desc: "Single-column, standard font, no tables or images",
  },
];

export default function ATSCategories() {
  return (
    <section className="font-plex bg-white dark:bg-stone-950 pb-14 md:pb-16 lg:pb-14 xl:pb-16 2xl:pb-20">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700">
            Transparent scoring
          </span> */}
          <h2 className="font-fraunces text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
            Not a black-box score. 5 categories, fully explainable.
          </h2>
          <p className="mt-3 text-xs md:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            AI structures your resume and the job description — scoring is
            deterministic and repeatable, so you know exactly what to fix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 text-center hover:border-lime-300 dark:hover:border-lime-400/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-100 dark:bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <cat.icon className="w-6 h-6 text-stone-800 dark:text-lime-300" />
              </div>

              <h3 className="text-sm xl:text-base font-semibold text-stone-900 dark:text-stone-100">
                {cat.label}
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed min-h-[2.5rem]">
                {cat.desc}
              </p>

              {/* weight, shown as its actual share of the score rather than a decorative badge */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">
                    Weight
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {cat.weight}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-lime-400 dark:bg-lime-300"
                    style={{ width: `${cat.weight}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          Overall score 0–100 · Contact 50+40+10 pts · Measurable results need
          5+ · Summary 30+ words
        </p>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </section>
  );
}
