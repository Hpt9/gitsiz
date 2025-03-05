import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(5);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOtpStep) {
      // First step: Send registration data and request OTP
      try {
        // API call to send registration data and request OTP
        // await axios.post('/api/register', formData);
        setIsOtpStep(true);
        startTimer();
      } catch (error) {
        console.error('Registration error:', error);
      }
    } else {
      // Second step: Verify OTP
      try {
        // API call to verify OTP
        // await axios.post('/api/verify-otp', { email: formData.email, otp });
        navigate('/daxil-ol'); // Redirect to login after successful verification
      } catch (error) {
        console.error('OTP verification error:', error);
      }
    }
  };

  const handleResendOtp = async () => {
    if (timer === 0) {
      try {
        // API call to resend OTP
        // await axios.post('/api/resend-otp', { email: formData.email });
        setTimer(60);
        startTimer();
      } catch (error) {
        console.error('Resend OTP error:', error);
      }
    }
  };

  if (isOtpStep) {
    return (
      <div className="w-full  flex justify-center items-center py-[32px] lg:min-h-[50vh]">
        <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[32px]">
          <h1 className="text-left font-bold text-[20px] text-[#2A534F]">
            E-poçtunuzua göndərilən kodu daxil edin
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6 rəqəmli kodu daxil edin"
              maxLength={6}
              className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] placeholder:text-center mb-[8px]"
            />
            <p className="text-sm text-[#2A534F] font-medium mb-[32px]">
              Kodun yenilənməsinə <span className='text-[#FF0000] font-medium'>{Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</span>
            </p>
            <div className="flex gap-x-[8px]">
              <button
                type="submit"
                className="flex-1 h-[48px] bg-[#967D2E] text-white font-bold rounded-[16px] hover:bg-[#876f29] transition-colors"
              >
                Göndər
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className={`flex-1 h-[48px] border font-medium  rounded-[16px] ${timer === 0 ? 'text-[#2A534F] hover:bg-gray-50' : 'text-gray-400'}  ${timer === 0 ? 'bg-[white] hover:bg-gray-50 ' : 'bg-[#E7E7E7]'} transition-colors `}
                style={{
                  borderColor: timer === 0 ? '#2A534F' : '#E7E7E7',
                }}
                disabled={timer > 0}
              >
                Kodu yenidən göndər
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  flex justify-center py-[32px]">
      <div className="mobile:w-[90%] sm:w-[400px] flex flex-col gap-y-[24px]">
        <h1 className="text-left text-[20px] font-bold text-[#2A534F]">
          Məlumatlarınızı daxil edin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[16px]">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ad"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D]"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Soyad"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D]"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-poçt ünvanı"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D]"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Parolunuz"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D]"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Parolunuzu yenidən daxil edin"
            className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D]"
          />
          <div className="flex gap-x-[8px] mt-[16px]">
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#967D2E] font-bold text-white rounded-[16px] hover:bg-[#876f29] transition-colors"
            >
              Davam et
            </button>
            <button
              type="button"
              onClick={() => {/* Handle Google sign up */}}
              className="flex-1 h-[48px] border border-[black] font-medium rounded-[16px] flex justify-center items-center gap-x-[8px] hover:bg-gray-50 transition-colors"
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
