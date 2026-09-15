// import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
// import { Link } from "react-router-dom";
// import Wrapper from "../Wrapper";

// export default function AIRewriteShowcase() {
//   return (
//     <section className="py-16 md:py-20 lg:py-24 xl:py-28">
//       <Wrapper>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
//           <div>
//             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
//               <Sparkles className="w-3.5 h-3.5" /> AI Rewrite
//             </span>
//             <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
//               Turn your resume into an{" "}
//               <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
//                 interview magnet
//               </span>
//             </h2>
//             <p className="mt-4 text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
//               Paste any job description — our AI weaves the right keywords into your real experience. Nothing invented, only better wording and focus.
//             </p>
//             <ul className="mt-6 space-y-3">
//               {[
//                 "Keywords from JD woven naturally",
//                 "Your experience stays 100% truthful",
//                 "Opens in builder — edit then export PDF",
//               ].map((item) => (
//                 <li key={item} className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
//                   <span className="w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
//                     <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-300" />
//                   </span>
//                   {item}
//                 </li>
//               ))}
//             </ul>
//             <Link
//               to="/resume-builder/upload"
//               className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 shadow-lg shadow-violet-500/20 transition-all"
//             >
//               Try AI Rewrite <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>

//           <div className="relative">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Before</p>
//                 <p className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-6">
//                   "Worked on React project. Helped team. Used JavaScript and CSS. Did some API work."
//                 </p>
//                 <span className="mt-3 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/10">Generic • Low match</span>
//               </div>
//               <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 rounded-2xl border border-violet-200 dark:border-violet-500/20 p-5">
//                 <p className="text-xs font-semibold text-violet-600 dark:text-violet-300 uppercase tracking-wider">After AI</p>
//                 <p className="mt-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-6">
//                   "Built responsive React.js SPA with TypeScript, integrated REST APIs, improved load time by 35% — aligning with JD's React, TypeScript, performance focus."
//                 </p>
//                 <span className="mt-3 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">Keyword-rich • 89% match</span>
//               </div>
//             </div>
//             <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">Example — real rewrite keeps your truth, changes the framing</p>
//           </div>
//         </div>
//       </Wrapper>
//     </section>
//   );
// }

import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Wrapper from "../Wrapper";

export default function AIRewriteShowcase() {
  return (
    <section className="font-plex py-16 md:py-20 lg:py-24 xl:py-28 bg-white dark:bg-stone-950">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20">
              <Sparkles className="w-3.5 h-3.5" /> AI rewrite
            </span>

            <h2 className="font-fraunces mt-4 text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50 leading-tight">
              Turn your resume into an{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">interview magnet</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </h2>

            <p className="mt-4 text-xs md:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Paste any job description — our AI weaves the right keywords into
              your real experience. Nothing invented, only better wording and
              focus.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Keywords from the JD woven naturally",
                "Your experience stays 100% truthful",
                "Opens in the builder — edit, then export as PDF",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-xs md:text-sm text-stone-700 dark:text-stone-300"
                >
                  <span className="w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-400/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/resume-builder/upload"
              className="group mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs md:text-sm font-semibold text-stone-50 dark:text-stone-900 bg-stone-900 dark:bg-lime-300 hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
            >
              Try AI rewrite
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
                <p className="text-xs font-semibold text-stone-400 dark:text-stone-500">
                  Before
                </p>
                <p className="mt-3 text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-6">
                  Worked on React project. Helped team. Used JavaScript and CSS.
                  Did some API work.
                </p>
                <span className="mt-3 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  Generic · low match
                </span>
              </div>

              <div className="bg-violet-50 dark:bg-violet-400/10 rounded-2xl border border-violet-200 dark:border-violet-400/20 p-5">
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                  After AI
                </p>
                <p className="mt-3 text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-6">
                  Built a responsive React.js SPA with TypeScript, integrated
                  REST APIs, and improved load time by 35% — aligned with the
                  JD's React, TypeScript and performance focus.
                </p>
                <span className="mt-3 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-lime-200 text-stone-800 dark:bg-lime-400/20 dark:text-lime-200">
                  Keyword-rich · 89% match
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-stone-400 dark:text-stone-500">
              Example — a real rewrite keeps your truth, and changes the framing
            </p>
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
