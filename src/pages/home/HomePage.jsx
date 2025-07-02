import { base_url } from "../../components/expoted_images";
import axios from "axios";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import useLanguageStore from "../../store/languageStore";
import { img_url } from "../../components/expoted_images";
import { useNavigate, useLocation } from "react-router-dom";
import { updatePageTitle } from "../../utils/updatePageTitle";
import { Modal } from "../../components/ui/Modal";

export const HomePage = () => {
  useEffect(() => {
    updatePageTitle("Ana səhifə");
  }, []);
  const { language } = useLanguageStore();
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.fromRegistration) {
      setIsModalOpen(true);
      // Clean the state to prevent modal from reopening on back navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${base_url}/home`);
        setHomeData(response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleButtonClick = (url) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <span className="loader"></span>
      </div>
    ); // Optional: Add a loading state
  }

  return (
    <div className="">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Qeydiyyatınız uğurla tamamlandı!"
      >
        <p className="mb-4">
          Qeydiyyatınız uğurla tamamlandı. Qanunvericilik bölməsinə keçid edin.
        </p>
        <div className="flex justify-end gap-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Xeyr
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
              navigate("/qanunvericilik");
            }}
            className="px-4 py-2 rounded-lg bg-[#2A534F] text-white hover:bg-[#1a3331] transition-colors"
          >
            Bəli
          </button>
        </div>
      </Modal>
      <div className="home_header relative mobile:h-fit mobile:pt-[0px] mobile:pb-[32px] lg:pt-[140px] lg:pb-[195px] w-full mobile:px-[16px] lg:px-[50px] xl:px-[100px] bg-[rgb(42,83,79)]">
        {/* <img
          src={BG_IMAGE}
          alt=""
          className="absolute right-0 bottom-0 mobile:h-[307px] lg:h-[1024px]"
        /> */}
        <div className="flex flex-col items-start justify-between w-full max-w-[1920px] mx-auto">
          <h1 className="mobile:w-[224px] lg:w-[500px] text-white mobile:text-[32px] lg:text-[61px] font-bold lg:leading-[65px]">
            {homeData.title[language]}
          </h1>
          <div
            className="mt-[10px] mb-[20px] mobile:w-fit md:w-[516px] text-[rgba(210,210,210,1)] mobile:text-[14px] lg:text-[20px] font-normal"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(homeData.description[language]),
            }}
          />
          <div className="flex gap-x-[8px] relative z-10">
            {homeData.buttons.map((button, index) => (
              <button
                key={index}
                onClick={() =>
                  handleButtonClick(button.url[language] || button.url.az)
                }
                className="rounded-[12px] bg-[rgb(150,125,46)] border-2 border-[rgb(150,125,46)] mobile:w-[50%] md:w-fit text-white text-[14px] font-medium mobile:px-[2px] md:px-[28px] py-[8px] transition-all duration-300 hover:bg-white hover:text-[rgb(150,125,46)]"
              >
                {button.text[language] || button.text.az}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="home_info items-center  w-full mobile:gap-y-[64px] lg:gap-y-[175px] 2xl:gap-y-[50px] mobile:px-[16px] lg:px-[100px] 2xl:px-[175px] mobile:py-[32px] lg:py-[150px] 2xl:py-[200px] flex flex-col ">
        <div className="mobile:h-fit lg:h-[450px] w-full 2xl:w-fit flex items-center gap-x-[45px]  mobile:flex-col lg:gap-y-[130px] 2xl:flex-row">
          <div>
            <div className="flex flex-col mobile:gap-y-[8px] lg:gap-y-[60px] mobile:w-full tablet:w-fit">
              <h1 className="mobile:text-[24px] mobile:leading-[29px] tracking-[-1px] lg:text-[50px] lg:w-[730px] 2xl:w-[381px] mb-[25px] font-bold text-[rgb(42,83,79)] lg:leading-[58px]">
                {homeData.banner_title[language] || ""}
              </h1>
              <div className="relative">
                <div
                  className={`mobile:text-[14px] lg:text-[20px] lg:leading-[28px] lg:w-[730px] 2xl:w-[502px] font-normal text-[rgb(42,83,79)] ${
                    !isExpanded ? "line-clamp-3" : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      homeData.banner_description[language] || ""
                    ),
                  }}
                />
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#967D2E] font-medium hover:text-[#876f29] transition-colors mt-2 flex items-center gap-x-2"
                >
                  {isExpanded ? "Daha az" : "Davamını oxu"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mobile:h-fit lg:h-[450px] flex mobile:flex-col mobile:gap-y-[75px] lg:flex-row lg:justify-center lg:gap-x-[50px] 2xl:justify-between 2xl:gap-x-[30px] items-center w-full gap-x-[15px] mobile:mt-[64px] lg:mt-0">
            {(() => {
              try {
                const images = JSON.parse(homeData.contents[0].image);
                const icons = JSON.parse(homeData.contents[0].icon);
                return images.map((imagePath, index) => (
                  <div
                    key={index}
                    className="flex p-[8px] mobile:h-[248px] lg:h-[300px] mobile:w-full sm:w-[450px] lg:w-[280px] border border-[rgb(150,125,46)] rounded-tl-[32px] rounded-br-[32px] relative bg-white"
                  >
                    <div className="mobile:w-full lg:w-full h-full rounded-tl-[26px] rounded-br-[26px] overflow-hidden">
                      <img
                        src={`${img_url}${imagePath}`}
                        alt=""
                        className="w-full h-full object-cover rounded-tl-[26px] rounded-br-[26px]"
                      />
                    </div>
                    <div className="absolute mobile:w-[64px] mobile:h-[64px] lg:w-[120px] lg:h-[120px] border-[1px] border-[rgb(150,125,46)] bg-white flex justify-center items-center rounded-full lg:top-[-62px] mobile:top-[-35px] left-[50%] translate-x-[-50%] shadow-lg">
                      <img
                        src={`${img_url}${icons[index]}`}
                        alt=""
                        className="mobile:w-[40px] mobile:h-[45px] lg:w-[60px] lg:h-[60px] object-contain"
                      />
                    </div>
                  </div>
                ));
              } catch (error) {
                console.error("Error parsing image data:", error);
                return null;
              }
            })()}
          </div>
        </div>
        <div
          className="opportunities mobile:hidden lg:flex flex-col items-center  2xl:mt-[50px]"
          style={{
            marginTop: isExpanded ? "290px" : "100px",
          }}
        >
          <span className="text-[20px] w-[407px] text-center text-[rgb(112,112,112)] relative left-[-43px] ">
            {homeData.advance_title[language]}
          </span>
          <div className="line w-[200px] h-[5px] bg-[rgb(150,125,46)] relative left-[-48px] mb-[50px] mt-[20px]"></div>
          <div className="flex justify-center h-[280px]">
            <div className="h-full flex flex-col justify-between mr-[38px]">
              <p className="h-[50%] flex items-center text-[20px] w-[132px] text-right text-[rgb(112,112,112)]">
                {homeData.advances[0]?.title[language] ||
                  homeData.advances[0]?.title["az"]}
              </p>
              <p className="h-[50%] flex items-center text-[20px] w-[132px] text-right text-[rgb(112,112,112)]">
                {homeData.advances[1]?.title[language] ||
                  homeData.advances[1]?.title["az"]}
              </p>
            </div>

            <div className="flex flex-col gap-y-[10px] mr-[10px]">
              <div className="top-left w-[181px] h-[141px] bg-[rgb(150,125,46)] rounded-tr-[60px] rounded-bl-[60px] flex justify-center items-center">
                <img
                  src={`${img_url}${homeData.advances[0]?.icon}`}
                  alt=""
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
              <div className="bottom-left w-[181px] h-[141px] bg-[rgb(150,125,46)] rounded-tl-[60px] rounded-br-[60px] flex justify-center items-center">
                <img
                  src={`${img_url}${homeData.advances[1]?.icon}`}
                  alt=""
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-[10px]">
              <div className="top-right w-[181px] h-[141px] bg-[rgb(150,125,46)] rounded-tl-[60px] rounded-br-[60px] flex justify-center items-center">
                <img
                  src={`${img_url}${homeData.advances[2]?.icon}`}
                  alt=""
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
              <div className="bottom-right w-[181px] h-[141px] bg-[rgb(150,125,46)] rounded-tr-[60px] rounded-bl-[60px] flex justify-center items-center">
                <img
                  src={`${img_url}${homeData.advances[3]?.icon}`}
                  alt=""
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
            </div>
            <div className="h-full flex flex-col justify-between ml-[38px]">
              <p className="h-[50%] flex items-center text-[20px] w-[160px] text-left text-[rgb(112,112,112)]">
                {homeData.advances[2]?.title[language] ||
                  homeData.advances[2]?.title["az"]}
              </p>
              <p className="h-[50%] flex items-center text-[20px] w-[220px] text-left text-[rgb(112,112,112)]">
                {homeData.advances[3]?.title[language] ||
                  homeData.advances[3]?.title["az"]}
              </p>
            </div>
          </div>
        </div>
        <div className="opportunities_mobile mobile:flex flex-col lg:hidden justify-center px-[16px]">
          <div className="flex flex-col justify-center items-center">
            <span className="mobile:text-[16px] lg:text-[20px] w-full text-center text-[rgb(112,112,112)]">
              {homeData.advance_title[language]}
            </span>
            <div className="line w-[200px] h-[2px] bg-[rgb(150,125,46)] mb-[50px] mt-[20px]"></div>
          </div>
          <div className="flex justify-center flex-col px-[16px]">
            <div className="h-full flex justify-center gap-x-[20px] mb-[10px]">
              <p className="h-[50%] flex items-center text-[12px] w-[126px] text-center text-[rgb(112,112,112)]">
                {homeData.advances[0]?.title[language] ||
                  homeData.advances[0]?.title["az"]}
              </p>
              <p className="h-[50%] flex items-center text-[12px] w-[126px] text-center text-[rgb(112,112,112)]">
                {homeData.advances[1]?.title[language] ||
                  homeData.advances[1]?.title["az"]}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col gap-y-[10px] mr-[10px]">
                <div className="top-left w-[126px] h-[121px] bg-[rgb(150,125,46)] rounded-tr-[60px] rounded-bl-[60px] flex justify-center items-center">
                  <img
                    src={`${img_url}${homeData.advances[0]?.icon}`}
                    alt=""
                    className="w-[55px]  object-contain"
                  />
                </div>
                <div className="bottom-left w-[126px] h-[121px] bg-[rgb(150,125,46)] rounded-tl-[60px] rounded-br-[60px] flex justify-center items-center">
                  <img
                    src={`${img_url}${homeData.advances[1]?.icon}`}
                    alt=""
                    className="w-[55px] object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-[10px]">
                <div className="top-right w-[126px] h-[121px] bg-[rgb(150,125,46)] rounded-tl-[60px] rounded-br-[60px] flex justify-center items-center">
                  <img
                    src={`${img_url}${homeData.advances[2]?.icon}`}
                    alt=""
                    className="w-[55px] object-contain"
                  />
                </div>
                <div className="bottom-right w-[126px] h-[121px] bg-[rgb(150,125,46)] rounded-tr-[60px] rounded-bl-[60px] flex justify-center items-center">
                  <img
                    src={`${img_url}${homeData.advances[3]?.icon}`}
                    alt=""
                    className="w-[55px]  object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="h-full flex justify-center gap-x-[20px] mt-[10px]">
              <p className="h-[50%] flex items-center text-[12px] w-[126px] text-center text-[rgb(112,112,112)]">
                {homeData.advances[2]?.title[language] ||
                  homeData.advances[2]?.title["az"]}
              </p>
              <p className="h-[50%] flex items-center text-[12px] w-[127px] text-center text-[rgb(112,112,112)]">
                {homeData.advances[3]?.title[language] ||
                  homeData.advances[3]?.title["az"]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
