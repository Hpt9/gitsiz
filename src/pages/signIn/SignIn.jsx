import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    //console.log(formData);
  };

  return (
    <div className="w-full  flex justify-center items-center py-[32px]">
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
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[16px]"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Parolunuz"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] mb-[8px]"
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
            <button
              type="button"
              onClick={() => {/* Handle Google sign in */}}
              className="flex-1 h-[48px] border font-medium border-[black] rounded-[16px] flex justify-center items-center gap-x-[8px] hover:bg-gray-50 transition-colors"
            >
              <FcGoogle size={24} />
              İlə davam et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
