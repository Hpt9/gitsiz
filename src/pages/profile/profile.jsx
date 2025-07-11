import { useState, useEffect } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import axios from "axios";
import { base_url } from "../../components/expoted_images";

import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../store/languageStore";

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const token = useUserStore((state) => state.token);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const { language } = useLanguageStore();
  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/daxil-ol");
      return;
    }

    // Only fetch user profile if we have a token
    fetchUserProfile();
  }, [navigate, fetchUserProfile, token]);

  // Local state for editing, initialized from user data
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Fetch user's own announcements
  useEffect(() => {
    const fetchUserAnnouncements = async () => {
      setLoadingAnnouncements(true);
      try {
        const response = await axios.get(
          "https://kobklaster.tw1.ru/api/user-adverts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response.data.data);
        setUserAnnouncements(response.data.data || []);
      } catch {
        setUserAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
        setIsLoading(false);
      }
    };
    if (token) {
      fetchUserAnnouncements();
    }
  }, [token]);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const response = await axios.put(
          `${base_url}/user/edit`,
          {
            name: profileData.fullName,
            email: profileData.email,
            phone: profileData.phone,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data); // update user in store if needed
        await fetchUserProfile(); // Fetch the latest user info from backend
      } catch (error) {
        console.error("Profile update error:", error);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/daxil-ol");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)]">
        <span className="loader"></span>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="w-full  lg:h-[calc(100vh-492px)] lg:min-h-[1024px]">
      {/* Header */}
      <div className="announcements_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)] relative faq_header">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <h1 className="mobile:text-[32px] mobile:leading-[39px] lg:leading-[60px] lg:text-[61px] font-bold text-[rgb(255,255,255)] mobile:w-[224px] lg:w-[500px]">
            {language === "az"
              ? "Profil"
              : language === "en"
              ? "Profile"
              : "Профиль"}
          </h1>
        </div>
      </div>

      {/* Main Card Section */}
      <div className="flex flex-col items-center justify-center w-full px-4 lg:px-0 my-[60px]">
        <div className="flex items-center w-full max-w-[1024px] xl:max-w-[1127px] justify-between mb-4">
          {!isEditing ? (
            <h2 className="text-xl lg:text-2xl font-semibold text-[#2A534F]">
              Şəxsi məlumatlarım
            </h2>
          ) : (
            <div className="flex w-full items-center justify-center gap-2">
              <h2 className="text-xl lg:text-2xl font-semibold text-[#2A534F]">
              Redaktə
              </h2>
              
            </div>
          )}
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-[#977F2E] text-white px-5 py-2 rounded-md font-semibold hover:bg-[#7a6624] transition"
            >
              Redaktə et
            </button>
          )}
        </div>
        <div 
        style={{
          justifyContent: isEditing ? "center" : "space-between",
        }}
        className="w-full max-w-[1024px] xl:max-w-[1127px] bg-[rgba(255,255,255,0.5)] rounded-2xl flex flex-col lg:flex-row justify-between ">
          {/* Personal Info */}
          <div className="min-w-[200px] flex">
            {/* Info or Edit Form */}
            {!isEditing ? (
              <div className="w-full">
                <div className="mt-[12px]">
                  <label className="flex w-fit text-gray-500 text-base font-normal mb-[-8px] ml-4 bg-white z-10 relative px-1 top-[4px] left-[4px]">
                    Ad, soyad
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    readOnly
                    className="w-full sm:w-[371px] px-4 py-4 border-2 border-gray-400 rounded-[16px] h-[49px] text-xl font-semibold text-gray-800 focus:outline-none focus:border-[#2A534F] bg-white"
                  />
                </div>
                <div className="mt-[12px]">
                  <label className="flex w-fit text-gray-500 text-base font-normal mb-[-8px] ml-4 bg-white z-10 relative px-1 top-[4px] left-[4px]">
                    E-poçt ünvanı
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full sm:w-[371px] px-4 py-4 border-2 border-gray-400 rounded-[16px] h-[49px] text-xl font-semibold text-gray-800 focus:outline-none focus:border-[#2A534F] bg-white"
                  />
                </div>
                <div className="mt-[12px]">
                  <label className="flex w-fit text-gray-500 text-base font-normal mb-[-8px] ml-4 bg-white z-10 relative px-1 top-[4px] left-[4px]">
                    Mobil nömrə
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    readOnly
                    className="w-full sm:w-[371px] px-4 py-4 border-2 border-gray-400 rounded-[16px] h-[49px] text-xl font-semibold text-gray-800 focus:outline-none focus:border-[#2A534F] bg-white"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border-2 border-red-500 text-red-500 px-4 py-[12.5px] rounded-[16px] h-[49px] w-[117px] font-bold text-xl mt-[16px]  hover:bg-red-50 transition"
                >
                  <HiOutlineLogout className="w-7 h-7" />
                  <span className="text-[14px] font-semibold whitespace-nowrap">
                    Çıxış et
                  </span>
                </button>
              </div>
            ) : (
              <form
                className="space-y-4 w-[371px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEdit();
                }}
              >
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Ad, soyad
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#7D7D7D] rounded-[16px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    E-poçt ünvanı
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#7D7D7D] rounded-[16px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Mobil nömrə
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#7D7D7D] rounded-[16px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Yeni şifrə
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={passwordForm.password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        password: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-[#7D7D7D] rounded-[16px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Yeni şifrəni təsdiqlə
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={passwordForm.password_confirmation}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        password_confirmation: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-[#7D7D7D] rounded-[16px]"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-[#000000] text-[#000000] py-2 rounded-md font-semibold hover:bg-black hover:text-white transition"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="flex-1 border border-[#967D2E] bg-[#967D2E] text-white py-2 rounded-md font-semibold hover:bg-white hover:text-[#967D2E] hover:border-[#967D2E] transition"
                  >
                    Yadda saxla
                  </button>
                </div>
              </form>
            )}
          </div>
          {/* Stats */}
          {!isEditing && (
            <div className="flex flex-col w-full  sm:w-[517px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  pt-[26px] ">
                <div className="border border-[#7D7D7D] rounded-[16px] p-4 flex flex-row-reverse justify-between items-center w-full sm:w-[252px] h-[81.5px]">
                  <div className="text-2xl font-bold text-[#2A534F]">5</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Elanların sayı
                  </div>
                </div>
                <div className="border border-[#7D7D7D] rounded-[16px] p-4 flex flex-row-reverse justify-between items-center w-full sm:w-[252px] h-[81.5px]">
                  <div className="text-2xl font-bold text-[#2A534F]">1</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Layih olunan elanlar
                  </div>
                </div>
                <div className="border border-[#7D7D7D] rounded-[16px] p-4 flex flex-row-reverse justify-between items-center w-full sm:w-[252px] h-[81.5px]">
                  <div className="text-2xl font-bold text-[#2A534F]">3240</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Elanlara baxış sayı
                  </div>
                </div>
                <div className="border border-[#7D7D7D] rounded-[16px] p-4 flex flex-row-reverse justify-between items-center w-full sm:w-[252px] h-[81.5px]">
                  <div className="text-2xl font-bold text-[#2A534F]">12</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Müraciət sayı
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Announcements */}
      {!isEditing && (
      <div className="w-full lg:max-w-[1053px] xl:max-w-[1153px] mt-12 px-4 pb-12 mx-auto">
        <h2 className="text-2xl font-semibold text-[#2A534F] mb-6">
          Mənim elanlarım
        </h2>
        {loadingAnnouncements ? (
          <div className="flex justify-center items-center py-8">
            <span className="loader"></span>
          </div>
        ) : userAnnouncements.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Elan yoxdur.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {userAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl border border-[#A0A0A0] overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer relative flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#2A534F] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    Lorem ipsum
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[#2A534F] font-medium">
                      Lorem ipsum
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Lorem ipsum Lorem
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Date 2024-2025
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};
