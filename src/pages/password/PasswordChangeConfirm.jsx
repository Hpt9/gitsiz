import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const PasswordChangeConfirm = () => {
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to extract token from query string
  function getTokenFromQuery() {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  }

  useEffect(() => {
    const token = getTokenFromQuery();
    if (!token) {
      setStatus("error");
      return;
    }
    axios
      .get(`https://kobklaster.tw1.ru/api/user/password/confirm-change/${token}`)
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [location]);

  // Countdown and redirect
  useEffect(() => {
    if (status === "success") {
      if (countdown === 0) {
        navigate("/");
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-493px)] bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center transition-all duration-500 min-w-[320px]">
        {status === "loading" && (
          <>
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <div className="text-xl font-semibold">Yüklənir...</div>
          </>
        )}
        {status === "success" && (
          <>
            <svg className="h-12 w-12 text-green-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-xl font-semibold text-green-600 mb-2">
              Şifrə uğurla dəyişdirildi!
            </div>
            <div className="text-gray-500 mb-4">
              Ana səhifəyə yönləndirilirsiniz... <span className="font-bold">{countdown}</span>
            </div>
            <button
              className="bg-[#2A534F] text-white px-4 py-2 rounded hover:bg-[#1a3331] transition"
              onClick={() => navigate("/")}
            >
              Ana səhifəyə qayıt
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <svg className="h-12 w-12 text-red-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="text-xl font-semibold text-red-600 mb-2">
              Şifrə dəyişdirilə bilmədi və ya keçid etibarsızdır.
            </div>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              onClick={() => navigate("/")}
            >
              Ana səhifəyə qayıt
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 