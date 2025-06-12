import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "./expoted_images";
import KOB from "../assets/koblogo.svg";
import PASHA from "../assets/pashalogo.svg";
import useLanguageStore from "../store/languageStore";
import ik from "../assets/Group 164.svg";
import MTTM from "../assets/mttm.svg";
import { FaArrowDown } from "react-icons/fa6";

export const Footer = () => {
  const [footerMenus, setFooterMenus] = useState([]);
  const [copyright, setCopyright] = useState(null);
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  useEffect(() => {
    const fetchFooterMenus = async () => {
      try {
        const response = await axios.get(`${base_url}/menus/3`);
        const menuData = response.data;

        // Get main columns (parent_id: null)
        const columns = menuData
          .filter((item) => !item.parent_id)
          .sort((a, b) => a.order - b.order);

        // Transform data to match footer structure
        const transformedMenus = columns.map((column) => {
          const children = menuData
            .filter((item) => item.parent_id === column.id)
            .sort((a, b) => a.order - b.order)
            .map((child) => ({
              name: child.title[language] || Object.values(child.title)[0], // Use current language or fallback
              link: child.url,
            }));

          //console.log(`Menu ${column.order} children:`, children); // Debug log

          return {
            [`menu${column.order}`]: children,
          };
        });

        //console.log("Transformed menus:", transformedMenus); // Debug log
        setFooterMenus(transformedMenus);

        // Get copyright (last item)
        if (menuData.length > 0) {
          const lastItem = menuData[menuData.length - 1];
          setCopyright({
            text: lastItem.title[language] || Object.values(lastItem.title)[0],
            url: lastItem.url,
          });
          console.log(lastItem)
        }
      } catch (error) {
        console.error("Error fetching footer menus:", error);
      }
    };

    fetchFooterMenus();
  }, [language]); // Re-fetch when language changes

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className=" w-full bg-[rgb(42,83,79)] relative flex flex-col mobile:pt-[32px] mobile:pb-[0px] lg:pt-[53px] lg:pb-[38px] justify-between footer_container mobile:gap-y-[0] lg:gap-y-[40px]">
      {/* Desktop Footer */}
      <div className="lg:flex mobile:hidden lg:flex-row w-full h-[113px] relative z-[20] justify-center gap-x-[140px]">
        {footerMenus.map((menu, index) => {
          const menuKey = Object.keys(menu)[0];
          //console.log(menuKey);
          if (menuKey !== "menu3") {
            return (
              <div className="flex flex-col " key={index}>
                <p className="text-[rgba(255,255,255,1)] text-[16px] font-semibold">
                  {menuKey === "menu1" && 
                    (language === 'az' ? "Haqqında" : 
                     language === 'en' ? "About" : 
                     "О нас")}
                </p>
                {menu[menuKey].map((item, index) => (
                  <span
                    key={index}
                    className="text-white text-xs hover:text-[#c0c0c0] cursor-pointer mt-[10px]"
                    onClick={() => handleNavigation(item.link)}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            );
          } else if (menuKey === "menu3") {
            return (
              <div className="flex flex-row-reverse gap-x-[15px]" key={index}>
                <div className="flex justify-end w-full ">
                  <div
                    onClick={scrollToTop}
                    className="flex absolute right-[108px]  items-center justify-center bg-[rgba(255,255,255,1)] w-[50px] h-[50px] rounded-[16px] cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FaArrowDown className="w-[24px] h-[24px] rotate-180 text-[rgba(136,107,31,1)]" />
                  </div>
                </div>
                <div className="flex flex-col gap-y-[8px]">
                  <p className="text-[rgba(255,255,255,1)] text-[16px] font-semibold">
                    {language === 'az' ? "Əlaqə" : 
                     language === 'en' ? "Contact" : 
                     "Контакты"}
                  </p>
                  <p className="text-[rgba(255,255,255,1)] text-[12px]">
                    info@kobklaster.az
                  </p>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Mobile Footer */}
      <div className="mobile_footer w-full mobile:flex mobile:flex-col justify-center sm:items-center lg:hidden gap-y-[50px] relative z-[30]">
        <div className="mobile_footer_content mobile:w-[100%] sm:w-[500px] flex justify-between mobile:px-[16px]">
          <div className="mobile_left flex flex-col gap-y-[32px]">
            {footerMenus.map((menu, index) => {
              // First two columns (index 0 and 1)
              if (index <= 1) {
                const menuKey = Object.keys(menu)[0];
                const menuItems = menu[menuKey];

                return menuItems && menuItems.length > 0 ? (
                  <div className="flex flex-col" key={index}>
                    <p className="text-[rgba(255,255,255,1)] text-[16px] mb-[12px] font-semibold">
                      {menuKey === "menu1" ? 
                        (language === 'az' ? "Haqqında" : 
                         language === 'en' ? "About" : 
                         "О нас") : 
                        (language === 'az' ? "Klaster haqqında" : 
                         language === 'en' ? "About cluster" : 
                         "О кластере")}
                    </p>
                    {menuItems.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="text-[#e4e4e4] text-xs mb-[8px] hover:text-[#c0c0c0] cursor-pointer"
                        onClick={() => handleNavigation(item.link)}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                ) : null;
              }
              return null;
            })}
          </div>
          <div className="mobile_right flex flex-col gap-y-[32px]">
            {footerMenus.map((menu, index) => {
              // Last columns (index 2 and above)
              if (index >= 2) {
                const menuKey = Object.keys(menu)[0];
                const menuItems = menu[menuKey];

                return menuItems && menuItems.length > 0 ? (
                  <div
                    className="flex flex-col gap-y-[65px] w-full"
                    key={index}
                  >
                    <div className="flex justify-end w-full">
                      <div
                        onClick={scrollToTop}
                        className="flex items-center justify-center bg-[rgba(255,255,255,1)] w-[50px] h-[50px] rounded-[16px] cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <FaArrowDown className="w-[24px] h-[24px] rotate-180 text-[rgba(136,107,31,1)]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-[8px]">
                      <p className="text-[rgba(255,255,255,1)] text-[16px] font-semibold">
                        {language === 'az' ? "Əlaqə" : 
                         language === 'en' ? "Contact" : 
                         "Контакты"}
                      </p>
                      <p className="text-[rgba(255,255,255,1)] text-[12px]">
                        info@kobklaster.az
                      </p>
                    </div>
                  </div>
                ) : null;
              }
              return null;
            })}
          </div>
        </div>
        <div className="footer_icons flex gap-x-[16px] w-full items-center justify-center relative z-[20]">
          <img src={KOB} alt="" className="w-[34px] h-[42px]" />
          <img src={PASHA} alt="" className="w-[50px] h-[18px]" />
          <img src={MTTM} alt="" className="" />
          <img src={ik} alt="" className="w-[78px] h-[16px]" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-x-[100px]">
        <div className="footer_icons gap-x-[16px]  items-center justify-center relative z-[20] mobile:hidden lg:flex">
          <img src={KOB} alt="" className="w-[34px] h-[42px]" />
          <img src={PASHA} alt="" className="w-[50px] h-[18px]" />
          <img src={MTTM} alt="" className="" />
          <img src={ik} alt="" className="w-[78px] h-[16px]" />
        </div>
        <div className="text-white text-[12px] text-center mobile:w-full mobile:mt-[10px] mobile:pt-[10px] mobile:pb-[64px] lg:w-fit lg:mt-[0px] lg:pt-[0px] lg:pb-[0px] relative z-[20]">
          {copyright && copyright.url ? (
            <a
              href={copyright.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c0c0c0]"
            >
              {copyright.text}
            </a>
          ) : null}
        </div>
      </div> 
    </div>
  );
};
