import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LOGO from "../assets/Logo.svg";
import { FaChevronDown } from "react-icons/fa";
import { CustomDropDown } from "./CustomDropDown";
import IMZA from "../assets/imza.svg";
import axios from "axios";
import { base_url } from "./expoted_images";
import useLanguageStore from "../store/languageStore";
import PropTypes from "prop-types";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { menuCache } from "../utils/menuCache";
import useUserStore from "../store/userStore";

const AccordionMenu = ({ name, options, setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let lastWidth = window.innerWidth;
    const breakpoint = 1024;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (
        (lastWidth < breakpoint && currentWidth >= breakpoint) ||
        (lastWidth >= breakpoint && currentWidth < breakpoint)
      ) {
        setMenuOpen(false);
      }
      lastWidth = currentWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="border-b border-[#468781] pb-[16px] relative z-[2000]">
      <div
        className="text-white text-lg cursor-pointer flex items-center justify-between px-[16px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {name}
        <FaChevronDown
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={
          isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="ml-4 mt-[16px] flex flex-col gap-2 px-[16px]">
          {options.map((option, index) => (
            <div
              key={index}
              className="text-white text-base cursor-pointer text-[rgba(202,202,202,1)]"
              onClick={() => {
                setMenuOpen(false);
                navigate(option.link);
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

AccordionMenu.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    })
  ).isRequired,
  setMenuOpen: PropTypes.func.isRequired,
};

// Add this function before the Navbar component
const transformMenuData = (menuData, language) => {
  // Get main menu items (parent_id: null)
  const mainMenus = menuData
    .filter((item) => !item.parent_id)
    .sort((a, b) => a.order - b.order);

  // Transform data to match navbar structure
  return mainMenus.map((mainItem) => {
    const children = menuData
      .filter((item) => item.parent_id === mainItem.id)
      .sort((a, b) => a.order - b.order)
      .map((child) => ({
        name: child.title[language] || Object.values(child.title)[0],
        link: child.url,
      }));

    return {
      name: mainItem.title[language] || Object.values(mainItem.title)[0],
      is_dropdown: children.length > 0,
      link: mainItem.url,
      ...(children.length > 0 && { options: children }),
    };
  });
};

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarMenus, setNavbarMenus] = useState([]);
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Add memoization to prevent unnecessary fetches
  const fetchMenus = React.useCallback(async () => {
    try {
      // Check cache first
      const cachedData = menuCache.get();
      if (cachedData) {
        setNavbarMenus(transformMenuData(cachedData, language));
        return;
      }

      const response = await axios.get(`${base_url}/menus/2`);
      const menuData = response.data;

      // Cache the raw data
      menuCache.set(menuData);

      // Transform and set the menu data
      setNavbarMenus(transformMenuData(menuData, language));
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  }, [language]);

  // Use useEffect with proper dependencies
  useEffect(() => {
    const controller = new AbortController();
    fetchMenus();
    return () => controller.abort(); // Cleanup pending requests
  }, [fetchMenus]);

  useEffect(() => {
    if (menuOpen) {
      // Prevent scrolling on the main content
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    return () => {
      // Cleanup
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(
        "https://kobklaster.tw1.ru/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      // Optionally handle error
    }
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="relative w-full">
      <div className="bg-[#30615C] w-full h-[64px] mt-[16px] flex items-center mobile:justify-between lg:justify-end mobile:px-[16px] lg:px-[50px] xl:px-[100px]">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <p className="text-[rgba(227,227,227,1)] text-[12px] w-[230px]">
            {language === "az"
              ? "Sahibkarlığın inkişafı Azərbaycanın ümumi inkişafının əsas şərtidir"
              : language === "en"
              ? "Development of entrepreneurship is the main condition for the development of Azerbaijan"
              : "Развитие предпринимательства является основным условием для развития Азербайджана"}
          </p>
          <div className="flex items-center gap-4 relative">
            <img src={IMZA} alt="imza" />
          </div>
        </div>
      </div>
      <div className="flex items-center bg-[rgb(42,83,79)] justify-between mobile:px-[16px] lg:px-[50px] xl:px-[100px] py-4  mobile:flex-row-reverse lg:flex-row relative z-[2000]">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-x-[64px]">
            <img
              src={LOGO}
              alt="kob_logo"
              className="mobile:w-[24px] lg:w-[45px]"
            />
            <div className="hidden xl:flex lg:gap-5 xl:gap-8">
              {navbarMenus.map((menu, index) =>
                menu.is_dropdown ? (
                  <CustomDropDown
                    key={index}
                    name={menu.name}
                    options={menu.options}
                    isLanguage={false}
                  />
                ) : (
                  <div
                    key={index}
                    className="text-white text-[14px] cursor-pointer flex items-center"
                    onClick={() => navigate(menu.link)}
                  >
                    {menu.name}
                  </div>
                )
              )}
              <div
                className="text-white text-[14px] cursor-pointer flex items-center"
                onClick={() => navigate("/elanlar")}
              >
                Elanlar
              </div>
            </div>
          </div>
          <GiHamburgerMenu
            className="w-6 h-6 text-white xl:hidden cursor-pointer z-[1000]"
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>
      </div>

      {/* Mobile Menu Container */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[200000] pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header Space */}
            <div className="h-[162px] bg-transparent" />

            {/* Menu Content */}
            <motion.div className="w-full h-[calc(100%-162px)] bg-[rgb(42,83,79)] text-white flex flex-col justify-between overflow-hidden pointer-events-auto">
              <div className="flex flex-col gap-[16px] p-[16px] overflow-y-auto">
                {navbarMenus.map((menu, index) =>
                  menu.is_dropdown ? (
                    <AccordionMenu
                      key={index}
                      name={menu.name}
                      options={menu.options}
                      setMenuOpen={setMenuOpen}
                    />
                  ) : (
                    <div
                      key={index}
                      className="text-lg cursor-pointer pb-[16px] border-b border-[#468781]"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(menu.link);
                      }}
                    >
                      <p className="pl-[16px]">{menu.name}</p>
                    </div>
                  )
                )}
                <div
                  className="text-white text-[14px] cursor-pointer flex items-center"
                  onClick={() => navigate("/elanlar")}
                >
                  Elanlar
                </div>
              </div>

              {/* Language and Auth Buttons */}
              <div className="p-6 bg-[rgb(42,83,79)]">
                {/* Auth Buttons */}
                <div className="flex gap-2">
                  {user ? (
                    <div className="flex flex-col w-full">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/elan-yerlesdir");
                          }}
                          className="flex-1 h-[48px] bg-[white] text-[#967D2E] font-bold rounded-[12px] hover:bg-gray-100 transition-colors"
                        >
                          Elan yerləşdir
                          <span className="ml-2 text-xl font-bold">+</span>
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/profile");
                          }}
                          className="flex-1 h-[48px] bg-[#967D2E] text-white font-bold rounded-[12px] flex items-center justify-center hover:bg-[#876f29] transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="h-[48px] bg-red-600 text-white font-bold rounded-[12px] flex items-center justify-center hover:bg-red-700 transition-colors mt-2"
                      >
                        Çıxış
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/daxil-ol");
                        }}
                        className="flex-1 h-[48px] bg-[white] text-[#967D2E] font-bold rounded-[12px] hover:bg-gray-100 transition-colors"
                      >
                        Daxil Ol
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/qeydiyyat");
                        }}
                        className="flex-1 h-[48px] bg-[#967D2E] text-white font-bold rounded-[12px] hover:bg-[#876f29] transition-colors"
                      >
                        Qeydiyyat
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {/* <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="fixed inset-0 top-[162px] bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence> */}
    </div>
  );
};
