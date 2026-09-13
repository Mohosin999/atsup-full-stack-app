import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
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
    credits: 3,
    features: [
      "3 free credits per day",
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
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 lg:mb-4 text-center"
        >
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-100">
            Choose Your Plan
          </h1>
          <p className="text-sm xl:text-base text-gray-600 max-w-xl xl:max-w-2xl mx-auto dark:text-gray-400">
            Get more credits to analyze your resumes and land your dream job.
            Upgrade anytime as your needs grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-secondary rounded-2xl shadow-[0_0_6px_rgba(0,0,0,0.2)] overflow-hidden ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-secondary dark:bg-accent text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-10" : ""}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800 dark:text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {plan.credits}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      credits
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="relative group">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.price > 0}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      plan.popular
                        ? "gradient-btn"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {!user && plan.price === 0
                      ? "Select"
                      : plan.price === 0
                        ? "Current Plan"
                        : `Upgrade to ${plan.name}`}
                  </button>
                  {plan.price > 0 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Upcoming
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Wrapper>
    </div>
  );
}
