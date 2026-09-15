// import { GripVertical, Download, Save, Eye } from "lucide-react";
// import { Link } from "react-router-dom";
// import Wrapper from "../Wrapper";

// const sections = ["Profile Info", "Summary", "Experience", "Skills", "Education", "Projects"];

// export default function BuilderPreview() {
//   return (
//     <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-secondary/20 border-y border-gray-100 dark:border-gray-800">
//       <Wrapper>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
//           <div className="order-2 lg:order-1 relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
//             <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600" />
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Drag to reorder</span>
//                 <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">Auto-saved 2s ago</span>
//               </div>
//               <div className="space-y-2">
//                 {sections.map((s) => (
//                   <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
//                     <GripVertical className="w-4 h-4 text-gray-400" />
//                     <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{s}</span>
//                     <Eye className="w-3.5 h-3.5 text-gray-400 ml-auto" />
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-6 flex gap-3">
//                 <span className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 text-white text-xs md:text-sm font-semibold">
//                   <Download className="w-4 h-4" /> Download PDF
//                 </span>
//                 <span className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
//                   <Save className="w-4 h-4" /> Saved
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="order-1 lg:order-2">
//             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
//               ATS Resume Builder
//             </span>
//             <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
//               Build once. Pass every ATS.
//             </h2>
//             <p className="mt-4 text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
//               Single-column, no tables/images/icons, standard fonts — validated 100% on Jobscan & Enhancv. Drag to reorder, edit any section title, export PDF in one click.
//             </p>
//             <ul className="mt-6 space-y-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400">
//               <li className="flex gap-2"><span className="text-cyan-600">✓</span> Live preview as you type</li>
//               <li className="flex gap-2"><span className="text-cyan-600">✓</span> Auto-save every 2s — never lose work</li>
//               <li className="flex gap-2"><span className="text-cyan-600">✓</span> Unlimited saves — all resumes kept</li>
//             </ul>
//             <Link
//               to="/resume-builder"
//               className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-500/20 transition-all"
//             >
//               Open Builder
//             </Link>
//           </div>
//         </div>
//       </Wrapper>
//     </section>
//   );
// }

import { GripVertical, Download, Save, Eye, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Wrapper from "../Wrapper";

const sections = [
  "Profile Info",
  "Summary",
  "Experience",
  "Skills",
  "Education",
  "Projects",
];

export default function BuilderPreview() {
  return (
    <section className="font-plex py-16 md:py-20 lg:py-24 bg-white dark:bg-stone-950 border-y border-stone-200 dark:border-stone-800">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
          <div className="order-2 lg:order-1 relative bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-amber-400 dark:bg-amber-300" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Drag to reorder
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Auto-saved 2s ago
                </span>
              </div>

              <div className="space-y-2">
                {sections.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40"
                  >
                    <GripVertical className="w-4 h-4 text-stone-400" />
                    <span className="text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300">
                      {s}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-stone-400 ml-auto" />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <span className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 text-xs md:text-sm font-semibold">
                  <Download className="w-4 h-4" /> Download PDF
                </span>
                <span className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300">
                  <Save className="w-4 h-4" /> Saved
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20">
              ATS resume builder
            </span>

            <h2 className="font-fraunces mt-4 text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50 leading-tight">
              Build once. Pass{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">every ATS</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
              .
            </h2>

            <p className="mt-4 text-xs md:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Single-column, no tables, images or icons, standard fonts —
              validated 100% on Jobscan and Enhancv. Drag to reorder, edit any
              section title, export a PDF in one click.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs md:text-sm text-stone-600 dark:text-stone-400">
              {[
                "Live preview as you type",
                "Auto-save every 2s — never lose work",
                "Unlimited saves — all resumes kept",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-amber-700 dark:text-amber-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/resume-builder"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs md:text-sm font-semibold bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
            >
              Open builder
            </Link>
          </div>
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
