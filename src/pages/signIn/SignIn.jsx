import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const SignIn = () => {
  const [error, setError] = useState(false);
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
    setError(false);
    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/login', formData);
      const token = response.data.token;
      if (token) {
        useUserStore.getState().setToken(token);
        await fetchUserProfile();
        if (!response.data.phone) {
          toast.warn('Telefon nömrəsi tələb olunur, zəhmət olmasa telefon nömrənizi daxil edin.');
        }
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (error) {
      setError(true);
      toast.error(error.response.data.message);
      console.error('Login error:', error);
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
          fetchUserProfile().then(() => {
            if (!res.data.user?.phone) {
              toast.warn('Telefon nömrəsi tələb olunur, zəhmət olmasa telefon nömrənizi daxil edin.');
            }
            navigate('/');
          });
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
          fetchUserProfile().then(() => {
            if (!err.response.data.user?.phone) {
              toast.warn('Telefon nömrəsi tələb olunur, zəhmət olmasa telefon nömrənizi daxil edin.');
            }
            navigate('/');
          });
        } else {
          toast.error('Xəta baş verdi');
        }
      });
  };

  return (
    <div className="w-full  flex justify-center items-center py-[32px] min-h-[calc(100vh-492px)]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
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
          <input
            type="password"
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
          <span 
            className="text-[14px] text-[#2A534F] cursor-pointer hover:underline mb-[32px]"
            onClick={() => navigate('/forgot-password')}
          >
            Parolunuzu unutmusunuz?
          </span>
          <div className="flex gap-x-[8px]">
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors"
            >
              Daxil ol
            </button>
            <div className="flex-1 flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                width="100%"
                className='w-full bg-red-500'
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
