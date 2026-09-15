import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';

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
      pill: 'bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
      icon: 'text-red-500 dark:text-red-400',
      btn: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20',
    },
    warning: {
      pill: 'bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20',
      icon: 'text-amber-500 dark:text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20',
    },
    info: {
      pill: 'bg-lime-50 border border-lime-200 dark:bg-lime-400/10 dark:border-lime-400/20',
      icon: 'text-lime-600 dark:text-lime-300',
      btn: 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200 shadow-sm shadow-stone-900/10',
    },
  };

  const styles = typeStyles[type];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-[2px]"
            onClick={onCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
            <button
              onClick={onCancel}
              className="font-plex absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-12 h-12 ${styles.pill} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
              {type === 'info' ? (
                <Info className={`w-6 h-6 ${styles.icon}`} />
              ) : (
                <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
              )}
            </div>

            <h3 className="font-fraunces text-lg text-stone-900 dark:text-stone-50 text-center mb-2">
              {title}
            </h3>

            <p className="font-plex text-sm text-stone-500 dark:text-stone-400 text-center mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="font-plex flex-1 px-3 py-3 rounded-xl font-medium text-sm text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`font-plex flex-1 px-3 py-3 text-sm rounded-xl font-semibold transition-colors ${confirmClassName || styles.btn}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </>
  );
}