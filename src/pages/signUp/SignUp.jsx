import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

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
    // Remove all non-digit characters
    const number = value.replace(/\D/g, "");

    // Return empty if no input
    if (number.length === 0) return "";

    // Start building the formatted number
    let formatted = "+";

    // Add the country code
    if (number.length >= 3) {
      formatted += number.slice(0, 3);
      if (number.length > 3) formatted += "-";
    } else {
      return formatted + number;
    }

    // Add the operator code
    if (number.length >= 5) {
      formatted += number.slice(3, 5);
      if (number.length > 5) formatted += "-";
    } else {
      return formatted + number.slice(3);
    }

    // Add the first part of subscriber number
    if (number.length >= 8) {
      formatted += number.slice(5, 8);
      if (number.length > 8) formatted += "-";
    } else {
      return formatted + number.slice(5);
    }

    // Add the second part
    if (number.length >= 10) {
      formatted += number.slice(8, 10);
      if (number.length > 10) formatted += "-";
    } else {
      return formatted + number.slice(8);
    }

    // Add the last part
    if (number.length >= 12) {
      formatted += number.slice(10, 12);
    } else {
      return formatted + number.slice(10);
    }

    return formatted;
  };

  const handlePhoneChange = (e) => {
    const input = e.target;
    let { value } = e.target;
    const prevValue = formData.phone;

    // If user is deleting and the field is about to be empty
    if (prevValue.length > value.length && value.length === 4) { // Handles deleting back to "+994"
        setFormData(prev => ({ ...prev, phone: "" }));
        return;
    }

    const formattedPhone = formatPhoneNumber(value);

    setFormData(prev => ({ ...prev, phone: formattedPhone }));
      
    // Set cursor position to the end after the update
    setTimeout(() => {
        input.setSelectionRange(formattedPhone.length, formattedPhone.length);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone field
    if (name === 'phone') {
        handlePhoneChange(e);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));

    // Live check for password match
    if (name === "password" || name === "password_confirmation") {
      const newPassword = name === "password" ? value : formData.password;
      const newConfirmation = name === "password_confirmation" ? value : formData.password_confirmation;
      setPasswordsMatch(newPassword === newConfirmation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
    };

    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/register', submissionData);
      const token = response.data.token;
      if (token) {
        useUserStore.getState().setToken(token);
        await fetchUserProfile();
        navigate('/', { state: { fromRegistration: true } }); // Redirect and signal for modal
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFieldErrors(error.response.data);
      } else {
        setFieldErrors({});
        toast.error('Qeydiyyat zamanı xəta baş verdi!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    axios
      .post("https://kobklaster.tw1.ru/api/auth/google", {
        name: decoded.given_name,
        email: decoded.email,
        surname: decoded.family_name,
        google_id: decoded.sub,
      })
      .then((res) => {
        if (res.data.token) {
          useUserStore.getState().setToken(res.data.token);
          fetchUserProfile().then(() => navigate('/', { state: { fromRegistration: true } }));
        }
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.data &&
          err.response.data.token &&
          err.response.data.user
        ) {
          if (err.response.data.need_phone) {
            toast.warn('Telefon nömrəsi tələb olunur, zəhmət olmasa telefon nömrənizi daxil edin.');
          }
          useUserStore.getState().setToken(err.response.data.token);
          fetchUserProfile().then(() => navigate('/', { state: { fromRegistration: true } }));
        } else {
          toast.error('Xəta baş verdi');
        }
      });
  };

  // Shared border color for password fields
  const passwordBorder = !passwordsMatch && formData.password_confirmation ? 'border-red-500' : 'border-[#7D7D7D]';

  return (
    <div className="w-full  flex justify-center items-center py-[32px] mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
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
            <div className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</div>
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
            <div className="text-red-500 text-xs mt-1">{fieldErrors.phone[0]}</div>
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
            <div className="text-red-500 text-xs mt-1">{fieldErrors.email[0]}</div>
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
            <div className="text-red-500 text-xs mt-1">{fieldErrors.password[0]}</div>
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
      </div>
    </div>
  );
};
