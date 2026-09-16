import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Wrapper from "../Wrapper";

const faqs = [
  {
    q: "What is ATS and why does my resume need to pass it?",
    a: "Applicant Tracking System — software recruiters use to filter resumes. About 75% get rejected before a human sees them, usually due to formatting or missing keywords. We score and fix both.",
  },
  {
    q: "Why PDF only and a 5MB limit?",
    a: "ATS parses PDF most reliably. 5MB keeps extraction fast and Gemini cost low. Scanned image PDFs won't work — use a text-based PDF.",
  },
  {
    q: "How do credits work?",
    a: "7 AI credits per day, free forever. Each ATS scan, rescan, or AI rewrite costs 1. Resets daily at 4 PM BST (Asia/Dhaka). Admins are unlimited.",
  },
  {
    q: "Is there a limit on saved resumes or scans?",
    a: "No. Save unlimited resumes and ATS scans — all are kept in your history, with no auto-delete.",
  },
  {
    q: "Does AI rewrite invent experience?",
    a: "Never. It rephrases your real experience and weaves JD keywords in naturally. We promise truthful output — nothing hallucinated.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. The free tier is fully functional. Paid Pro (15/day) and Enterprise (35/day) are coming soon.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="font-plex bg-white dark:bg-stone-950 pb-14 md:pb-16 lg:pb-14 xl:pb-16 2xl:pb-20">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-stone-700 border border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700">
            FAQ
          </span> */}
          <h2 className="font-fraunces text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
            Got questions? We've got answers.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="relative">
                {isOpen && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-lime-300" />
                )}
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-xs md:text-sm font-semibold transition-colors ${
                      isOpen
                        ? "text-stone-900 dark:text-stone-50"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-4 text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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
