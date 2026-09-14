import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Wrapper from "../Wrapper";

const plans = [
  { name: "Free", price: "$0", credits: "7", features: ["7 AI scans / day", "ATS check & rewrite", "Resume builder & PDF export", "5 saved each"], cta: "Start Free", popular: false, href: "/ats-scan" },
  { name: "Pro", price: "$5", credits: "15", features: ["15 AI scans / day", "Everything in Free", "Priority support", "Coming Soon"], cta: "Upcoming", popular: true, href: "#" },
  { name: "Enterprise", price: "$10", credits: "35", features: ["35 AI scans / day", "Everything in Pro", "Team access", "Coming Soon"], cta: "Upcoming", popular: false, href: "#" },
];

export default function PricingTeaser() {
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
            Pricing
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">Free to start. Upgrade when you need more.</h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400">No credit card required. 7 scans daily, resets 4 PM BST.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white dark:bg-secondary p-6 xl:p-8 flex flex-col ${plan.popular ? "border-cyan-500 shadow-lg shadow-cyan-500/10" : "border-gray-200 dark:border-gray-700"}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-600 text-white whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <h3 className="text-base xl:text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                <span className="text-xs text-gray-500">/month</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 text-amber-400" /> {plan.credits} credits / day
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`mt-6 w-full text-center py-3 rounded-xl text-xs md:text-sm font-semibold transition-colors ${plan.popular ? "bg-cyan-600 text-white hover:bg-cyan-700" : plan.name === "Free" ? "border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          Paid plans are mock — Pro/Enterprise coming soon. Free tier is the real product today.
        </p>
      </Wrapper>
    </section>
  );
}
