// import React from "react";
// import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

// interface SuggestionListProps {
//   suggestions: string[];
//   title?: string;
//   type?: "suggestion" | "warning" | "success";
// }

// const SuggestionList: React.FC<SuggestionListProps> = ({
//   suggestions,
//   title = "Suggestions",
//   type = "suggestion",
// }) => {
//   const getIcon = () => {
//     switch (type) {
//       case "warning":
//         return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
//       case "success":
//         return <CheckCircle className="w-5 h-5 text-cyan-500" />;
//       default:
//         return <Lightbulb className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getBorderColor = () => {
//     switch (type) {
//       case "warning":
//         return "border-yellow-500";
//       case "success":
//         return "border-cyan-500";
//       default:
//         return "border-blue-500";
//     }
//   };

//   if (!suggestions || suggestions.length === 0) {
//     return null;
//   }

//   return (
//     <div
//       className={`border-l-4 ${getBorderColor()} bg-gray-50 dark:bg-secondary p-4`}
//     >
     
//       <ul className="space-y-2">
//         {suggestions.map((suggestion, idx) => (
//           <li
//             key={idx}
//             className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
//           >
//             <span className="text-blue-500 flex-shrink-0 text-lg leading-5">
//               •
//             </span>
//             <span className="flex-1">{suggestion}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SuggestionList;

import React from "react";
import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

interface SuggestionListProps {
  suggestions: string[];
  title?: string;
  type?: "suggestion" | "warning" | "success";
}

const TYPE_META: Record<
  "suggestion" | "warning" | "success",
  { icon: React.ReactNode; badge: string; bullet: string }
> = {
  suggestion: {
    icon: <Lightbulb className="w-4 h-4" />,
    badge: "bg-lime-300/70 dark:bg-lime-400/20 text-stone-900 dark:text-lime-300",
    bullet: "text-stone-900 dark:text-lime-300",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bullet: "text-amber-500 dark:text-amber-400",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bullet: "text-emerald-600 dark:text-emerald-400",
  },
};

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  title = "Suggestions",
  type = "suggestion",
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const meta = TYPE_META[type];

  return (
    <div className="font-plex border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${meta.badge}`}
        >
          {meta.icon}
        </div>
        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          {title}
        </h4>
      </div>

      <ul className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300"
          >
            <span
              className={`flex-shrink-0 text-lg leading-5 ${meta.bullet}`}
            >
              •
            </span>
            <span className="flex-1">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionList;