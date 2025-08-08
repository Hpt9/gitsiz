import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('https://kobklaster.tw1.ru/api/forgot-password', { email });
      toast.success('Şifrə bərpa linki email ünvanınıza göndərildi');
      navigate('/daxil-ol');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h1 className="text-left text-[24px] font-bold text-[#2A534F]">
          Şifrəni bərpa et
        </h1>
        <p className="text-gray-600">
          Qeydiyyatdan keçdiyiniz e-poçt ünvanını daxil edin. Şifrə bərpası üçün təlimatlar e-poçt ünvanınıza göndəriləcək.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-poçt ünvanı"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors disabled:opacity-50"
          >
            {loading ? 'Göndərilir...' : 'Göndər'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}; 