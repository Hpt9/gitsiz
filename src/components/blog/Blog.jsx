import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { base_url, img_url } from "../../components/expoted_images";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import useLanguageStore from '../../store/languageStore';
import { updatePageTitle } from '../../utils/updatePageTitle';
import { LiaDownloadSolid } from "react-icons/lia";
export const Blog = () => {
  const { language } = useLanguageStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${base_url}/pages/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('*');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.blogs || !data.blogs[0]) {
          throw new Error('Invalid blog data structure');
        }

        setBlogData(data);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setError(error.message);
        navigate('*');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchBlogData();
    }
  }, [slug, navigate]);

  useEffect(() => {
    updatePageTitle(`${blogData?.blogs[0]?.blog_title[language]}`);
  }, [blogData,language]);

  // Function to check if text is long (more than 60 words)
  const isLongText = (text) => {
    return text.split(' ').length > 50;
  };

  // Function to get truncated text
  const getTruncatedText = (text) => {
    return text.split(' ').slice(0, 50).join(' ') + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loader"></span>
      </div>
    );
  }
  
  if (error || !blogData) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-[700px] w-full">
      <div className="blog_header w-full mobile:pt-[0px] mobile:pb-[64px] mobile:px-[16px] lg:px-[50px] xl:px-[100px] lg:py-[100px] bg-[rgb(42,83,79)]">
        <h1 className="mobile:text-[32px] lg:text-[61px] font-bold  text-[rgb(255,255,255)]">
          {blogData?.title[language]}
        </h1>
        {/* <img
          src={BG_IMAGE}
          alt=""
          className="absolut right-0 w-full h-full object-contain"
        /> */}
      </div>

      <div className="blog_content flex items-center justify-center mobile:flex-col lg:flex-row mobile:gap-y-[68px] xl:flex-row lg:gap-x-[100px] 2xl:gap-x-[300px] mobile:py-[32px] lg:py-[112px] w-full bg-[rgb(255,255,255)] mobile:px-[16px] lg:px-[170px]">
        <div className="flex flex-col mobile:w-full  sm:w-[540px]">
          <h3 className="mobile:px-[32px] mobile:py-[16px] px-[50px] py-[20px] text-white w-fit font-bold mobile:text-[24px] lg:text-[30px] bg-[#886B1F] rounded-tl-[26px] rounded-br-[26px]">
            {blogData?.blogs[0]?.blog_title[language]}
          </h3>
          <p
            className="mobile:text-[14px] lg:text-[18px] text-[rgb(43,82,79)] w-full mobile:leading-[20px] lg:leading-[25px] mobile:mt-[16px] lg:mt-[40px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                isLongText(blogData?.blogs[0]?.blog_description[language]) && !isExpanded
                  ? getTruncatedText(blogData?.blogs[0]?.blog_description[language])
                  : blogData?.blogs[0]?.blog_description[language] || ""
              ),
            }}
          ></p>
          {isLongText(blogData?.blogs[0]?.blog_description[language]) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#886B1F] font-semibold hover:underline text-left"
            >
              {isExpanded ? 'Daha az' : 'Davamını oxu'}
            </button>
          )}
          {blogData?.blogs[0]?.blog_link_url[language] && (
            <a
              href={blogData?.blogs[0]?.blog_link_url[language]}
              className="bg-[rgba(136,107,31,1)] text-white px-[20px] py-[10px] rounded-full w-fit text-center flex items-center justify-center gap-x-[10px] mt-[15px]"
            >
              {blogData?.blogs[0]?.blog_link_text[language]}{" "}
              <div className="bg-[white] rounded-full flex items-center justify-center w-[26px] h-[26px]">
              <LiaDownloadSolid className="text-[20px] text-[#886B1F]" />
              </div>

            </a>
          )}
        </div>
        <div className="flex mobile:w-full  sm:w-[540px] h-[248px] p-[8px] border border-[rgb(150,125,46)] relative rounded-tl-[32px] rounded-br-[32px]">
          <div className="w-full h-full  rounded-tl-[26px] rounded-br-[26px]">
            <img
              src={`${img_url}${blogData?.blogs[0].blog_img}`}
              alt=""
              className="w-full h-full object-cover rounded-tl-[32px] rounded-br-[32px]"
            />
          </div>
          <div className="absolute mobile:w-[64px] mobile:h-[64px] lg:w-[120px] lg:h-[120px] rounded-full sm:top-[-42px] bg-white sm:left-[20px] mobile:left-[50%] mobile:top-[-35px]  border border-[rgb(150,125,46)] z-[100]  translate-x-[-50%] flex items-center justify-center">
              <img
                src={`${img_url}${blogData?.blogs[0].blog_icon}`}
                alt=""
                className="mobile:w-[40px] mobile:h-[36px] lg:w-[60px] lg:h-[60px] object-cover"
              />
          </div>
        </div>
      </div>
    </div>
  );
};
