import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white dark:bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-600 mb-8">
            You have cancelled the payment process. No charges were made.
          </p>
          <Link
            to="/plans"
            className="gradient-btn inline-block px-8 py-3 rounded-xl font-medium"
          >
            View Plans Again
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
