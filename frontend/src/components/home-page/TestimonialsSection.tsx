/* ===================================
Testimonials Section Component - Carousel
=================================== */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setPerView(1);
      else if (window.innerWidth < 1280) setPerView(2);
      else setPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setCurrent((prev) =>
      Math.min(prev, Math.max(0, testimonials.length - perView)),
    );
  }, [perView, testimonials.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const gap = 32;
    const cardWidth = (containerWidth - (perView - 1) * gap) / perView;
    const step = cardWidth + gap;
    setTranslateX(-(current * step));
  }, [current, perView]);

  const maxIndex = Math.max(0, testimonials.length - perView);

  const next = () => setCurrent((prev) => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const gapClass = "gap-6 lg:gap-8";
  const cardStyle = {
    flex: `0 0 calc(${100 / perView}% - ${(perView - 1) * 32 / perView}px)`,
  };

  return (
    <section className="pb-24">
      <Wrapper>
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl xl:text-3xl font-semibold text-gray-800">
            Loved by <span className="text-cyan-500">Thousands</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-700 max-w-lg md:max-w-xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
            See what our users have to say
          </p>
        </div>

        <div className="relative" ref={containerRef}>
          <div className="overflow-hidden py-4">
            <motion.div
              className={`flex ${gapClass}`}
              animate={{ x: translateX }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ willChange: "transform" } as any}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id || `${testimonial.name}-${index}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="shrink-0 bg-white rounded-3xl p-8 shadow-lg border border-gray-200 transition-all duration-300"
                  style={cardStyle}
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.08 + i * 0.07,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <Star className="w-5 h-5 fill-amber-400 text-amber-600" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-700">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {current > 0 && (
            <button
              onClick={prevSlide}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 w-10 h-10 lg:w-11 lg:h-11 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:border-cyan-300 flex items-center justify-center text-gray-700 hover:text-cyan-600 transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {current < maxIndex && (
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 w-10 h-10 lg:w-11 lg:h-11 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:border-cyan-300 flex items-center justify-center text-gray-700 hover:text-cyan-600 transition-all duration-200 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </Wrapper>
    </section>
  );
}
