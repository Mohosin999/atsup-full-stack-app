import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionCardProps {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
  index?: number;
}

export default function SectionCard({ id, title, icon: Icon, expanded, onToggle, children, index = 0 }: SectionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
    >
      <button 
        onClick={() => onToggle(id)} 
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors bg-gradient-to-r from-gray-50 to-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            expanded 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900 block">{title}</span>
          </div>
        </div>
        {expanded ? 
          <ChevronUp className="w-5 h-5 text-blue-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-600" />
        }
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
