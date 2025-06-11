import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

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
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();
  const fetchUserProfile = useUserStore(state => state.fetchUserProfile);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/register', formData);
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        await fetchUserProfile();
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFieldErrors(error.response.data);
      } else {
        setFieldErrors({});
        toast.error('Qeydiyyat zamanı xəta baş verdi!');
      }
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
          localStorage.setItem('token', res.data.token);
          fetchUserProfile().then(() => navigate('/'));
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
          localStorage.setItem('token', err.response.data.token);
          fetchUserProfile().then(() => navigate('/'));
        } else {
          toast.error('Xəta baş verdi');
        }
      });
  };

  // Shared border color for password fields
  const passwordBorder = !passwordsMatch && formData.password_confirmation ? 'border-red-500' : 'border-[#7D7D7D]';

  return (
    <div className="w-full  flex justify-center items-center py-[32px] lg:h-[calc(100vh-448px)]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
        <h1 className="text-left text-[20px] font-bold text-[#2A534F]">
          Məlumatlarınızı daxil edin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[16px]">
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
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefon nömrəsi"
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
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Parolunuz"
            className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.password ? 'border-red-500' : passwordBorder}`}
          />
          {fieldErrors.password && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.password[0]}</div>
          )}
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Parolunuzu yenidən daxil edin"
            className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${!passwordsMatch && formData.password_confirmation ? 'border-red-500' : passwordBorder}`}
          />
          {!passwordsMatch && formData.password_confirmation && (
            <div className="text-red-500 text-xs mt-1">Şifrələr eyni olmalıdır.</div>
          )}
          <div className="flex gap-x-[8px] mt-[16px]">
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors"
            >
              Davam et
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
