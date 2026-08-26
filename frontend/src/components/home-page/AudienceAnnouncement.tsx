import { motion } from "framer-motion";
import { Code2, Brain, Info } from "lucide-react";

export default function AudienceAnnouncement() {
  return (
    <section className="pb-10 lg:pb-14">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          {/* top hairline - solid, no gradient */}
          <div className="h-px w-full bg-slate-200" />

          <div className="px-6 py-6 lg:px-8 lg:py-7">
            {/* header row: label + badge */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ANNOUNCEMENT
                  </span>
                  <span className="h-3 w-px bg-slate-200 hidden sm:block" />
                  <span className="text-xs font-semibold tracking-wide text-slate-500">
                    Who is this for?
                  </span>
                </div>

                <h3 className="text-[22px] lg:text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                  This platform is built for{" "}
                  <span className="underline decoration-slate-300 decoration-2 underline-offset-4">
                    Software Engineers
                  </span>{" "}
                  <span className="font-normal text-slate-400 mx-1">&</span>{" "}
                  <span className="underline decoration-slate-300 decoration-2 underline-offset-4">
                    AI Engineers
                  </span>
                </h3>

                <p className="mt-2.5 max-w-2xl text-sm lg:text-[15px] leading-relaxed text-slate-600">
                  Currently ATS scoring, feedback and resume optimization are
                  <span className="font-semibold text-slate-900"> fully tailored for these two roles</span> — trained on real tech job descriptions. Other roles will be supported soon.
                </p>
              </div>

              {/* right premium cards - solid */}
              <div className="flex gap-3 lg:flex-col lg:w-[220px] shrink-0">
                <div className="flex flex-1 lg:flex-none items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Code2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-none text-slate-900">Software Engineer</p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">● Live & optimized</p>
                  </div>
                </div>

                <div className="flex flex-1 lg:flex-none items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Brain className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-none text-slate-900">AI Engineer</p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">● Live & optimized</p>
                  </div>
                </div>
              </div>
            </div>

            {/* footer note - premium minimal */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700">
                <Info className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs lg:text-sm leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">Not in these roles?</span> You can still use ATSUp — you’ll get a solid generic ATS score. Role-specific insights are coming soon for Data, Product, Design & more.
              </p>
              <span className="hidden lg:inline-flex ml-auto shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold tracking-wide text-slate-700">
                MORE ROLES SOON
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
