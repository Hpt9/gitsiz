import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../../store/userStore';
import { motion } from "framer-motion";

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const setTokenStore = useUserStore(state => state.setToken);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    const url = location.search;
    const queryString = url.split('?')[1]; // Get the part after '?'
    const params = new URLSearchParams(queryString);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');
    console.log("tokenFromUrl", tokenFromUrl, "emailFromUrl", emailFromUrl);
    if (!tokenFromUrl || !emailFromUrl) {
      toast.error('Etibarsız və ya əksik məlumatlar.');
      navigate('/daxil-ol');
      return;
    }

    setToken(tokenFromUrl);
    setEmail(emailFromUrl);
  }, [location, navigate]);
  // }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast.error('Şifrələr uyğun gəlmir.');
      return;
    }
    // Password validation: at least one uppercase, one lowercase, one number
    const password = formData.password;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      toast.error('Şifrədə ən azı bir böyük hərf, bir kiçik hərf və bir rəqəm olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/reset-password', {
        email,
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      // console.log("response", response);
      if (response.data.access_token) {
        setTokenStore(response.data.access_token);
        toast.success('Şifrəniz uğurla yeniləndi!');
        navigate('/');
      }
    } catch {
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
          Yeni şifrə təyin et
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Yeni şifrə"
              className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-[40%] transform -translate-y-1/2"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye with slash (hide)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.634 6.634A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                // Eye open (show)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Yeni şifrəni təsdiqlə"
              className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-[40%] transform -translate-y-1/2"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              tabIndex={-1}
            >
              {showPasswordConfirm ? (
                // Eye with slash (hide)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.634 6.634A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                // Eye open (show)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors disabled:opacity-50"
          >
            {loading ? 'Yenilənir...' : 'Şifrəni yenilə'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}; 