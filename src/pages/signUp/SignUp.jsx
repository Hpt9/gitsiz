import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { motion } from "framer-motion";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();
  const fetchUserProfile = useUserStore(state => state.fetchUserProfile);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Function to format phone number
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as +994 XX XXX XX XX
    if (phoneNumber.length <= 3) {
      return `+${phoneNumber}`;
    } else if (phoneNumber.length <= 5) {
      return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 8) {
      return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 5)} ${phoneNumber.slice(5)}`;
    } else if (phoneNumber.length <= 10) {
      return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
    } else {
      return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check password match
    if (name === 'password' || name === 'password_confirmation') {
      const password = name === 'password' ? value : formData.password;
      const confirmation = name === 'password_confirmation' ? value : formData.password_confirmation;
      setPasswordsMatch(password === confirmation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Ad tələb olunur';
    if (!formData.phone.trim()) errors.phone = 'Telefon nömrəsi tələb olunur';
    if (!formData.email.trim()) errors.email = 'Email tələb olunur';
    if (!formData.password) errors.password = 'Şifrə tələb olunur';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Şifrələr uyğun gəlmir';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/register', formData);
      
      if (response.data.token) {
        useUserStore.getState().setToken(response.data.token);
        await fetchUserProfile();
        navigate('/', { state: { fromRegistration: true } });
        toast.success('Qeydiyyat uğurla tamamlandı!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setFieldErrors(serverErrors);
      } else {
        toast.error('Qeydiyyat zamanı xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await axios.post('https://kobklaster.tw1.ru/api/google-register', {
        email: decoded.email,
        name: decoded.name,
        google_id: decoded.sub
      });

      if (response.data.token) {
        useUserStore.getState().setToken(response.data.token);
        await fetchUserProfile();
        navigate('/', { state: { fromRegistration: true } });
        toast.success('Qeydiyyat uğurla tamamlandı!');
      }
    } catch (error) {
      console.error('Google registration error:', error);
      toast.error('Google ilə qeydiyyat xətası');
    }
  };

  // Shared border color for password fields
  const passwordBorder = !passwordsMatch && formData.password_confirmation ? 'border-red-500' : 'border-[#7D7D7D]';

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
        <h1 className="text-left text-[20px] font-bold text-[#2A534F]">
          Məlumatlarınızı daxil edin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[8px]">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ad Soyad"
            className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.name ? 'border-red-500' : 'border-[#7D7D7D]'}`}
          />
          {fieldErrors.name && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.name}</div>
          )}
          <input
            type="text"
            name="phone"
            placeholder="+994-99-999-99-99"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.phone ? 'border-red-500' : 'border-[#7D7D7D]'}`}
          />
          {fieldErrors.phone && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.phone}</div>
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-poçt ünvanı"
            className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.email ? 'border-red-500' : 'border-[#7D7D7D]'}`}
          />
          {fieldErrors.email && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>
          )}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolunuz"
              className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.password ? 'border-red-500' : passwordBorder}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-500"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {fieldErrors.password && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>
          )}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Parolunuzu yenidən daxil edin"
              className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${!passwordsMatch && formData.password_confirmation ? 'border-red-500' : passwordBorder}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-500"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {!passwordsMatch && formData.password_confirmation && (
            <div className="text-red-500 text-xs mt-1">Şifrələr eyni olmalıdır.</div>
          )}
          <div className="flex gap-x-[8px] mt-[16px]">
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <span className="loader2 w-[20px] h-[20px]"></span>
                  <span className='ml-[8px]'>Qeydiyyat...</span>
                </span>
              ) : (
                "Davam et"
              )}
            </button>
            <div className="flex-1 flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                width="100%"
              />
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
