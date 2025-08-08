import { useState, useEffect } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import axios from "axios";
import { base_url } from "../../components/expoted_images";
import { MdEdit } from "react-icons/md";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../store/languageStore";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { CustomSelect } from "../announcements/PlaceAnnoucement";

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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [zones, setZones] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filterResponse, zonesResponse] = await Promise.all([
          fetch("https://kobklaster.tw1.ru/api/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              economical_zone_id: [],
              method_id: [],
              cluster_id: [],
            }),
          }),
          axios.get("https://kobklaster.tw1.ru/api/economical-zones"),
        ]);
        const filterData = await filterResponse.json();
        // Unique clusters
        const clusterMap = new Map();
        filterData.forEach((item) => {
          if (item.cluster && item.cluster[0]) {
            clusterMap.set(item.cluster[0].id, item.cluster[0]);
          }
        });
        setClusters(Array.from(clusterMap.values()));
        // All zones
        const allZones = zonesResponse.data.flatMap(
          (region) => region.zones || []
        );
        setZones(allZones);
      } catch {
        // handle error
      }
    };
    fetchData();
  }, []);
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm((prev) => ({ ...prev, cover_photo: file }));
    }
  };
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditForm((prev) => ({ ...prev, images: files }));
    }
  };
  const handleClusterChange = (val) => {
    setEditForm((prev) => ({ ...prev, cluster_id: val }));
  };
  const handleZonesChange = (val) => {
    setEditForm((prev) => ({ ...prev, zones: val }));
  };
  const handleEditClick = (announcement) => {
    // console.log('Editing announcement:', announcement); // Debug: log the advert data
    setSelectedAnnouncement(announcement);
    
    // Format zones data properly
    const formattedZones = Array.isArray(announcement.zones) 
      ? announcement.zones.map(z => z.id)
      : [];
    
    // Format cluster data properly
    const clusterId = announcement.cluster_id || (announcement.cluster ? announcement.cluster.id : "");
    
    setEditForm({
      name: announcement.name || "",
      cover_photo: announcement.cover_photo || null,
      images: announcement.images || null,
      text: announcement.text || "",
      service_name: announcement.service_name || "",
      website: announcement.website || "",
      cluster_id: clusterId,
      zones: formattedZones,
    });
    setEditModalOpen(true);
  };
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
 const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    formData.append("advert_name", editForm.name || "");
    formData.append("text", editForm.text || "");
    formData.append("service_name", editForm.service_name || "");
    formData.append("website", editForm.website || "");
    formData.append("cluster_id", editForm.cluster_id || "");
  
    // Ensure zones is an array before appending
    if (Array.isArray(editForm.zones)) {
      editForm.zones.forEach((zoneId) => {
        formData.append("zones[]", zoneId);
      });
    }
  
    // Only append cover_photo if it's a new File
    if (editForm.cover_photo instanceof File) {
      formData.append("cover_photo", editForm.cover_photo);
    }
  
    // Only append images[] if they are new Files
    if (
      Array.isArray(editForm.images) &&
      editForm.images.length > 0 &&
      editForm.images[0] instanceof File
    ) {
      editForm.images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images[]", img);
        }
      });
    }
  
    // Use method override if backend requires POST with _method=PUT
    formData.append("_method", "PUT");
  
    try {
      const loadingToast = toast.loading("Elan yenilənir...", {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      });
      
      const response = await axios.post(
        `https://kobklaster.tw1.ru/api/adverts/update/${selectedAnnouncement.slug}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data) {
        // Refresh announcements
        const updatedResponse = await axios.get(
          "https://kobklaster.tw1.ru/api/user-adverts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserAnnouncements(updatedResponse.data.data || []);
        
        // Close the loading toast and show success message
        toast.dismiss(loadingToast);
        toast.success("Elanınızda etdiyiniz dəyişikliklər qeyd olundu. Təsdiqdən sonra elanınız yenilənəcək.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Close modal and reset form
        setEditModalOpen(false);
        setEditForm(null);
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      // Close the loading toast
      toast.dismiss();
      
      // Show error message
      toast.error(error.response?.data?.message || "Elan yenilənərkən xəta baş verdi!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      console.error("Error updating announcement:", error);
    }
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <motion.div 
        className="announcements_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)] relative faq_header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <h1 className="mobile:text-[32px] mobile:leading-[39px] lg:leading-[60px] lg:text-[61px] font-bold text-[rgb(255,255,255)] mobile:w-[224px] lg:w-[500px]">
            {language === "az"
              ? "Profil"
              : language === "en"
              ? "Profile"
              : "Профиль"}
          </h1>
        </div>
      </motion.div>

      {/* Main Card Section */}
      <div className="flex flex-col items-center justify-center w-full px-4 lg:px-0 my-[60px] ">
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
                    Bütün elanların sayı
                  </div>
                </div>
                <div className="border border-[#7D7D7D] rounded-[16px] p-4 flex flex-row-reverse justify-between items-center w-full sm:w-[252px] h-[81.5px]">
                  <div className="text-2xl font-bold text-[#2A534F]">1</div>
                  <div className="text-gray-600 text-sm mt-1">
                     Aktiv elanların sayı
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
      <div className="mt-8 w-full max-w-[1920px] mx-auto px-4 lg:px-0">
      <h2 className="text-xl font-semibold text-[#2A534F] mb-4 max-w-[1127px] mx-auto">
        Elanlarım
      </h2>
      {loadingAnnouncements ? (
        <div className="flex justify-center items-center py-8">
          <span className="loader"></span>
        </div>
      ) : userAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[100px]">
          <svg
            width="80"
            height="80"
            fill="none"
            viewBox="0 0 24 24"
            className="mb-6 text-[#2A534F]"
          >
            <path
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-2xl font-semibold text-[#2A534F] mb-2 text-center">
            Elan yoxdur
          </span>
          <span className="text-[#7D7D7D] text-center mb-4">
            Siz hələ heç bir elan yerləşdirməmisiniz.
          </span>
          <button
            onClick={() => navigate('/elan-yerlesdir')}
            className="px-6 py-2 rounded-[16px] border border-[#A0A0A0] text-[#2A534F] bg-white hover:bg-[#2A534F] hover:text-white transition-colors"
            type="button"
          >
            Elan əlavə et
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-[20px] max-w-[1127px] mx-auto">
          {userAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-[16px] border border-[#A0A0A0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
            >
              {/* Edit Icon */}
              <button
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                onClick={() => handleEditClick(announcement)}
              >
                <MdEdit className="text-[#2A534F]" />
              </button>
              <div className="aspect-[4/3] bg-[#2A534F] relative">
                {announcement.cover_photo && (
                  <img
                    src={(() => {
                      let cover = announcement.cover_photo;
                      try {
                        if (
                          typeof cover === "string" &&
                          cover.startsWith("[")
                        ) {
                          const arr = JSON.parse(cover);
                          if (arr.length > 0) cover = arr[0];
                        }
                      } catch { /* ignore JSON parse error */ }
                      return cover.startsWith("http")
                        ? cover
                        : `https://kobklaster.tw1.ru/storage/${cover.replace(
                            /^adverts\//,
                            "adverts/"
                          )}`;
                    })()}
                    alt={announcement.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-black">
                  {announcement.name}
                </h2>
              </div>
              <div className="p-4">
                <p className="text-[#2A534F] font-medium">
                  {announcement.service_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {announcement.cluster?.name}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      )}

{editModalOpen && editForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[2001] h-screen w-screen"
          style={{ height: "100vh", width: "100vw" }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg relative flex flex-col h-[100vh] lg:h-[90vh]"
            style={{  maxHeight: "100vh" }}
          >
            <div className="flex justify-between items-center w-full p-[16px]">
              <h2 className="text-xl font-semibold">Elanı Redaktə Et</h2>
              <button
                className=" text-gray-500 z-10"
                onClick={() => setEditModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <form onSubmit={handleEditFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Ad</label>
                  <input
                    name="name"
                    value={editForm.name || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Cover Photo
                  </label>
                  <input
                    type="file"
                    name="cover_photo"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="w-full border rounded p-2"
                  />
                  {/* Show current cover photo if exists */}
                  {editForm.cover_photo &&
                    !(editForm.cover_photo instanceof File) && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Current cover photo:
                        </p>
                        <img
                          src={
                            typeof editForm.cover_photo === "string" &&
                            editForm.cover_photo.startsWith("http")
                              ? editForm.cover_photo
                              : `https://kobklaster.tw1.ru/storage/${editForm.cover_photo.replace(
                                  /^adverts\//,
                                  "adverts/"
                                )}`
                          }
                          alt="Current Cover"
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Images</label>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="w-full border rounded p-2"
                  />
                  {/* Show current images if they exist */}
                  {editForm.images &&
                    !(
                      Array.isArray(editForm.images) &&
                      editForm.images[0] instanceof File
                    ) && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Current images:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const images =
                                typeof editForm.images === "string"
                                  ? JSON.parse(editForm.images)
                                  : editForm.images;
                              return images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={`https://kobklaster.tw1.ru/storage/${img.replace(
                                    /^adverts\//,
                                    "adverts/"
                                  )}`}
                                  alt={`Current ${idx + 1}`}
                                  className="w-16 h-12 object-cover rounded border"
                                />
                              ));
                            } catch { return null; }
                          })()}
                        </div>
                      </div>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Açıqlama</label>
                  <textarea
                    name="text"
                    value={editForm.text}
                    onChange={handleEditFormChange}
                    className="w-full border rounded p-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Xidmət</label>
                  <input
                    name="service_name"
                    value={editForm.service_name}
                    onChange={handleEditFormChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Website</label>
                  <input
                    name="website"
                    value={editForm.website}
                    onChange={handleEditFormChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cluster</label>
                  <CustomSelect
                    value={editForm.cluster_id}
                    onChange={handleClusterChange}
                    options={clusters}
                    placeholder={
                      language === "az"
                        ? "Klaster"
                        : language === "en"
                        ? "Cluster"
                        : "Кластер"
                    }
                    openDirection="up"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Zones</label>
                  <CustomSelect
                    value={editForm.zones}
                    onChange={handleZonesChange}
                    options={zones}
                    placeholder={
                      language === "az"
                        ? "Zonalar"
                        : language === "en"
                        ? "Zones"
                        : "Зоны"
                    }
                    isMulti={true}
                    openDirection="up"
                  />
                  {/* Show selected zone names */}
                  {/* {Array.isArray(editForm.zones) && editForm.zones.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {zones
                        .filter(z => editForm.zones.includes(z.id))
                        .map(z => (
                          <span key={z.id} className="bg-[#2A534F] text-white px-2 py-1 rounded text-xs">
                            {z.name[language] || z.name.az}
                          </span>
                        ))}
                    </div>
                  )} */}
                </div>
              </form>
            </div>
            <div className="w-full p-[16px]">
              <button
                type="submit"
                className="w-full bg-[#2A534F] text-white rounded p-2 font-semibold"
                onClick={handleEditFormSubmit}
              >
                Yadda saxla
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
