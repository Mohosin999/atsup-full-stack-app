// import { motion } from "framer-motion";
// import { clsx } from "clsx";

// interface LoadingSpinnerProps {
//   size?: "sm" | "md" | "lg";
//   fullScreen?: boolean;
//   className?: string;
//   text?: string;
// }

// const sizeMap = {
//   sm: { img: "w-8 h-8", text: "text-xs" },
//   md: { img: "w-12 h-12", text: "text-sm" },
//   lg: { img: "w-16 h-16", text: "text-base" },
// };

// export default function LoadingSpinner({
//   size = "md",
//   fullScreen,
//   className,
//   text,
// }: LoadingSpinnerProps) {
//   const s = sizeMap[size];

//   const spinner = (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.8 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className={clsx(
//         "flex flex-col items-center justify-center gap-3",
//         className,
//       )}
//     >
//       <motion.img
//         src="/favicon.png"
//         alt="Loading"
//         className={clsx(s.img, "object-contain")}
//         animate={{ rotate: 360 }}
//         transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
//       />
//       {text && (
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//           className={clsx("text-gray-500 font-medium", s.text)}
//         >
//           {text}
//         </motion.p>
//       )}
//     </motion.div>
//   );

//   if (fullScreen) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
//       >
//         {spinner}
//       </motion.div>
//     );
//   }

//   return spinner;
// }

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
  text?: string;
  variant?: "default" | "premium" | "minimal";
}

const sizeMap = {
  sm: { img: "w-8 h-8", ring: "w-12 h-12", text: "text-xs" },
  md: { img: "w-12 h-12", ring: "w-16 h-16", text: "text-sm" },
  lg: { img: "w-16 h-16", ring: "w-24 h-24", text: "text-base" },
};

export default function LoadingSpinner({
  size = "md",
  fullScreen,
  className,
  text,
  variant = "premium",
}: LoadingSpinnerProps) {
  const s = sizeMap[size];

  const spinner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring with gradient */}
        <motion.div
          className={clsx(s.ring, "absolute rounded-full")}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, #6366f1 25%, #8b5cf6 50%, transparent 75%)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Glow effect */}
        <motion.div
          className={clsx(s.img, "absolute rounded-full blur-xl opacity-50")}
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo with subtle pulse */}
        <motion.img
          src="/favicon.png"
          alt="Loading"
          className={clsx(s.img, "object-contain relative z-10")}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(99,102,241,0.3))",
          }}
        />
      </div>

      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-1"
        >
          <motion.p
            className={clsx("text-gray-600 font-medium", s.text)}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
          {/* Animated dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 bg-indigo-500 rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
}
