import { TbArrowBackUp } from "react-icons/tb";
import { motion } from "framer-motion";

export const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -     30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)] flex flex-col items-center justify-center bg-gray-100"
    >
      <motion.h1 
        className="text-6xl font-bold text-gray-800 mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        404
      </motion.h1>
      <motion.h2 
        className="text-2xl font-semibold text-gray-600 mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Səhifə Tapılmadı
      </motion.h2>
      <motion.p 
        className="text-gray-500 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Səhifə axtarışda tapılmadı və ya ünvanı dəyişdirilib.
      </motion.p>
      <motion.a
        href="/"
        className="px-6 py-3 bg-[#2A534F] border border-[#2A534F] text-white rounded-[12px] hover:bg-[white] hover:text-[#2A534F] transition-colors flex items-center gap-x-[10px]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        Ana Səhifəyə Qayıt
        <TbArrowBackUp className="mr-2 w-[20px] h-[20px]" />
      </motion.a>
    </motion.div>
  );
};

export default NotFound; 