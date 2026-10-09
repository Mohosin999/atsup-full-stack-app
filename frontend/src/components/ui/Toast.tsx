import { toast } from "react-toastify";

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
};

export const showUpgradePlan = () => {
  toast.info("Upgrade plan feature is coming soon!", {
    position: "top-center",
    autoClose: 5000,
  });
};

export default showToast;
