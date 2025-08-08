import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { motion } from "framer-motion";

export const SignIn = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const fetchUserProfile = useUserStore(state => state.fetchUserProfile);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/login', formData);
      
      if (response.data.token) {
        useUserStore.getState().setToken(response.data.token);
        await fetchUserProfile();
        navigate('/');
        toast.success('Uğurla daxil oldunuz!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
      toast.error('Email və ya şifrə yanlışdır');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await axios.post('https://kobklaster.tw1.ru/api/google-login', {
        email: decoded.email,
        name: decoded.name,
        google_id: decoded.sub
      });

      if (response.data.token) {
        useUserStore.getState().setToken(response.data.token);
        await fetchUserProfile();
        navigate('/');
        toast.success('Uğurla daxil oldunuz!');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google ilə daxil olma xətası');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      
      className="mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h1 className="text-left text-[24px] font-bold text-[#2A534F]">
          Məlumatlarınızı daxil edin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            
            placeholder="E-poçt ünvanı"
            className={`w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px] 
              ${
                error
                ? "border-[#E94134]"
                : "border-[#E7E7E7] focus:border-[#2E92A0]"
              }
              `}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolunuz"
              className={`w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[8px] 
                ${
                  error
                  ? "border-[#E94134]"
                  : "border-[#E7E7E7] focus:border-[#2E92A0]"
                }
                `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[43%] -translate-y-1/2 transform text-gray-500"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          <span 
            className="text-[14px] text-[#2A534F] cursor-pointer hover:underline mb-[32px]"
            onClick={() => navigate('/forgot-password')}
          >
            Parolunuzu unutmusunuz?
          </span>
          <div className="flex gap-x-[8px]">
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <span className="loader2 w-[20px] h-[20px]"></span>
                  <span className='ml-[8px]'>Giriş edilir...</span>
                </span>
              ) : (
                "Daxil ol"
              )}
            </button>
            <div className="flex-1 flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                width="100%"
                className='w-full'
              />
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
