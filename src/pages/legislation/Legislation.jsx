import download from "../../assets/download.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../../components/expoted_images";
import DOMPurify from "dompurify";
import useLanguageStore from "../../store/languageStore";
import { img_url } from "../../components/expoted_images";
import { updatePageTitle } from '../../utils/updatePageTitle';
export const Legislation = () => {
  useEffect(() => {
    updatePageTitle('Qanunvericilik');
  }, []);
  const { language } = useLanguageStore();
  const [legislationData, setLegislationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchLegislationData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${base_url}/legislation`);
        //console.log(response.data);
        setLegislationData(response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLegislationData();
  }, []);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loader"></span>
      </div>
    ); // Optional: Add a loading state
  }

  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  return (
    <div className="w-full">
      <div className="blog_header mobile:h-fit mobile:pb-[64px] lg:pt-[140px] lg:pb-[195px] w-full mobile:px-[16px] mobile:pt-[0px] lg:px-[175px] bg-[rgb(42,83,79)] relative">
        <h1 className="mobile:text-[32px] lg:text-[61px] font-bold text-[rgb(255,255,255)] relative z-[2]">
          {legislationData.title[language]}
        </h1>
        <p
          className="mobile:text-[14px] lg:text-[24px] lg:leading-[30px] text-[#d2d2d2] mobile:w-full lg:w-[616px] mobile:mt-[8px] lg:mt-[20px] relative z-[2] leading-5"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(legislationData.description[language]),
          }}
        ></p>
      </div>
      <div className="legislation_body flex flex-col">
        <div className="flex items-center justify-center mobile:flex-col mobile:gap-y-[64px] xl:flex-row xl:gap-x-[100px] 2xl:gap-x-[300px] mobile:py-[32px] lg:py-[112px] w-full bg-[rgb(255,255,255)] mobile:px-[16px]">
          <div className="flex flex-col mobile:gap-y-[8px] lg:gap-y-[60px] mobile:w-full tablet:w-[540px]">
            <h3 className=" text-[rgb(43,82,79)] w-fit font-bold mobile:text-[24px] lg:text-[50px] tracking-[-1%] mobile:leading-[32px] lg:leading-[56px]">
              {legislationData.contents[0].title[language]}
            </h3>
            <p
              className="mobile:text-[14px] mobile:leading-5 lg:leading-[24px] lg:text-[20px] text-[rgb(43,82,79)] mobile:w-full lg:w-[538px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  legislationData.contents[0].description[language]
                ),
              }}
            ></p>
          </div>
          <div className="flex mobile:w-full tablet:w-[361px] h-[248px] p-[8px] border border-[rgb(150,125,46)] relative rounded-tl-[32px] rounded-br-[32px]">
            <div className="w-full h-full  rounded-tl-[26px] rounded-br-[26px]">
              <img
                src={`${img_url}${legislationData.contents[0].image}`}
                alt=""
                className="w-full h-full object-cover rounded-tl-[26px] rounded-br-[26px]"
              />
            </div>
            <div className="absolute bg-[white] mobile:left-[50%] mobile:w-[64px] mobile:h-[64px] lg:w-[117px] lg:h-[117px] rounded-full mobile:top-[-32px] lg:top-[-42px] border border-[rgb(150,125,46)] z-[100] lg:left-[20px] translate-x-[-50%] flex items-center justify-center">
              <div className="mobile:w-[48px] mobile:h-[48px] lg:w-[70px] lg:h-[70px] rounded-full flex items-center justify-center">
                <img
                  src={`${img_url}${legislationData.contents[0].icon}`}
                  alt=""
                  className=" object-cover mobile:w-[36px] mobile:h-[36px] lg:w-[55px] lg:h-[55px]"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="content mt-[18px] flex flex-col items-center mobile:mb-[16px] lg:mb-[144px]">
          <p className="mobile:text-[16px] lg:text-[25px] text-[rgb(43,82,79)] font-medium ">
            {legislationData.documents_title[language]}
          </p>
          <div className="grid mobile:grid-cols-2 mobile:grid-rows-4 lg:grid-cols-4 lg:grid-rows-2 mobile:gap-x-[8px] lg:gap-x-[50px] mobile:gap-y-[20px] lg:gap-y-[40px] mt-[50px]">
            {legislationData.documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col items-center mobile:gap-y-[8px] lg:gap-y-[33px] relative mobile:w-[177px] lg:w-[200px]"
              >
                <div className="w-[56px] h-[56px] relative">
                  <img 
                    src={`${img_url}${document.image}`} 
                    alt="" 
                    className="w-[48px]" 
                  />
                  {document.document_link && (
                    <a 
                      href={document.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute mobile:bottom-[0] lg:bottom-[0px] mobile:right-[-5px] lg:right-[-5px] w-[33px] h-[33px] bg-[rgb(150,125,46)] rounded-full flex items-center justify-center hover:bg-[rgb(170,145,66)] transition-all duration-300 cursor-pointer border border-[white]"
                    >
                      <img src={download} alt="" />
                    </a>
                  )}
                  {!document.document_link && (
                    <div className="absolute mobile:bottom-[0] lg:bottom-[0px] mobile:right-[-5px] lg:right-[-5px] w-[33px] h-[33px] bg-[#E7E7E7] rounded-full flex items-center justify-center cursor-not-allowed border border-[white]">
                      <img src={download} alt="" className="opacity-50" />
                    </div>
                  )}
                </div>
                <p 
                  className="mobile:text-[14px] leading-5 lg:text-[20px] text-center mobile:w-[170px] lg:w-[220px]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(document.text[language] || document.text['az'])
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-[16px] items-center w-full bg-[rgb(255,255,255)]">
          <p className="mobile:w-[190px] lg:w-[350px] text-[rgb(43,82,79)] font-medium mobile:text-[16px] lg:text-[24px] text-center">
            {legislationData.comp_req_title[language]}
          </p>
          <img
            src={`${img_url}${legislationData.comp_req_image}`}
            alt=""
            className="w-[100%] h-auto px-[20px] xl:w-[1280px] xl:px-0"
          />
        </div>
        <div className="color_row flex justify-center items-center w-full mobile:h-fit lg:h-[100px] bg-[rgb(150,125,46)] opacity-[44%] mobile:my-[32px] lg:my-[70px]">
          <p
            className="mobile:text-[16px] font-semibold lg:text-[20px] text-[rgb(255,255,255)] mobile:w-full lg:w-[962px] text-center px-[16px] py-[32px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(legislationData.banner_text[language]),
            }}
          ></p>
        </div>
        <div className="legislation_bottom flex flex-col gap-y-[36px] mobile:mb-[32px] lg:mb-[75px] items-center justify-center w-full bg-[rgb(255,255,255)] mobile:px-[16px]">
          {legislationData.banners.map((item, index) => (
            <div
              key={item.id}
              className={`row1 flex mobile:w-full lg:w-[1000px] ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <div className="mobile:w-full tablet:w-[650px] h-auto flex mobile:flex-col lg:flex-row gap-x-[20px] mobile:items-start lg:items-center gap-y-[24px]">
                <div className="flex gap-x-[20px] mobile:items-end lg:items-center">
                  <img
                    src={`${img_url}${item.image}`}
                    alt=""
                    className="mobile:w-[84px] tablet:w-[130px]"
                  />
                  <p className="mobile:text-[32px] lg:text-[50px] text-[rgb(43,82,79)] font-bold">
                    {formatNumber(index + 1)}
                  </p>
                </div>
                <p 
                  className="mobile:text-[14px] tablet:text-[20px] text-[rgb(43,82,79)] mobile:w-full lg:w-[450px]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.text[language] || item.text['az'])
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
