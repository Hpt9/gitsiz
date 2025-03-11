import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LOGO from "../assets/Logo.svg";
import { FaChevronDown } from "react-icons/fa";
import {CustomDropDown} from "./CustomDropDown";
import IMZA from "../assets/imza.svg";
import axios from "axios";
import { base_url } from "./expoted_images";
import useLanguageStore from '../store/languageStore';
import PropTypes from 'prop-types';
import { AnimatePresence } from "framer-motion";
import React from "react";
import { menuCache } from "../utils/menuCache";

const AccordionMenu = ({ name, options, setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="ml-4 mt-[16px] flex flex-col gap-2 px-[16px]">
          {options.map((option, index) => (
            <div
              key={index}
              className="text-white text-base cursor-pointer text-[rgba(202,202,202,1)]"
              onClick={() => {setMenuOpen(false);navigate(option.link)}}
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
      link: PropTypes.string.isRequired
    })
  ).isRequired,
  setMenuOpen: PropTypes.func.isRequired
};

// Add this function before the Navbar component
const transformMenuData = (menuData, language) => {
  // Get main menu items (parent_id: null)
  const mainMenus = menuData
    .filter(item => !item.parent_id)
    .sort((a, b) => a.order - b.order);

  // Transform data to match navbar structure
  return mainMenus.map(mainItem => {
    const children = menuData
      .filter(item => item.parent_id === mainItem.id)
      .sort((a, b) => a.order - b.order)
      .map(child => ({
        name: child.title[language] || Object.values(child.title)[0],
        link: child.url
      }));

    return {
      name: mainItem.title[language] || Object.values(mainItem.title)[0],
      is_dropdown: children.length > 0,
      link: mainItem.url,
      ...(children.length > 0 && { options: children })
    };
  });
};

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'az', name: 'AZ' },
    { code: 'en', name: 'EN' },
    { code: 'ru', name: 'RU' }
  ];

  return (
    <div className="relative mobile:hidden lg:flex">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-gray-200"
      >
        {languages.find(lang => lang.code === language)?.name}
        <FaChevronDown
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100
                ${language === lang.code ? 'text-[#2A534F] font-bold' : 'text-gray-700'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarMenus, setNavbarMenus] = useState([]);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();

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
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    }

    return () => {
      // Cleanup
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [menuOpen]);

  return (
    <div className="relative">
      <div className="bg-[#30615C] w-full h-[64px] mt-[16px] flex items-center mobile:justify-between lg:justify-end px-[16px] lg:px-[100px]">
        <p className="text-[rgba(227,227,227,1)] text-[12px] w-[230px]">
          {language === 'az' ? 'Sahibkarlığın inkişafı Azərbaycanın ümumi inkişafının əsas şərtidir' : 
           language === 'en' ? 'Development of entrepreneurship is the main condition for the development of Azerbaijan' : 
           'Развитие предпринимательства является основным условием для развития Азербайджана'}
        </p>
        <div className="flex items-center gap-4">
          <img src={IMZA} alt="imza" />
          
        </div>
      </div>
      <div className="flex items-center bg-[rgb(42,83,79)] justify-between mobile:px-[16px] lg:px-[100px] py-4  mobile:flex-row-reverse lg:flex-row relative z-[2000]">
        <div className="flex items-center gap-6">
          <img src={LOGO} alt="kob_logo" className="mobile:w-[24px] lg:w-[45px]" />
          <div className="hidden lg:flex gap-6">
          {navbarMenus.map((menu, index) =>
              menu.is_dropdown ? (
                <CustomDropDown key={index} name={menu.name} options={menu.options} isLanguage={false} />
              ) : (
                <div key={index} className="text-white text-[14px] cursor-pointer flex items-center" onClick={() => navigate(menu.link)}>
                  {menu.name}
                </div>
              )
            )}
          </div>
        </div>
          {/* <LanguageSelector /> */}
        <GiHamburgerMenu
          className="w-6 h-6 text-white lg:hidden cursor-pointer z-[1000]"
          onClick={() => setMenuOpen(!menuOpen)}
        />
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
            <motion.div
              className="w-full h-[calc(100%-162px)] bg-[rgb(42,83,79)] text-white flex flex-col justify-between overflow-hidden pointer-events-auto"
            >
              <div className="flex flex-col gap-[16px] p-[16px] overflow-y-auto">
                {navbarMenus.map((menu, index) =>
                  menu.is_dropdown ? (
                    <AccordionMenu key={index} name={menu.name} options={menu.options} setMenuOpen={setMenuOpen}/>
                  ) : (
                    <div key={index} className="text-lg cursor-pointer pb-[16px] border-b border-[#468781]" onClick={() => {setMenuOpen(false);navigate(menu.link)}}>
                      <p className="pl-[16px]">{menu.name}</p>
                    </div>
                  )
                )}
              </div>

              {/* Language and Auth Buttons */}
              <div className="p-6 bg-[rgb(42,83,79)]">
                {/* <div className="flex gap-2 mb-6 justify-center">
                  <button 
                    onClick={() => setLanguage('az')}
                    className={`w-[44px] h-[44px] rounded-[12px] text-[14px] font-semibold ${language === 'az' ? 'bg-[#967D2E] text-white' : 'bg-[#2A534F] text-white'}`}
                  >
                    AZ
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`w-[44px] h-[44px] rounded-[12px] text-[14px] font-semibold ${language === 'en' ? 'bg-[#967D2E] text-white' : 'bg-[#2A534F] text-white'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('ru')}
                    className={`w-[44px] h-[44px] rounded-[12px] text-[14px] font-semibold ${language === 'ru' ? 'bg-[#967D2E] text-white' : 'bg-[#2A534F] text-white'}`}
                  >
                    RU
                  </button>
                </div> */}

                {/* Auth Buttons */}
                {/* <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/daxil-ol');
                    }}
                    className="flex-1 h-[48px] bg-[white] text-[#967D2E] font-bold rounded-[12px] hover:bg-gray-100 transition-colors"
                  >
                    Daxil Ol
                  </button>
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/qeydiyyat');
                    }}
                    className="flex-1 h-[48px] bg-[#967D2E] text-white font-bold rounded-[12px] hover:bg-[#876f29] transition-colors"
                  >
                    Qeydiyyat
                  </button>
                </div> */}
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