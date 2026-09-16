import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import Wrapper from "../components/Wrapper";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 7,
    features: [
      "7 free credits per day",
      "Use for ATS check and resume build",
      "AI-powered scan",
      "PDF export",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 5,
    credits: 15,
    features: [
      "15 Free Credits per Day",
      "Use for ATS Check or Resume Build",
      "AI-powered Scan",
      "PDF export",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 10,
    credits: 35,
    features: [
      "35 Free Credits per Day",
      "Use for ATS Check or Resume Build",
      "Advanced AI-powered Scan",
      "PDF export",
    ],
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (planId === "free") {
      navigate("/ats-scan");
    }
  };

  return (
    <div className="font-plex min-h-screen bg-stone-50 dark:bg-stone-950 lg:pt-20 pb-12">
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-10 lg:pt-14 pb-8 lg:mb-4 text-center"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-lime-50 text-lime-800 border border-lime-300 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20">
            <Zap className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </span>
          <h1 className="font-fraunces mt-4 text-2xl md:text-3xl font-normal text-stone-900 dark:text-stone-50">
            Choose Your Plan
          </h1>
          <p className="font-plex mt-2 text-sm xl:text-base text-stone-500 dark:text-stone-400 max-w-xl xl:max-w-2xl mx-auto">
            Get more credits to analyze your resumes and land your dream job.
            Upgrade anytime as your needs grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col bg-white dark:bg-stone-900 rounded-2xl border shadow-xl overflow-hidden ${
                plan.popular
                  ? "border-lime-400 dark:border-lime-400/60 ring-2 ring-lime-400/40 dark:ring-lime-400/30 md:-mt-4 md:mb-4"
                  : "border-stone-200 dark:border-stone-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span className="font-plex inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`flex flex-col flex-1 p-7 md:p-8 ${plan.popular ? "md:pt-10" : ""}`}>
                <div className="mb-2">
                  <h3 className="font-plex text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {plan.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="font-plex text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="font-plex text-sm text-stone-500 dark:text-stone-400">
                      /month
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                  <span className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-plex text-2xl font-bold text-stone-900 dark:text-stone-50 leading-none">
                      {plan.credits}
                    </p>
                    <p className="font-plex text-xs text-stone-500 dark:text-stone-400 mt-1">
                      credits per day
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-lime-100 dark:bg-lime-400/10 text-lime-700 dark:text-lime-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="font-plex text-sm text-stone-600 dark:text-stone-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="relative group">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.price > 0}
                    className={`font-plex w-full py-3 rounded-xl font-semibold transition-colors ${
                      plan.price === 0 && user && plan.id === "free"
                        ? "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default"
                        : "bg-stone-900 hover:bg-stone-800 dark:bg-lime-300 dark:hover:bg-lime-200 text-white dark:text-stone-900"
                    } disabled:opacity-80 disabled:cursor-not-allowed`}
                  >
                    {!user && plan.price === 0
                      ? "Select Free Plan"
                      : plan.price === 0
                        ? "Current Plan"
                        : `Upgrade to ${plan.name}`}
                  </button>
                  {plan.price > 0 && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                      Coming soon
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}