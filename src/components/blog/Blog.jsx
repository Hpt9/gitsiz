import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { base_url } from "../../components/expoted_images";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import useLanguageStore from '../../store/languageStore';
import { img_url } from "../../components/expoted_images";

export const Blog = () => {
  const { language } = useLanguageStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`${base_url}/pages/${slug}`);
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const data = await response.json();
        console.log(data.blogs[0].blog_icon);
        setBlogData(data);
      } catch (error) {
        console.log(error);
        navigate("*");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [slug, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">
      <span className="loader"></span>
    </div>; // Optional: Add a loading state
  }

  if (!blogData) {
    return null; // Will redirect to 404 before rendering
  }

  return (
    <div className="flex flex-col min-h-[700px] w-full">
      <div className="blog_header w-full mobile:pt-[0px] mobile:pb-[64px] mobile:px-[16px] lg:px-[170px] lg:py-[100px] bg-[rgb(42,83,79)]">
        <h1 className="mobile:text-[32px] lg:text-[61px] font-bold  text-[rgb(255,255,255)]">
          {blogData?.title[language]}
        </h1>
        {/* <img
          src={BG_IMAGE}
          alt=""
          className="absolut right-0 w-full h-full object-contain"
        /> */}
      </div>

      <div className="blog_content flex items-center justify-center mobile:flex-col lg:flex-row mobile:gap-y-[68px] xl:flex-row xl:gap-x-[100px] 2xl:gap-x-[300px] mobile:py-[32px] lg:py-[112px] w-full bg-[rgb(255,255,255)] mobile:px-[16px]">
        <div className="flex flex-col mobile:gap-y-[16px] lg:gap-y-[60px] mobile:w-full  sm:w-[540px]">
          <h3 className="mobile:px-[32px] mobile:py-[16px] px-[50px] py-[20px] text-white w-fit font-bold mobile:text-[24px] lg:text-[30px] bg-[#886B1F] rounded-tl-[26px] rounded-br-[26px]">
            {blogData?.blogs[0]?.blog_title[language]}
          </h3>
          <p
            className="mobile:text-[14px] lg:text-[18px] text-[rgb(43,82,79)] w-full leading-[20px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                blogData?.blogs[0]?.blog_description[language] || ""
              ),
            }}
          ></p>
          {blogData?.blogs[0]?.blog_link_url[language] && (
            <a
              href={blogData?.blogs[0]?.blog_link_url[language]}
              className="bg-[rgba(136,107,31,1)] text-white px-[20px] py-[10px] rounded-full w-fit text-center flex items-center justify-center gap-x-[10px]"
            >
              {blogData?.blogs[0]?.blog_link_text[language]}{" "}
              <MdOutlineDownloadForOffline className="text-[30px]" />
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
