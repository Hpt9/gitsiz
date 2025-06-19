import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { CustomSelect } from "../announcements/PlaceAnnoucement";

import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../components/expoted_images";
import { HiOutlineLogout } from "react-icons/hi";
import useLanguageStore from "../../store/languageStore";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdOutlineModeEdit } from "react-icons/md";
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [zones, setZones] = useState([]);
  const { language } = useLanguageStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      } catch (error) {
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

  // Fetch clusters and zones for dropdowns
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
      } catch (e) {
        // handle error
      }
    };
    fetchData();
  }, []);

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

  // Open modal and set form data
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

  // Handle form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle CustomSelect changes
  const handleClusterChange = (val) => {
    setEditForm((prev) => ({ ...prev, cluster_id: val }));
  };

  const handleZonesChange = (val) => {
    setEditForm((prev) => ({ ...prev, zones: val }));
  };

  // Handle submit
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
  

  // Handle file input changes
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

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await axios.post(
        "https://kobklaster.tw1.ru/api/user/password/request-change",
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.warning("Şifrə dəyişdirilməsi üçün e-poçt ünvanınıza göndərilən linki təsdiq edin.");
      setShowChangePassword(false);
      setPasswordForm({ password: "", password_confirmation: "" });
    } catch (error) {
      toast.error("Şifrə dəyişdirilə bilmədi!");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)]">
        <span className="loader"></span>
      </div>
    ); // Optional: Add a loading state
  }
  if (!user) return null;

  return (
    <div className="w-full ">
      <div className="blog_header w-full mobile:pt-[0px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)]">
        <div className="flex flex-col items-start justify-between w-full max-w-[1920px] mx-auto">
          <h1 className="mobile:text-[32px] lg:text-[61px] font-bold text-[rgb(255,255,255)] relative z-[2]">
            Profil
          </h1>
        </div>
      </div>

      <div className="blog_content flex items-center justify-center mobile:flex-col  mobile:gap-y-[68px] lg:gap-x-[100px] 2xl:gap-x-[300px] mobile:py-[32px] lg:py-[112px] w-full bg-[rgb(255,255,255)] mobile:px-[16px] lg:px-[100px] min-h-[calc(100vh-783px)]">
        <div className="w-full flex flex-row max-w-[1920px] mx-auto">
          <div className=" rounded-b-[8px] w-full max-w-[1920px]">
            <div className="flex flex-col items-start gap-y-[24px]">
              <div className="flex  items-center w-full gap-x-[16px]">
                <h2 className="text-[20px] font-semibold text-[#2A534F]">
                  {isEditing ? "Redaktə et" : "Şəxsi məlumatlarım"}
                </h2>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="text-[14px] text-[#2A534F] hover:text-[#1a3331]"
                  >
                    Redaktə et
                  </button>
                )}
              </div>

              <div className="flex items-center gap-x-[16px]">
                <div className="w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="w-full max-w-[500px] space-y-[16px]">
                <div className="space-y-[8px]">
                  <label className="text-[14px] text-gray-600">Ad, soyad</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                    />
                  ) : (
                    <p className="text-[14px]">{profileData.fullName}</p>
                  )}
                </div>

                <div className="space-y-[8px]">
                  <label className="text-[14px] text-gray-600">
                    E-poçt ünvanı
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                    />
                  ) : (
                    <p className="text-[14px]">{profileData.email}</p>
                  )}
                </div>

                <div className="space-y-[8px]">
                  <label className="text-[14px] text-gray-600">
                    Mobil nömrə
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                    />
                  ) : (
                    <>
                      <p className="text-[14px]">{profileData.phone}</p>
                      {!profileData.phone && (
                        <p className="text-[14px] text-gray-400">
                          Telefon nömrəsi daxil edin
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              {/* <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center p-[12px] bg-[#fff0f0] text-[#d32f2f] rounded-[8px] font-semibold hover:bg-[#ffeaea] transition-colors mt-2"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Çıxış
              </button> */}

              {isEditing && (
                <div className="flex gap-x-[16px] w-full max-w-[500px]">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 p-[12px] border border-[#2A534F] text-[#2A534F] rounded-[4px] hover:bg-gray-50"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex-1 p-[12px] bg-[#977F2E] text-white rounded-[4px] hover:bg-[#876f29]"
                  >
                    Yadda saxla
                  </button>
                </div>
              )}

              {!showChangePassword ? (
                <button
                  className="mt-4 bg-[#2A534F] text-white rounded p-2 font-semibold"
                  onClick={() => setShowChangePassword(true)}
                >
                  Şifrəni dəyiş
                </button>
              ) : (
                <form
                  onSubmit={handleChangePasswordSubmit}
                  className="flex flex-col gap-2 mt-4 max-w-xs"
                >
                  <input
                    type="password"
                    placeholder="Yeni şifrə"
                    value={passwordForm.password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        password: e.target.value,
                      }))
                    }
                    className="w-full border rounded p-2"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Yeni şifrəni təsdiqlə"
                    value={passwordForm.password_confirmation}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        password_confirmation: e.target.value,
                      }))
                    }
                    className="w-full border rounded p-2"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#2A534F] text-white rounded p-2 font-semibold"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Yüklənir..." : "Yadda saxla"}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded p-2 font-semibold"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({
                          password: "",
                          password_confirmation: "",
                        });
                      }}
                    >
                      Ləğv et
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* User's Announcements */}
        <div className="mt-8 w-full max-w-[1920px] mx-auto">
          <h2 className="text-xl font-semibold text-[#2A534F] mb-4">
            Elanlarım
          </h2>
          {loadingAnnouncements ? (
            <div className="flex justify-center items-center py-8">
              <span className="loader"></span>
            </div>
          ) : userAnnouncements.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Elan yoxdur.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-[20px]">
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
                          } catch {}
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
                    <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
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
      </div>

      {/* Edit Modal */}
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
                            } catch (e) {
                              return null;
                            }
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
    </div>
  );
};
