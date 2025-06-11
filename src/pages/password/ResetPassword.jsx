import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');
    
    if (!tokenFromUrl || !emailFromUrl) {
      toast.error('Etibarsız və ya əksik məlumatlar.');
      navigate('/daxil-ol');
      return;
    }

    setToken(tokenFromUrl);
    setEmail(emailFromUrl);
  }, [location, navigate]);

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

    setLoading(true);
    try {
      const response = await axios.post('https://kobklaster.tw1.ru/api/reset-password', {
        email,
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        toast.success('Şifrəniz uğurla yeniləndi!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Şifrə yenilənməsi zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-[32px] lg:h-[calc(100vh-492px)]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
        <h1 className="text-left text-[24px] font-bold text-[#2A534F]">
          Yeni şifrə təyin et
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Yeni şifrə"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
            required
          />
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Yeni şifrəni təsdiqlə"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors disabled:opacity-50"
          >
            {loading ? 'Yenilənir...' : 'Şifrəni yenilə'}
          </button>
        </form>
      </div>
    </div>
  );
}; 