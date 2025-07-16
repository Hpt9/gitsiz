import { useEffect, useState, useRef } from "react";
import useLanguageStore from "../../store/languageStore";
import { updatePageTitle } from "../../utils/updatePageTitle";
import { CustomSelect } from "./PlaceAnnoucement";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSwitchVertical } from "react-icons/hi";

export const Annoucements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    cluster: "",
    region: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    zone: "",
  });
  const [zones, setZones] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Debounced live search
  const searchTimeout = useRef();
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAnnouncements(1, filters);
    }, 1000);
    return () => clearTimeout(searchTimeout.current);
  }, [filters.search]);

  useEffect(() => {
    updatePageTitle("Elanlar");
    fetchData();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const [filterResponse, zonesResponse] = await Promise.all([
        fetch("https://kobklaster.tw1.ru/api/filter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            economical_zone_id: [],
            method_id: [],
            cluster_id: [],
          }),
        }),
        axios.get("https://kobklaster.tw1.ru/api/economical-zones"),
      ]);

      const filterData = await filterResponse.json();

      // Create a Map to store unique clusters using cluster ID as key
      const clusterMap = new Map();
      filterData.forEach((item) => {
        if (item.cluster && item.cluster[0]) {
          clusterMap.set(item.cluster[0].id, item.cluster[0]);
        }
      });

      // Convert Map to array and sort by name
      const uniqueClusters = Array.from(clusterMap.values()).sort((a, b) => {
        const nameA = a.name.az || "";
        const nameB = b.name.az || "";
        return nameA.localeCompare(nameB);
      });

      setClusters(uniqueClusters);

      // Extract and flatten all zones from the response
      const allZones = zonesResponse.data.reduce((acc, region) => {
        if (region.zones && Array.isArray(region.zones)) {
          return [...acc, ...region.zones];
        }
        return acc;
      }, []);

      // Sort zones by name
      const sortedZones = allZones.sort((a, b) => {
        const nameA = a.name.az || "";
        const nameB = b.name.az || "";
        return nameA.localeCompare(nameB);
      });

      setZones(sortedZones);

      // Sort regions by name
      const sortedRegions = zonesResponse.data.sort((a, b) => {
        const nameA = a.name.az || "";
        const nameB = b.name.az || "";
        return nameA.localeCompare(nameB);
      });
      setRegions(sortedRegions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async (page = 1, customFilters = filters) => {
    setLoading(true);
    try {
      const body = {
        cluster_ids: customFilters.cluster ? [customFilters.cluster] : [],
        zone_ids: customFilters.zone ? [customFilters.zone] : [],
        economical_zone_ids: customFilters.region ? [customFilters.region] : [],
        text: customFilters.search || null,
        page: page,
      };
      const response = await axios.post(
        `https://kobklaster.tw1.ru/api/advert-filter?page=${page}`,
        body
      );
      setAnnouncements(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchAnnouncements(page);
  };

  const { language } = useLanguageStore();

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      // Add console logging for region, cluster, and zone selections
      // if (field === 'region') {
      //   console.log('Selected Region:', value);
      // } else if (field === 'cluster') {
      //   console.log('Selected Cluster:', value);
      // } else if (field === 'zone') {
      //   console.log('Selected Zone ID:', value);
      // }
      // Fetch announcements with new filters
      fetchAnnouncements(1, updated);
      return updated;
    });
  };

  const handleAnnouncementClick = (slug) => {
    navigate(`/elanlar/${slug}`);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
    // Prevent scrolling when filter is open
    if (!isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  // Clean up the body style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getCoverPhoto = (coverPhoto) => {
    if (!coverPhoto) return null;
    let cover = coverPhoto;
    try {
      if (typeof coverPhoto === "string" && coverPhoto.startsWith("[")) {
        const arr = JSON.parse(coverPhoto);
        if (arr.length > 0) cover = arr[0];
      }
    } catch {
      // ignore
    }
    return cover.startsWith("http")
      ? cover
      : `https://kobklaster.tw1.ru/storage/${cover.replace(
          /^adverts\//,
          "adverts/"
        )}`;
  };

  // Add this function to reset all filters
  const handleResetFilters = () => {
    const defaultFilters = {
      cluster: "",
      region: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      zone: "",
    };
    setFilters(defaultFilters);
    fetchAnnouncements(1, defaultFilters);
  };

  const handleSearchInput = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  // if (loading && announcements.length === 0) {
  //   // Only show full-page loader on initial load
  //   return (
  //     <div className="flex justify-center items-center h-[50vh]">
  //       <span className="loader"></span>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full min-h-[calc(100vh-492px)] min-h-[1024px]">
      {/* Mobile Filter Menu */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            className="lg:hidden w-full h-[100vh] bg-[rgba(0,0,0,.2)] fixed bottom-0 left-0 z-[2001]"
            onClick={toggleMobileFilter}
          >
            <div className="overlay" onClick={(e) => e.stopPropagation()}></div>
            <motion.div
              className="bg-white h-[650px] rounded-t-[16px] w-full fixed bottom-[-200px] left-0 py-[32px] px-[16px]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100) {
                  toggleMobileFilter();
                }
              }}
            >
              {/* Draggable Handle */}
              <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[48px] h-[4px] bg-[#E6E6E6] rounded-full cursor-grab active:cursor-grabbing" />
              <p className="text-center text-[#2A534F] text-[16px] mb-[32px]">
                Ətraflı bax
              </p>
              <div className="w-full grid grid-cols-3">
                <div className="w-full h-[40px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] rounded-l-[8px] flex items-center justify-center">
                  Lorem
                </div>
                <div className="w-full h-[40px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] flex items-center justify-center">
                  Lorem
                </div>
                <div className="w-full h-[40px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] rounded-r-[8px] flex items-center justify-center">
                  Lorem
                </div>
              </div>
              <div className="min_max w-full flex mt-[16px]">
                <input
                  type="number"
                  placeholder="Min"
                  className="px-[16px] w-[50%] py-[12px] rounded-tl-[12px] rounded-bl-[12px] border border-[#A0A0A0] outline-none focus:border-[#2A534F]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="px-[16px] w-[50%] py-[12px] rounded-tr-[12px] rounded-br-[12px] border border-[#A0A0A0] outline-none focus:border-[#2A534F]"
                />
              </div>
              <div className="w-full grid grid-cols-2 grid-rows-2 gap-[16px] mt-[16px]">
                <div className="w-full">
                  <CustomSelect
                    value={filters.region}
                    onChange={(value) => handleFilterChange("region", value)}
                    options={regions}
                    placeholder={
                      language === "az"
                        ? "Rayon"
                        : language === "en"
                        ? "Region"
                        : "Район"
                    }
                    openDirection={isMobile ? "up" : "down"}
                  />
                </div>
                <div className="w-full">
                  <CustomSelect
                    value={filters.cluster}
                    onChange={(value) => handleFilterChange("cluster", value)}
                    options={clusters}
                    placeholder={
                      language === "az"
                        ? "Klaster"
                        : language === "en"
                        ? "Cluster"
                        : "Кластер"
                    }
                    openDirection={isMobile ? "up" : "down"}
                  />
                </div>
                <div className="w-full">
                  <CustomSelect
                    value={filters.zone}
                    onChange={(value) => handleFilterChange("zone", value)}
                    options={zones}
                    placeholder={
                      language === "az"
                        ? "Zona"
                        : language === "en"
                        ? "Zone"
                        : "Зона"
                    }
                    openDirection={isMobile ? "up" : "down"}
                  />
                </div>
                <div className="w-full">
                  <CustomSelect
                    value={filters.region}
                    onChange={(value) => handleFilterChange("region", value)}
                    options={regions}
                    placeholder={
                      language === "az"
                        ? "Rayon"
                        : language === "en"
                        ? "Region"
                        : "Район"
                    }
                    openDirection={isMobile ? "up" : "down"}
                  />
                </div>
              </div>
              <div className="w-full flex flex-col items-center gap-[12px] mt-[16px]">
                <div className="w-full flex items-center gap-[12px]">
                  <button className="w-[50%] h-[40px] bg-[#2A534F] text-[white] rounded-[8px]">
                    Lorem
                  </button>
                  <button
                    onClick={toggleMobileFilter}
                    className="w-[50%] h-[40px] bg-[#2A534F] text-[white] rounded-[8px]"
                  >
                    Elanları göstər
                  </button>
                </div>
                {/* Reset Filters Button for mobile */}
                <button
                  onClick={handleResetFilters}
                  className="w-full h-[40px] mt-2 bg-[#A0A0A0] text-white rounded-[8px]"
                  type="button"
                >
                  {language === "az"
                    ? "Filtrləri sıfırla"
                    : language === "en"
                    ? "Reset Filters"
                    : "Сбросить фильтры"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="announcements_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)] relative faq_header">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <h1 className="mobile:text-[32px] mobile:leading-[39px] lg:leading-[60px] lg:text-[61px] font-bold text-[rgb(255,255,255)] mobile:w-[224px] lg:w-[500px]">
            {language === "az"
              ? "Elanlar"
              : language === "en"
              ? "Announcements"
              : "Объявления"}
          </h1>
        </div>
      </div>

      <div className="announcements_container w-full flex flex-col items-center justify-center py-[32px] mobile:px-[16px] lg:px-[50px] xl:px-[100px]">
        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Elan axtar"
              className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] pl-[40px] pr-[16px] outline-none focus:border-[#2A534F] text-[14px] text-[#7D7D7D]"
              value={filters.search}
              onChange={handleSearchInput}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7D7D]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <button className="w-[48px] h-[48px] flex items-center justify-center border border-[#7D7D7D] rounded-[16px] text-[#7D7D7D] hover:border-[#2A534F] hover:text-[#2A534F]">
            <HiOutlineSwitchVertical className="w-5 h-5" />
          </button>
          <button
            onClick={toggleMobileFilter}
            className="w-[48px] h-[48px] flex items-center justify-center border border-[#7D7D7D] rounded-[16px] text-[#7D7D7D] hover:border-[#2A534F] hover:text-[#2A534F]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="w-full flex flex-col gap-y-[12px] justify-between md:mb-[50px] desktop-lg:mb-[0px]">
            <div className="w-full h-[50px] hidden lg:flex gap-x-[16px]">
              <div className="hidden h-[50px] lg:flex w-[600px] relative">
                <input
                  type="text"
                  placeholder="Elan axtar"
                  className="w-full h-[48px] rounded-[16px] border border-[#7D7D7D] pl-[40px] pr-[16px] outline-none focus:border-[#2A534F] text-[14px] text-[#7D7D7D]"
                  value={filters.search}
                  onChange={handleSearchInput}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7D7D]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <div className="w-full hidden h-[50px] lg:flex  flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-[129px]">
                    <CustomSelect
                      value={filters.region}
                      onChange={(value) => handleFilterChange("region", value)}
                      options={regions}
                      placeholder={
                        language === "az"
                          ? "Rayon"
                          : language === "en"
                          ? "Region"
                          : "Район"
                      }
                      openDirection={isMobile ? "up" : "down"}
                    />
                  </div>
                  <div className="w-[135px]">
                    <CustomSelect
                      value={filters.cluster}
                      onChange={(value) => handleFilterChange("cluster", value)}
                      options={clusters}
                      placeholder={
                        language === "az"
                          ? "Klaster"
                          : language === "en"
                          ? "Cluster"
                          : "Кластер"
                      }
                      openDirection={isMobile ? "up" : "down"}
                    />
                  </div>
                  <div className="w-[135px]">
                    <CustomSelect
                      value={filters.zone}
                      onChange={(value) => handleFilterChange("zone", value)}
                      options={zones}
                      placeholder={
                        language === "az"
                          ? "Zona"
                          : language === "en"
                          ? "Zone"
                          : "Зона"
                      }
                      openDirection={isMobile ? "up" : "down"}
                    />
                  </div>
                  {/* <div className="min_max w-[288px] flex">
                  <input
                    type="number"
                    placeholder="Min"
                    className="px-[16px] w-[50%] py-[12px] rounded-tl-[12px] rounded-bl-[12px] border border-[#A0A0A0] outline-none focus:border-[#2A534F]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="px-[16px] w-[50%] py-[12px] rounded-tr-[12px] rounded-br-[12px] border border-[#A0A0A0] outline-none focus:border-[#2A534F]"
                  />
                </div> */}
                  {/* Move Reset Filters Button here */}
                  <button
                    onClick={handleResetFilters}
                    className="h-[48px] px-4 rounded-[16px] border border-[#A0A0A0] text-[#2A534F] bg-white hover:bg-[#2A534F] hover:text-white transition-colors"
                    type="button"
                  >
                    {language === "az"
                      ? "Filtrləri sıfırla"
                      : language === "en"
                      ? "Reset Filters"
                      : "Сбросить фильтры"}
                  </button>
                  <button
                    onClick={() => navigate("/elan-yerlesdir")}
                    className="h-[48px] px-4 rounded-[16px] border border-[#A0A0A0] hover:border-[#2A534F]  hover:text-[#2A534F] hover:bg-white
                    bg-[#2A534F] text-white transition-colors"
                    type="button"
                  >
                    {language === "az"
                      ? "Elan əlavə et"
                      : language === "en"
                      ? "Add Announcement"
                      : "Добавить объявление"}
                  </button>
                </div>

                {/* <div className="w-[288px] grid grid-cols-3">
                <div className="w-full h-[50px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] rounded-l-[8px] flex items-center justify-center">
                  Lorem
                </div>
                <div className="w-full h-[50px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] flex items-center justify-center">
                  Lorem
                </div>
                <div className="w-full h-[50px] bg-[white] hover:bg-[#2A534F] text-[#2A534F] hover:text-[white] border border-[#A0A0A0] rounded-r-[8px] flex items-center justify-center">
                  Lorem
                </div>
              </div> */}
              </div>
            </div>

            {/* Grid of Announcements */}
            <div className="w-full grid mobile:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px] mt-[40px]">
              {loading ? (
                <>
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[16px] border border-[#A0A0A0] overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-[#e0e0e0] relative flex items-end">
                      <div className="absolute bottom-4 left-4 w-2/3 h-6 bg-[#cccccc] rounded"></div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 w-1/2 bg-[#e0e0e0] rounded mb-2"></div>
                      <div className="h-3 w-1/3 bg-[#e0e0e0] rounded mb-2"></div>
                      <div className="h-3 w-1/4 bg-[#e0e0e0] rounded"></div>
                    </div>
                  </div>
                ))}
              </>
              ) : !loading && announcements.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
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
                    Axtarışa uyğun nəticə tapılmadı
                  </span>
                  <span className="text-[#7D7D7D] text-center mb-4">
                    Fərqli açar söz və ya filterlər yoxlayın.
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2 rounded-[16px] border border-[#A0A0A0] text-[#2A534F] bg-white hover:bg-[#2A534F] hover:text-white transition-colors"
                    type="button"
                  >
                    {language === "az"
                      ? "Filtrləri sıfırla"
                      : language === "en"
                      ? "Reset Filters"
                      : "Сбросить фильтры"}
                  </button>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-[16px] border border-[#A0A0A0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAnnouncementClick(announcement.slug)}
                  >
                    <div className="aspect-[4/3] bg-[#2A534F] relative">
                      {announcement.cover_photo && (
                        <img
                          src={getCoverPhoto(announcement.cover_photo)}
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
                ))
              )}
            </div>

            {/* Pagination */}
            {announcements.length > 0 && !loading && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-5 py-2 rounded-full border border-[#e0e0e0] bg-[#f7f7f7] shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] text-[#2A534F] font-semibold transition disabled:opacity-50"
                >
                  {language === "az"
                    ? "Öncəki"
                    : language === "en"
                    ? "Previous"
                    : "Предыдущий"}
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages = [];
                  const { current_page, last_page } = pagination;
                  let start = Math.max(1, current_page - 2);
                  let end = Math.min(last_page, current_page + 2);

                  if (current_page <= 3) {
                    end = Math.min(5, last_page);
                  }
                  if (current_page >= last_page - 2) {
                    start = Math.max(1, last_page - 4);
                  }

                  // Always show first page
                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className={`w-10 h-10 rounded-full border border-[#e0e0e0] bg-[#f7f7f7] shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] text-[#2A534F] font-semibold transition`}
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(
                        <span
                          key="start-ellipsis"
                          className="px-2 text-xl text-[#b0b0b0]"
                        >
                          ...
                        </span>
                      );
                    }
                  }

                  // Main page window
                  for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= last_page) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`w-10 h-10 rounded-full border border-[#e0e0e0] font-semibold transition
                            shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff]
                            ${
                              current_page === i
                                ? "bg-[#2A534F] text-white"
                                : "bg-[#f7f7f7] text-[#2A534F] hover:bg-[#e0e0e0]"
                            }
                          `}
                        >
                          {i}
                        </button>
                      );
                    }
                  }

                  // Always show last page
                  if (end < last_page) {
                    if (end < last_page - 1) {
                      pages.push(
                        <span
                          key="end-ellipsis"
                          className="px-2 text-xl text-[#b0b0b0]"
                        >
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={last_page}
                        onClick={() => handlePageChange(last_page)}
                        className={`w-10 h-10 rounded-full border border-[#e0e0e0] bg-[#f7f7f7] shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] text-[#2A534F] font-semibold transition`}
                      >
                        {last_page}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-5 py-2 rounded-full border border-[#e0e0e0] bg-[#f7f7f7] shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] text-[#2A534F] font-semibold transition disabled:opacity-50"
                >
                  {language === "az"
                    ? "Sonrakı"
                    : language === "en"
                    ? "Next"
                    : "Следующий"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
