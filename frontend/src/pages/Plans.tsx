import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Zap,
  Crown,
  Star,
  Building,
  Coins,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { fetchUser } from "../store/slices/authSlice";
import { showUpgradePlan } from "../components/ui/Toast";
import BackButton from "../components/ui/BackButton";
import { createCheckoutSession } from "../services/payment";
import { getStripe } from "../lib/stripe";

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
    credits: 100,
    features: [
      "100 Resume Analyses",
      "Basic AI Suggestions",
      "PDF Export",
      "Email Support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    credits: 500,
    features: [
      "500 Resume Analyses",
      "Priority Processing",
      "Advanced AI Insights",
      "All Export Formats",
      "Priority Support",
      "Custom Templates",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    credits: 1500,
    features: [
      "Unlimited Analyses",
      "Real-time Processing",
      "Full AI Suite",
      "API Access",
      "24/7 Support",
      "Team Management",
      "Custom Branding",
    ],
  },
];

export default function Plans() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(planId);
    try {
      const { url } = await createCheckoutSession(planId);
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        window.location.href = url;
      } else {
        toast.error("Failed to initialize Stripe");
        setLoading(null);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to start checkout");
      setLoading(null);
    }
  };

  const handleBuyCredits = async (credits: number, price: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading("buyCredits");
    try {
      toast.success(`Successfully purchased ${credits} credits! (Demo)`);
      await dispatch(fetchUser());
    } catch (error) {
      toast.error("Failed to purchase credits");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 mb-1">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-600 max-w-2xl mx-auto">
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
              className={`relative bg-white dark:bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-10" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  {plan.id === "free" && (
                    <Zap className="w-6 h-6 text-yellow-500" />
                  )}
                  {plan.id === "pro" && (
                    <Crown className="w-6 h-6 text-purple-500" />
                  )}
                  {plan.id === "enterprise" && (
                    <Building className="w-6 h-6 text-blue-500" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-600">
                      /month
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.credits}
                    </span>
                    <span className="text-gray-500 dark:text-gray-600">
                      credits
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-700 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? "gradient-btn"
                      : "bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : plan.price === 0 ? (
                    "Current Plan"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
