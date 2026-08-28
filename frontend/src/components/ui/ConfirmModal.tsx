import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  confirmClassName?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
  confirmClassName,
}: ConfirmModalProps) {
  const typeStyles = {
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-500',
      btn: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-500',
      btn: 'bg-orange-500 hover:bg-orange-600',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-500',
      btn: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-12 h-12 ${styles.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>

            <h3 className="text-base xl:text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-2.5 rounded-xl font-medium text-gray-700 text-sm dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-3 py-2.5 text-sm rounded-xl font-medium text-white ${confirmClassName || styles.btn} transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
