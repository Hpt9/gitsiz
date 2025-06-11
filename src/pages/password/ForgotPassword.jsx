import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://kobklaster.tw1.ru/api/forgot-password', { email });
      toast.success('Şifrə bərpası üçün təlimatlar e-poçt ünvanınıza göndərildi.');
      navigate('/daxil-ol');
    } catch (error) {
      toast.error('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-[32px] lg:h-[calc(100vh-492px)]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
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
      </div>
    </div>
  );
}; 