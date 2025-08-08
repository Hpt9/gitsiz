import { useEffect, useState, useRef } from "react";
import useLanguageStore from "../../store/languageStore";
import { updatePageTitle } from "../../utils/updatePageTitle";
import useUserStore, { fetchUserProfile } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export const CustomSelect = ({ value, onChange, options, placeholder, className = "", isMulti = false, openDirection = "down" }) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguageStore();
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative rounded-[16px] border border-[#7D7D7D] ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[48px] rounded-[16px] bg-white text-[#2A534F]  px-[16px] flex items-center justify-between outline-none cursor-pointer mobile:text-[14px] lg:text-[16px]"
      >
        <span className="text-[#2A534F]">
          {isMulti
            ? (Array.isArray(value) && value.length > 0
                ? options
                    .filter(opt => value.includes(opt.id))
                    .map(opt => opt.name[language] || opt.name.az)
                    .join(', ')
                : placeholder)
            : (selectedOption ? (selectedOption.name[language] || selectedOption.name.az) : placeholder)
          }
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-[#2A534F] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute z-10 w-full bg-white rounded-[16px] border border-[#A0A0A0] shadow-lg max-h-[300px] overflow-y-auto
            ${openDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (isMulti) {
                  const newValue = Array.isArray(value)
                    ? (value.includes(option.id)
                        ? value.filter((id) => id !== option.id)
                        : [...value, option.id])
                    : [option.id];
                  onChange(newValue);
                } else {
                  onChange(option.id);
                }
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-[14px] hover:bg-[#2A534F] hover:text-white transition-colors ${
                Array.isArray(value)
                  ? value.includes(option.id)
                  : value === option.id
                  ? "bg-[#2A534F] text-white"
                  : "text-[#2A534F]"
              }`}
            >
              {option.name[language] || option.name.az}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

CustomSelect.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.number)
  ]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.shape({
        az: PropTypes.string,
        en: PropTypes.string,
        ru: PropTypes.string,
      }).isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string.isRequired,
  className: PropTypes.string,
  isMulti: PropTypes.bool,
  openDirection: PropTypes.string,
};

export const PlaceAnnoucement = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    service_name: "",
    website: "",
    text: "",
    cluster_id: "",
    zones: [],
    cover_photo: null,
    images: []
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    updatePageTitle("Place Annoucement");
    const checkUser = async () => {
      await fetchUserProfile();
      if (!user) {
        navigate("/daxil-ol");
      }
    };
    checkUser();
  }, [user, navigate, fetchUserProfile]);

  // Fetch clusters and regions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filterResponse, zonesResponse] = await Promise.all([
          fetch('https://kobklaster.tw1.ru/api/filter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              economical_zone_id: [],
              method_id: [],
              cluster_id: []
            })
          }),
          axios.get('https://kobklaster.tw1.ru/api/economical-zones')
        ]);

        const filterData = await filterResponse.json();
        
        // Create a Map to store unique clusters using cluster ID as key
        const clusterMap = new Map();
        filterData.forEach(item => {
          if (item.cluster && item.cluster[0]) {
            clusterMap.set(item.cluster[0].id, item.cluster[0]);
          }
        });
        
        // Convert Map to array and sort by name
        const uniqueClusters = Array.from(clusterMap.values()).sort((a, b) => {
          const nameA = a.name.az || '';
          const nameB = b.name.az || '';
          return nameA.localeCompare(nameB);
        });
        
        setClusters(uniqueClusters);
        
        // Sort regions and extract all zones
        const sortedRegions = zonesResponse.data.sort((a, b) => {
          const nameA = a.name.az || '';
          const nameB = b.name.az || '';
          return nameA.localeCompare(nameB);
        });
        setRegions(sortedRegions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { language } = useLanguageStore();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setFieldErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const handleSelectChange = (field, value) => {
    if (field === 'cluster_id') {
      setFormData(prev => ({
        ...prev,
        cluster_id: Number(value)
      }));
      setFieldErrors(prev => ({ ...prev, cluster_id: undefined }));
    } else if (field === 'zones') {
      const zoneIds = value.map(Number);
      setFormData(prev => ({
        ...prev,
        zones: zoneIds
      }));
      setSelectedZones(value);
      setFieldErrors(prev => ({ ...prev, zones: undefined }));
    }
  };

  const handleCoverPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        cover_photo: file,
      }));
      setFieldErrors(prev => ({ ...prev, cover_photo: undefined }));
    }
  };

  const handleAdditionalPhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: files,
      }));
      setFieldErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return; // Prevent double submit
    setSubmitLoading(true);
    // Client-side validation
    if (!formData.name.trim()) {
        toast.error("Başlıq boş ola bilməz");
        setSubmitLoading(false);
        return;
    }
    if (!formData.text.trim()) {
        toast.error("Mətn boş ola bilməz");
        setSubmitLoading(false);
        return;
    }
    if (formData.cluster_id <= 0) {
        toast.error("Klaster seçilməyib");
        setSubmitLoading(false);
        return;
    }
    if (formData.zones.length === 0) {
        toast.error("Zonalar seçilməyib");
        setSubmitLoading(false);
        return;
    }
    if (formData.cover_photo === null) {
        toast.error("Örtük şəkli yüklənməyib");
        setSubmitLoading(false);
        return;
    }
    if (formData.images.length === 0) {
        toast.error("Əlavə şəkillər yüklənməyib");
        setSubmitLoading(false);
        return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('service_name', formData.service_name);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('text', formData.text);
      formDataToSend.append('cluster_id', formData.cluster_id);
      formData.zones.forEach(zoneId => {
        formDataToSend.append('zones[]', zoneId);
      });
      if (formData.cover_photo) {
        formDataToSend.append('cover_photo', formData.cover_photo);
      }
      if (formData.images.length > 0) {
        formData.images.forEach(image => {
          formDataToSend.append('images[]', image);
        });
      }
      const token = useUserStore.getState().token;
      const response = await axios.post('https://kobklaster.tw1.ru/api/adverts/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.data) {
        toast.warning(
          language === "az"
            ? "Elanınız qeyd olundu. Təsdiq alındıqdan sonra yerləşdiriləcək."
            : language === "en"
            ? "Your announcement has been recorded. It will be placed after approval."
            : "Ваше объявление записано. Оно будет размещено после утверждения.",
          { position: "top-right", autoClose: 3000 }
        );
        setTimeout(() => navigate('/elanlar'), 3000);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFieldErrors(error.response.data.errors || {});
      } else {
        setFieldErrors({});
        toast.error('Elan yerləşdirilərkən xəta baş verdi!');
      }
      console.error('Error creating announcement:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <ToastContainer />
      <motion.div 
        className="announcements_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)] relative faq_header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h1 className="mobile:text-[32px] mobile:leading-[39px] lg:leading-[60px] lg:text-[61px] font-bold text-[rgb(255,255,255)] mobile:w-[224px] lg:w-[700px]">
          {language === "az"
            ? "Elanın məlumatlarını daxil edin"
            : language === "en"
            ? "Enter Announcement Details"
            : "Введите детали объявления"}
        </h1>
      </motion.div>
      <div className="w-full flex flex-col items-center justify-center py-[32px] px-[16px]">
        <form
          onSubmit={handleSubmit}
          className="mobile:w-full lg:w-[800px] flex flex-col gap-y-[16px] lg:flex-row gap-x-[24px]"
        >
          <div className="flex w-full lg:w-[50%] flex-col gap-y-[8px]">
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={language === "az" ? "Elan başlığı" : language === "en" ? "Announcement title" : "Заголовок объявления"}
              className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.name ? 'border-red-500' : 'border-[#7D7D7D]'}`}
            />
            {fieldErrors.name && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</div>
            )}
            <input
              type="text"
              id="service_name"
              value={formData.service_name}
              onChange={handleChange}
              placeholder={language === "az" ? "Xidmət" : language === "en" ? "Service" : "Услуга"}
              className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.service_name ? 'border-red-500' : 'border-[#7D7D7D]'}`}
            />
            {fieldErrors.service_name && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.service_name[0]}</div>
            )}
            <input
              type="text"
              id="website"
              value={formData.website}
              onChange={handleChange}
              placeholder={language === "az" ? "Vebsayt" : language === "en" ? "Website" : "Вебсайт"}
              className={`w-full h-[48px] rounded-[16px] border px-[16px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] ${fieldErrors.website ? 'border-red-500' : 'border-[#7D7D7D]'}`}
            />
            {fieldErrors.website && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.website[0]}</div>
            )}
            <CustomSelect
              value={formData.cluster_id}
              onChange={(value) => handleSelectChange("cluster_id", value)}
              options={clusters}
              placeholder={language === "az" ? "Klaster" : language === "en" ? "Cluster" : "Кластер"}
              className={fieldErrors.cluster_id ? 'border border-red-500' : ''}
            />
            {fieldErrors.cluster_id && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.cluster_id[0]}</div>
            )}
            <CustomSelect
              value={selectedZones}
              onChange={(value) => handleSelectChange("zones", value)}
              options={regions.flatMap(region => region.zones || [])}
              placeholder={language === "az" ? "Zonalar" : language === "en" ? "Zones" : "Зоны"}
              isMulti={true}
              className={fieldErrors.zones ? 'border border-red-500' : ''}
            />
            {fieldErrors.zones && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.zones[0]}</div>
            )}
          </div>
          <div className="flex flex-col w-full lg:w-[50%] gap-y-[16px]">
            <textarea
              id="text"
              value={formData.text}
              onChange={handleChange}
              placeholder={language === "az" ? "Əlavə məlumat" : language === "en" ? "Additional information" : "Дополнительная информация"}
              className={`w-full h-[60%] rounded-[16px] border px-[16px] py-[12px] outline-none focus:border-[#2A534F] placeholder:text-[14px] placeholder:text-[#7D7D7D] resize-none ${fieldErrors.text ? 'border-red-500' : 'border-[#7D7D7D]'}`}
            />
            {fieldErrors.text && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.text[0]}</div>
            )}
            {/* Cover Photo Upload */}
            <div className="w-full">
              <label
                htmlFor="cover-photo-upload"
                className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-[14px] text-[#7D7D7D]">
                  {formData.cover_photo
                    ? formData.cover_photo.name
                    : language === "az"
                    ? "Örtük şəkli yüklə"
                    : language === "en"
                    ? "Upload cover photo"
                    : "Загрузить обложку"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-[#7D7D7D]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="cover-photo-upload"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                className={`hidden ${fieldErrors.cover_photo ? 'border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.cover_photo && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.cover_photo[0]}</div>
            )}
            {/* Additional Photos Upload */}
            <div className="w-full">
              <label
                htmlFor="additional-photos-upload"
                className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] px-[16px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-[14px] text-[#7D7D7D]">
                  {formData.images.length > 0
                    ? `${formData.images.length} ${
                        language === "az"
                          ? "şəkil seçildi"
                          : language === "en"
                          ? "photos selected"
                          : "фото выбрано"
                      }`
                    : language === "az"
                    ? "Əlavə şəkillər yüklə"
                    : language === "en"
                    ? "Upload additional photos"
                    : "Загрузить дополнительные фото"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-[#7D7D7D]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="additional-photos-upload"
                accept="image/*"
                multiple
                onChange={handleAdditionalPhotosUpload}
                className={`hidden ${fieldErrors.images ? 'border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.images && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.images[0]}</div>
            )}
          </div>
        </form>
        <button
          onClick={handleSubmit}
          className="mobile:w-full lg:w-[800px] h-[48px] bg-[#967D2E] text-white font-bold rounded-[16px] hover:bg-[#876f29] transition-colors mt-[16px] flex items-center justify-center"
          disabled={submitLoading}
        >
          {submitLoading ? (
            <span className="flex items-center justify-center">
              <span className="loader2 w-[20px] h-[20px]"></span>
              <span className="ml-[8px]">
                {language === "az" ? "Yerləşdirilir..." : language === "en" ? "Submitting..." : "Отправка..."}
              </span>
            </span>
          ) : (
            language === "az" ? "Tamamla" : language === "en" ? "Complete" : "Завершить"
          )}
        </button>
      </div>
    </motion.div>
  );
};
