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
      className={clsx("rounded-md bg-stone-200 dark:bg-stone-700", className)}
    />
  );
}

export default function SkeletonHistory() {
  return (
    <div className="w-full">
      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center bg-stone-100 dark:bg-stone-800 px-5 py-4 border-b border-stone-200 dark:border-stone-800">
          <PulseBlock className="h-4 w-16" />
          <PulseBlock className="h-4 w-12" />
          <PulseBlock className="h-4 w-20" />
          <PulseBlock className="ml-auto h-4 w-8" />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t border-stone-100 dark:border-stone-800 px-5 py-7">
          <div className="flex items-center gap-3">
            <PulseBlock className="h-5 w-36" />
            <PulseBlock className="h-4 w-4 rounded-full" />
          </div>

          <PulseBlock className="h-5 w-10" />
          <PulseBlock className="h-5 w-32" />

          <div className="flex justify-end gap-4">
            <PulseBlock className="h-5 w-5 rounded-full" />
            <PulseBlock className="h-5 w-5 rounded-full" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t border-stone-100 dark:border-stone-800 px-5 py-7">
          <div className="flex items-center gap-3">
            <PulseBlock className="h-5 w-32" />
            <PulseBlock className="h-4 w-4 rounded-full" />
          </div>

          <PulseBlock className="h-5 w-10" />
          <PulseBlock className="h-5 w-32" />

          <div className="flex justify-end gap-4">
            <PulseBlock className="h-5 w-5 rounded-full" />
            <PulseBlock className="h-5 w-5 rounded-full" />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t border-stone-100 dark:border-stone-800 px-5 py-7">
          <div className="flex items-center gap-3">
            <PulseBlock className="h-5 w-40" />
            <PulseBlock className="h-4 w-4 rounded-full" />
          </div>

          <PulseBlock className="h-5 w-10" />
          <PulseBlock className="h-5 w-32" />

          <div className="flex justify-end gap-4">
            <PulseBlock className="h-5 w-5 rounded-full" />
            <PulseBlock className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
