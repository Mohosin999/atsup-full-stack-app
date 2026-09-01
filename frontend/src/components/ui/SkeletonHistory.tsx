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
      className={clsx("rounded-md bg-[#6B6188]/50", className)}
    />
  );
}

export default function SkeletonHistory() {
  return (
    <div className="w-full">
      <div className="w-full overflow-hidden rounded-xl border dark:border-[#4B4263] dark:bg-secondary">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center bg-[#ADD8FC] dark:bg-[#5D5475] px-5 py-4">
          <PulseBlock className="h-4 w-16 bg-[#8C82A5]" />
          <PulseBlock className="h-4 w-12 bg-[#8C82A5]" />
          <PulseBlock className="h-4 w-20 bg-[#8C82A5]" />
          <PulseBlock className="ml-auto h-4 w-8 bg-[#8C82A5]" />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t dark:border-[#4B4263] px-5 py-7">
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
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t border-gray-300 dark:border-[#4B4263] px-5 py-7">
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
        <div className="grid grid-cols-[2.5fr_1fr_1.3fr_80px] items-center border-t border-gray-300 dark:border-[#4B4263] px-5 py-7">
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
