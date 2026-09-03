import { motion } from "framer-motion";
import { clsx } from "clsx";

function PulseBlock({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.45 }}
      animate={{ opacity: [0.35, 0.75, 0.35] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={clsx("rounded-md bg-gray-200 dark:bg-[#6B6188]/50", className)}
    />
  );
}

export default function SkeletonAtsResult() {
  return (
    <div className="w-full bg-white dark:bg-transparent">
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[338px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#4B4263] dark:bg-secondary">
          {/* Score Circle */}
          <div className="flex justify-center py-2">
            <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border-[16px] border-gray-200 dark:border-[#514965]">
              <PulseBlock className="absolute -top-[16px] left-1/2 h-[16px] w-[70px] -translate-x-1/2 rounded-full" />

              <PulseBlock className="h-12 w-12 rounded-full" />
            </div>
          </div>

          {/* Upload Button */}
          <PulseBlock className="mt-6 h-10 w-full rounded-none" />

          {/* Progress Items */}
          <div className="mt-8 space-y-6">
            {/* Progress 1 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <PulseBlock className="h-4 w-24" />
                <PulseBlock className="h-3 w-20" />
              </div>

              <PulseBlock className="h-4 w-full rounded-full" />
            </div>

            {/* Progress 2 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <PulseBlock className="h-4 w-20" />
                <PulseBlock className="h-3 w-16" />
              </div>

              <PulseBlock className="h-4 w-full rounded-full" />
            </div>

            {/* Progress 3 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <PulseBlock className="h-4 w-20" />
                <PulseBlock className="h-3 w-16" />
              </div>

              <PulseBlock className="h-4 w-full rounded-full" />
            </div>

            {/* Progress 4 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <PulseBlock className="h-4 w-24" />
                <PulseBlock className="h-3 w-16" />
              </div>

              <PulseBlock className="h-4 w-full rounded-full" />
            </div>

            {/* Progress 5 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <PulseBlock className="h-4 w-20" />
                <PulseBlock className="h-3 w-20" />
              </div>

              <PulseBlock className="h-4 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#4B4263] dark:bg-secondary">
          {/* Section Header */}
          <div className="mb-4">
            <PulseBlock className="mb-2 h-5 w-32" />
            <PulseBlock className="h-3 w-48" />
          </div>

          {/* Report Rows */}
          <div className="space-y-3">
            {/* Row 1 */}
            <div className="grid min-h-[116px] grid-cols-1 border border-gray-200 dark:border-[#433A59] md:grid-cols-[255px_minmax(0,1fr)]">
              <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-[#433A59] dark:bg-[#302741] md:border-b-0 md:border-r">
                <PulseBlock className="h-5 w-36" />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-full max-w-[650px]" />
                </div>

                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-4/5" />
                </div>

                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-3/5" />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid min-h-[150px] grid-cols-1 border border-gray-200 dark:border-[#433A59] md:grid-cols-[255px_minmax(0,1fr)]">
              <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-[#433A59] dark:bg-[#302741] md:border-b-0 md:border-r">
                <PulseBlock className="h-5 w-32" />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-full max-w-[680px]" />
                </div>

                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-4/5" />
                </div>

                <div className="flex items-start gap-3">
                  <PulseBlock className="mt-0.5 h-5 w-5 rounded-full" />
                  <PulseBlock className="h-4 w-3/5" />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid min-h-[70px] grid-cols-1 border border-gray-200 dark:border-[#433A59] md:grid-cols-[255px_minmax(0,1fr)]">
              <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-[#433A59] dark:bg-[#302741] md:border-b-0 md:border-r">
                <PulseBlock className="h-5 w-32" />
              </div>

              <div className="flex items-center gap-3 p-5">
                <PulseBlock className="h-5 w-5 rounded-full" />
                <PulseBlock className="h-4 w-full max-w-[650px]" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid min-h-[70px] grid-cols-1 border border-gray-200 dark:border-[#433A59] md:grid-cols-[255px_minmax(0,1fr)]">
              <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-[#433A59] dark:bg-[#302741] md:border-b-0 md:border-r">
                <PulseBlock className="h-5 w-28" />
              </div>

              <div className="flex items-center gap-3 p-5">
                <PulseBlock className="h-5 w-5 rounded-full" />
                <PulseBlock className="h-4 w-4/5" />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid min-h-[70px] grid-cols-1 border border-gray-200 dark:border-[#433A59] md:grid-cols-[255px_minmax(0,1fr)]">
              <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-[#433A59] dark:bg-[#302741] md:border-b-0 md:border-r">
                <PulseBlock className="h-5 w-32" />
              </div>

              <div className="flex items-center gap-3 p-5">
                <PulseBlock className="h-5 w-5 rounded-full" />
                <PulseBlock className="h-4 w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
