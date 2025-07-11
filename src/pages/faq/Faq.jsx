import { CustomAccordion } from "../../components/CustomAccordion";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../components/expoted_images";
import { useEffect, useState } from "react";
import useLanguageStore from '../../store/languageStore';
import '../../index.css'
import { updatePageTitle } from '../../utils/updatePageTitle';

export const Faq = () => {
  useEffect(() => {
    updatePageTitle('FAQ');
  }, []);
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState(null);
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`${base_url}/faqs`);
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const data = await response.json();
        //console.log(data[0].question);
        setFaqData(data);
      } catch (error) {
        console.log(error);
        navigate("*");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-492px)] min-h-[1024px]">
      <span className="loader"></span>
    </div>; // Optional: Add a loading state
  }

  if (!faqData) {
    return null; // Will redirect to 404 before rendering
  }
  return (
    <div className="w-full">
      <div className="blog_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)] relative faq_header">

        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
        <h1 className="mobile:text-[32px] mobile:leading-[39px] lg:leading-[60px] lg:text-[61px] font-bold  text-[rgb(255,255,255)] mobile:w-[224px] lg:w-[500px]">
        {language === 'az' ? 'Ən çox verilən suallar' : language === 'en' ? 'Frequently Asked Questions' : 'Часто задаваемые вопросы'}
        </h1>
        </div>
        {/* <img
          src={BG_IMAGE}
          alt=""
          className="absolute right-0 bottom-0 mobile:h-[230px] lg:h-[700px]"
        /> */}
      </div>
      <div className="flex mobile:justify-end w-full h-[calc(100vh-812px)] lg:min-h-[600px] mobile:flex-col-reverse lg:flex-row lg:items-center gap-x-[100px] px-[50px] mobile:px-[16px] mobile:py-[32px] lg:justify-center">
        
        <div className="flex flex-col max-h-[270px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-[16px]">
        {[...faqData].reverse().map((item, index) => (
          <CustomAccordion key={index} title={item.question[language]} content={item.answer[language]} index={index}/>
        )) }
        
        </div>
        <div className="flex flex-col gap-y-[16px] mobile:mb-[64px] lg:mb-0">
          <h3 className="mobile:text-[24px] mobile:leading-[30px] lg:leading-[50px] lg:text-[45px] text-[#2A534F] font-bold mobile:w-[240px] lg:w-[400px]">
          {language === 'az' ? 'Suallarınıza bizimlə cavab tapın' : 
           language === 'en' ? 'Find answers to your questions with us' : 
           'Найдите ответы на свои вопросы у нас'}
          </h3>
          <button onClick={() => navigate("/elaqe")} className="w-fit text-[16px] py-[16px] px-[65px] bg-[#886B1F] font-semibold text-[rgb(255,255,255)] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#886B1F] border-2 transition-all duration-150 border-[#886B1F]">
          {language === 'az' ? 'Bizə yazın' : 
           language === 'en' ? 'Contact us' : 
           'Свяжитесь с нами'}
          </button>
        </div>
      </div>
    </div>
  );
};
