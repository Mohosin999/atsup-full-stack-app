import { motion } from "framer-motion";
import { clsx } from "clsx";

function PulseBlock({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={clsx(
        "rounded-lg bg-gray-200 dark:bg-gray-700",
        className,
      )}
    />
  );
}

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#2a2438] border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <PulseBlock className="h-8 w-28" />
          <div className="hidden md:flex items-center gap-6">
            <PulseBlock className="h-4 w-16" />
            <PulseBlock className="h-4 w-16" />
            <PulseBlock className="h-4 w-16" />
          </div>
          <PulseBlock className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        {/* Header area */}
        <div className="mb-8 pt-4">
          <PulseBlock className="h-7 w-64 mb-3" />
          <PulseBlock className="h-4 w-96 max-w-full" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <PulseBlock key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <PulseBlock key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <PulseBlock key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
