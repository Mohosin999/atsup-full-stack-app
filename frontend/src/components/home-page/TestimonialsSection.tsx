// import { Star } from "lucide-react";
// import Wrapper from "../Wrapper";

// interface Testimonial {
//   id?: string;
//   name: string;
//   role: string;
//   content: string;
//   rating: number;
// }

// interface TestimonialsSectionProps {
//   testimonials: Testimonial[];
// }

// export default function TestimonialsSection({
//   testimonials,
// }: TestimonialsSectionProps) {
//   const displayed = testimonials.slice(0, 6);

//   if (displayed.length === 0) {
//     return (
//       <section className="pb-20 lg:pb-20 xl:pb-28">
//         <Wrapper>
//           <div className="text-center mb-10 lg:mb-14">
//             <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
//               Loved by <span className="text-cyan-600">Thousands</span>
//             </h2>
//             <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
//               See what our users have to say
//             </p>
//           </div>
//           <div className="text-center">
//             <p className="text-gray-500 dark:text-gray-400 text-lg">
//               No reviews yet. Be the first to share your experience!
//             </p>
//           </div>
//         </Wrapper>
//       </section>
//     );
//   }

//   // Different rotation and offset for organic 3D feel
//   const cardStyles = [
//     { rotate: -2.5, translateY: 6, translateX: -3 },
//     { rotate: 1.8, translateY: -5, translateX: 5 },
//     { rotate: -1.2, translateY: 10, translateX: -6 },
//     { rotate: 3, translateY: -8, translateX: 3 },
//     { rotate: -3.5, translateY: 5, translateX: -5 },
//     { rotate: 1.2, translateY: -3, translateX: 6 },
//   ];

//   return (
//     <section className="pb-20 lg:pb-20 xl:pb-28">
//       <Wrapper>
//         <div className="text-center mb-10 lg:mb-14">
//           <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
//             Loved by <span className="text-cyan-600">Thousands</span>
//           </h2>
//           <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
//             See what our users have to say
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 px-2">
//           {displayed.map((testimonial, index) => (
//             <div
//               key={testimonial.id || `${testimonial.name}-${index}`}
//               className="group relative bg-cyan-50 p-5 cursor-pointer
//                          transition-all duration-300 ease-out border border-cyan-400 dark:bg-secondary dark:border-accent"
//               style={{
//                 transform: `rotate(${cardStyles[index].rotate}deg) translateY(${cardStyles[index].translateY}px) translateX(${cardStyles[index].translateX}px)`,
//               }}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex gap-0.5">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
//                     />
//                   ))}
//                 </div>
//                 <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
//                   Verified
//                 </span>
//               </div>

//               <p className="text-gray-700 dark:text-gray-300 mb-4 leading-snug text-sm line-clamp-4">
//                 "{testimonial.content}"
//               </p>

//               <div className="flex items-center gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-700">
//                 <div className="w-6 h-6 bg-gray-300 flex items-center justify-center text-gray-800 dark:text-gray-100 font-bold text-xs shrink-0 rounded-full dark:bg-accent">
//                   {testimonial.name.charAt(0)}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-medium text-gray-700 dark:text-gray-300 text-[13px] truncate">
//                     {testimonial.name}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Wrapper>
//     </section>
//   );
// }

import { Star } from "lucide-react";
import Wrapper from "../Wrapper";

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const displayed = testimonials.slice(0, 6);

  if (displayed.length === 0) {
    return (
      <section className="font-plex pb-20 lg:pb-20 xl:pb-28 bg-white dark:bg-stone-950">
        <Wrapper>
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="font-fraunces text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
              Loved by{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">thousands</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </h2>
            <p className="mt-2 text-base text-stone-600 dark:text-stone-400">
              See what our users have to say
            </p>
          </div>
          <div className="text-center">
            <p className="text-stone-500 dark:text-stone-400 text-lg">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        </Wrapper>
      </section>
    );
  }

  // Different rotation and offset for an organic, pinned-note feel
  const cardStyles = [
    { rotate: -2.5, translateY: 6, translateX: -3 },
    { rotate: 1.8, translateY: -5, translateX: 5 },
    { rotate: -1.2, translateY: 10, translateX: -6 },
    { rotate: 3, translateY: -8, translateX: 3 },
    { rotate: -3.5, translateY: 5, translateX: -5 },
    { rotate: 1.2, translateY: -3, translateX: 6 },
  ];

  // every third note gets the highlighter tint, like a marked-up sticky note among plain ones
  const isTinted = (index: number) => index % 3 === 1;

  return (
    <section className="font-plex pb-20 lg:pb-20 xl:pb-28 bg-white dark:bg-stone-950">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="font-fraunces text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
            Loved by{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">thousands</span>
              <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
            </span>
          </h2>
          <p className="mt-2 text-base text-stone-600 dark:text-stone-400">
            See what our users have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 px-2">
          {displayed.map((testimonial, index) => (
            <div
              key={testimonial.id || `${testimonial.name}-${index}`}
              className={`group relative p-5 cursor-pointer shadow-sm hover:shadow-md
                         transition-shadow duration-300 ease-out border ${
                           isTinted(index)
                             ? "bg-lime-50 border-lime-300 dark:bg-lime-400/10 dark:border-lime-400/25"
                              : "bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800"
                         }`}
              style={{
                transform: `rotate(${cardStyles[index].rotate}deg) translateY(${cardStyles[index].translateY}px) translateX(${cardStyles[index].translateX}px)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] tracking-wide text-stone-400 dark:text-stone-500 font-medium">
                  Verified
                </span>
              </div>

              <p className="text-stone-700 dark:text-stone-300 mb-4 leading-snug text-sm line-clamp-4">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-100 font-bold text-xs shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-stone-700 dark:text-stone-300 text-[13px] truncate">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
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