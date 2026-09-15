import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Wrapper from "../Wrapper";

const faqs = [
  { q: "What is ATS and why does my resume need to pass it?", a: "Applicant Tracking System — software recruiters use to filter resumes. ~75% get rejected before a human sees them, usually due to formatting or missing keywords. We score and fix both." },
  { q: "Why PDF only and 5MB limit?", a: "ATS parses PDF most reliably. 5MB keeps extraction fast and Gemini cost low. Scanned image PDFs won't work — use a text-based PDF." },
  { q: "How do credits work?", a: "7 AI credits per day, free forever. Each ATS scan, rescan, or AI rewrite costs 1. Resets daily at 4 PM BST (Asia/Dhaka). Admins are unlimited." },
  { q: "Is there a limit on saved resumes/scans?", a: "No. Save unlimited resumes and ATS scans — all are kept in your history, no auto-delete." },
  { q: "Does AI rewrite invent experience?", a: "Never. It rephrases your real experience and weaves JD keywords naturally. We promise truthful output — nothing hallucinated." },
  { q: "Do I need a credit card?", a: "No. Free tier is fully functional. Paid Pro (15/day) and Enterprise (35/day) are coming soon." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
            FAQ
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">Got questions? We got answers.</h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-secondary">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <p className="px-6 pb-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}
