// import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
// import { clsx } from 'clsx';

// interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   error?: string;
//   icon?: React.ReactNode;
// }

// export const Input = forwardRef<HTMLInputElement, InputProps>(
//   ({ className, label, error, icon, ...props }, ref) => {
//     return (
//       <div className="w-full">
//         {label && (
//           <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {label}
//           </label>
//         )}
//         <div className="relative">
//           {icon && (
//             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
//               {icon}
//             </div>
//           )}
//           <input
//             ref={ref}
//             className={clsx(
//               'w-full px-4 py-2 lg:py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-primary text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs rounded-md',
//               icon && 'pl-8',
//               error && 'border-red-500 focus:ring-red-500',
//               className
//             )}
//             {...props}
//           />
//         </div>
//         {error && (
//           <p className="mt-1 text-sm text-red-500">{error}</p>
//         )}
//       </div>
//     );
//   }
// );

// Input.displayName = 'Input';

// interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
//   label?: string;
//   error?: string;
// }

// export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ className, label, error, ...props }, ref) => {
//     return (
//         <div className="w-full mt-2">
//           {label && (
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {label}
//           </label>
//         )}
//         <textarea
//           ref={ref}
//           className={clsx(
//             'w-full text-xs px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-primary text-gray-700 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none leading-5',
//             error && 'border-red-500 focus:ring-red-500',
//             className
//           )}
//           {...props}
//         />
//         {error && (
//           <p className="mt-1 text-xs text-red-500">{error}</p>
//         )}
//       </div>
//     );
//   }
// );

// Textarea.displayName = 'Textarea';

// interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
//   label?: string;
//   error?: string;
//   options: { value: string; label: string }[];
// }

// export const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ className, label, error, options, ...props }, ref) => {
//     return (
//       <div className="w-full">
//         {label && (
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {label}
//           </label>
//         )}
//         <select
//           ref={ref}
//           className={clsx(
//             'w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
//             error && 'border-red-500 focus:ring-red-500',
//             className
//           )}
//           {...props}
//         >
//           {options.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//         {error && (
//           <p className="mt-1 text-sm text-red-500">{error}</p>
//         )}
//       </div>
//     );
//   }
// );

// Select.displayName = 'Select';

// interface DateRangeInputProps {
//   startDate?: string;
//   endDate?: string;
//   onStartChange?: (value: string) => void;
//   onEndChange?: (value: string) => void;
//   endDisabled?: boolean;
//   startPlaceholder?: string;
//   endPlaceholder?: string;
// }

// export const DateRangeInput = ({
//   startDate,
//   endDate,
//   onStartChange,
//   onEndChange,
//   endDisabled = false,
//   startPlaceholder = "e.g. Jan 2020",
//   endPlaceholder = "e.g. July 2025",
// }: DateRangeInputProps) => {
//   return (
//     <div className="grid grid-cols-2 gap-3">
//       <div>
//         <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//           Start Date
//         </label>
//         <input
//           type="text"
//           value={startDate || ""}
//           onChange={(e) => onStartChange?.(e.target.value)}
//           placeholder={startPlaceholder}
//           className="w-full px-3 py-2 lg:py-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-primary text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//         />
//       </div>
//       <div>
//         <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//           End Date
//         </label>
//         <input
//           type="text"
//           value={endDate || ""}
//           disabled={endDisabled}
//           onChange={(e) => onEndChange?.(e.target.value)}
//           placeholder={endPlaceholder}
//           className="w-full px-3 py-2 lg:py-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-primary text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
//         />
//       </div>
//     </div>
//   );
// };

// export default { Input, Textarea, Select, DateRangeInput };

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="font-plex w-full">
        {label && (
          <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-2 lg:py-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all text-xs md:text-sm rounded-lg',
              icon && 'pl-8',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="font-plex w-full mt-2">
        {label && (
          <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full text-xs md:text-sm px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/40 text-stone-700 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all resize-none leading-5 md:leading-6 rounded-lg',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs md:text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="font-plex w-full">
        {label && (
          <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all rounded-lg text-xs md:text-sm',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface DateRangeInputProps {
  startDate?: string;
  endDate?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  endDisabled?: boolean;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const DateRangeInput = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  endDisabled = false,
  startPlaceholder = "e.g. Jan 2020",
  endPlaceholder = "e.g. July 2025",
}: DateRangeInputProps) => {
  return (
    <div className="font-plex grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Start date
        </label>
        <input
          type="text"
          value={startDate || ""}
          onChange={(e) => onStartChange?.(e.target.value)}
          placeholder={startPlaceholder}
          className="w-full px-3 py-2 lg:py-3 text-xs md:text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          End date
        </label>
        <input
          type="text"
          value={endDate || ""}
          disabled={endDisabled}
          onChange={(e) => onEndChange?.(e.target.value)}
          placeholder={endPlaceholder}
          className="w-full px-3 py-2 lg:py-3 text-xs md:text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default { Input, Textarea, Select, DateRangeInput };