import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset scroll on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-[9999999]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#2A534F]">{title}</h2>
              <button onClick={onClose} className="text-2xl font-light text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 