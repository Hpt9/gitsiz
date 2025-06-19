import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import useLanguageStore from "../../store/languageStore";
import useUserStore from "../../store/userStore";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const { language } = useLanguageStore();
  const token = useUserStore(state => state.token);

  const getText = {
    verifying: {
      en: "Verifying your email...",
      ru: "Проверка вашей электронной почты...",
      az: "Email təsdiqlənir..."
    },
    success: {
      en: "Email successfully verified!",
      ru: "Email успешно подтвержден!",
      az: "Email uğurla təsdiqləndi!"
    },
    redirecting: {
      en: "You will be automatically redirected to your profile page...",
      ru: "Вы будете автоматически перенаправлены на страницу профиля...",
      az: "Siz avtomatik olaraq profil səhifəsinə yönləndiriləcəksiniz..."
    },
    error: {
      en: "Email verification failed",
      ru: "Ошибка при подтверждении email",
      az: "Təsdiqləmə zamanı xəta baş verdi"
    },
    tryAgain: {
      en: "Try again",
      ru: "Попробовать снова",
      az: "Yenidən cəhd edin"
    },
    missingLink: {
      en: "Missing verification link",
      ru: "Отсутствует ссылка для подтверждения",
      az: "Yönləndirmə linki tapılmadı"
    }
  };

  useEffect(() => {
    const verify = async () => {
      if (!redirectUrl) {
        toast.error(getText.missingLink[language] || getText.missingLink.az);
        setStatus("error");
        return;
      }

      try {
        if (!token) {
          navigate('/daxil-ol');
          return;
        }

        const decodedUrl = decodeURIComponent(redirectUrl);
        await axios.get(decodedUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        toast.success(getText.success[language] || getText.success.az);
        setStatus("success");
        
        // Redirect after showing success animation
        setTimeout(() => navigate("/profile"), 2000);
      } catch (error) {
        console.error('Verification error:', error);
        toast.error(getText.error[language] || getText.error.az);
        setStatus("error");
      }
    };

    verify();
  }, [redirectUrl, navigate, language, token]);

  const renderStatus = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <ImSpinner8 className="w-12 h-12 text-[#2A534F]" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              {getText.verifying[language] || getText.verifying.az}
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center gap-4">
            <FaCheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-medium text-gray-700">
              {getText.success[language] || getText.success.az}
            </p>
            <p className="text-sm text-gray-500">
              {getText.redirecting[language] || getText.redirecting.az}
            </p>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-4">
            <FaTimesCircle className="w-16 h-16 text-red-500 " />
            <p className="text-lg font-medium text-gray-700">
              {getText.error[language] || getText.error.az}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2A534F] rounded-md hover:bg-[#1a3331] transition-colors"
            >
              {getText.tryAgain[language] || getText.tryAgain.az}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)] flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        {renderStatus()}
      </div>
    </div>
  );
};
