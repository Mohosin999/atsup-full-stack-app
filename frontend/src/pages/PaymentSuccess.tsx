import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAppDispatch } from "../hooks/redux";
import { fetchUser } from "../store/slices/authSlice";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const hasVerifiedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const dispatch = useAppDispatch();

  // Memoize the refresh function to prevent re-creation on each render
  const refreshUserData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      await dispatch(fetchUser()).unwrap();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    // Check if already verified in this session (prevents multiple verifications)
    const verifiedSessionKey = `verified_${sessionId}`;
    const alreadyVerified = sessionStorage.getItem(verifiedSessionKey);
    
    if (alreadyVerified === 'true') {
      console.log('Payment already verified in this session, skipping');
      setSuccess(true);
      setLoading(false);
      return;
    }

    // Prevent multiple verifications - use ref to track across renders
    // This check happens BEFORE any async operation
    if (hasVerifiedRef.current) {
      return;
    }
    hasVerifiedRef.current = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setSuccess(false);
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/payment/verify?session_id=${sessionId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.data.success) {
          setSuccess(true);
          const { credits, alreadyProcessed, plan } = response.data;

          // Mark as verified in session storage
          sessionStorage.setItem(verifiedSessionKey, 'true');

          // Only refresh user data and show toast if NOT already processed
          if (!alreadyProcessed) {
            // Refresh user data in background (won't trigger re-render of this effect)
            await refreshUserData();
            
            const planName = plan === "enterprise" ? "Enterprise" : "Pro";
            toast.success(`Payment successful! ${credits} credits added to your ${planName} plan.`);
          }
          // If already processed, don't show any toast - just show success page
        } else {
          setSuccess(false);
          toast.error(response.data.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setSuccess(false);
        toast.error(error.response?.data?.message || "Payment verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Removed dispatch from dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-600">Verifying payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white dark:bg-white rounded-2xl shadow-lg p-8 text-center">
          {success ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-600 mb-8">
                Thank you for your purchase. Your credits have been added to your account.
              </p>
              <Link
                to="/dashboard"
                className="gradient-btn inline-block px-8 py-3 rounded-xl font-medium"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-600 mb-8">
                Something went wrong with your payment. Please try again.
              </p>
              <Link
                to="/plans"
                className="gradient-btn inline-block px-8 py-3 rounded-xl font-medium"
              >
                Back to Plans
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
