import { GripVertical, Download, Save, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Wrapper from "../Wrapper";

const sections = ["Profile Info", "Summary", "Experience", "Skills", "Education", "Projects"];

export default function BuilderPreview() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-secondary/20 border-y border-gray-100 dark:border-gray-800">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
          <div className="order-2 lg:order-1 relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Drag to reorder</span>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">Auto-saved 2s ago</span>
              </div>
              <div className="space-y-2">
                {sections.map((s) => (
                  <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{s}</span>
                    <Eye className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <span className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 text-white text-xs md:text-sm font-semibold">
                  <Download className="w-4 h-4" /> Download PDF
                </span>
                <span className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Save className="w-4 h-4" /> Saved
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
              ATS Resume Builder
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Build once. Pass every ATS.
            </h2>
            <p className="mt-4 text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Single-column, no tables/images/icons, standard fonts — validated 100% on Jobscan & Enhancv. Drag to reorder, edit any section title, export PDF in one click.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-cyan-600">✓</span> Live preview as you type</li>
              <li className="flex gap-2"><span className="text-cyan-600">✓</span> Auto-save every 2s — never lose work</li>
              <li className="flex gap-2"><span className="text-cyan-600">✓</span> 5 saves max — oldest auto-rotates with confirm</li>
            </ul>
            <Link
              to="/resume-builder"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Open Builder
            </Link>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
