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

//   return (
//     <section className="pb-24">
//       <Wrapper>
//         <div className="text-center mb-6 lg:mb-8">
//           <h2 className="text-2xl xl:text-3xl font-semibold text-gray-800">
//             Loved by <span className="text-cyan-500">Thousands</span>
//           </h2>
//           <p className="mt-3 text-sm md:text-base text-gray-700 max-w-lg md:max-w-xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
//             See what our users have to say
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
//           {displayed.map((testimonial, index) => (
//             <div
//               key={testimonial.id || `${testimonial.name}-${index}`}
//               className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 transition-all duration-300"
//             >
//               <div className="flex gap-1 mb-6">
//                 {[...Array(testimonial.rating)].map((_, i) => (
//                   <Star
//                     key={i}
//                     className="w-5 h-5 fill-amber-400 text-amber-600"
//                   />
//                 ))}
//               </div>
//               <p className="text-gray-700 mb-6 leading-relaxed italic">
//                 "{testimonial.content}"
//               </p>
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
//                   {testimonial.name.charAt(0)}
//                 </div>
//                 <div>
//                   <p className="font-bold text-gray-800">
//                     {testimonial.name}
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     {testimonial.role}
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

  // Different rotation and offset for organic 3D feel
  const cardStyles = [
    { rotate: -2.5, translateY: 6, translateX: -3 },
    { rotate: 1.8, translateY: -5, translateX: 5 },
    { rotate: -1.2, translateY: 10, translateX: -6 },
    { rotate: 3, translateY: -8, translateX: 3 },
    { rotate: -3.5, translateY: 5, translateX: -5 },
    { rotate: 1.2, translateY: -3, translateX: 6 },
  ];

  return (
    <section className="pb-20 lg:pb-20 xl:pb-28">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="text-3xl xl:text-4xl font-bold text-gray-900">
            Loved by <span className="text-cyan-600">Thousands</span>
          </h2>
          <p className="mt-2 text-base text-gray-600">
            See what our users have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 px-2">
          {displayed.map((testimonial, index) => (
            <div
              key={testimonial.id || `${testimonial.name}-${index}`}
              className="group relative bg-cyan-50 p-5 cursor-pointer
                         transition-all duration-300 ease-out border border-cyan-400"
              style={{
                transform: `rotate(${cardStyles[index].rotate}deg) translateY(${cardStyles[index].translateY}px) translateX(${cardStyles[index].translateX}px)`,
              }}
            >
              {/* Subtle border highlight on hover
              <div className="absolute inset-0 border-2 border-cyan-500/0 group-hover:border-cyan-500/20 transition-all duration-300 pointer-events-none" /> */}

              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                  Verified
                </span>
              </div>

              <p className="text-gray-700 mb-4 leading-snug text-sm line-clamp-4">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 bg-gray-300 flex items-center justify-center text-gray-800 font-bold text-xs shrink-0 rounded-full">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-700 text-[13px] truncate">
                    {testimonial.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {testimonial.role} Frontend Developer
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}