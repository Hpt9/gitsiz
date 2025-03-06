// import useLanguageStore from '../../store/languageStore';
import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updatePageTitle } from '../../utils/updatePageTitle';
export const Contact = () => {
  useEffect(() => {
    updatePageTitle('Əlaqə');
  }, []);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('https://kobklaster.tw1.ru/api/settings');
        const data = await response.json();
        setSettings(data[0].reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {}));
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        //console.log(settings);
        setLoading(false);
      }
    };

    fetchSettings();
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(formData)
    // Check if all fields are filled
    if (!formData.full_name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Bütün sahələri doldurun!', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://kobklaster.tw1.ru/api/contact', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Mesajınız uğurla göndərildi!', {
          position: "top-right",
          autoClose: 3000
        });
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          subject: 'salam',
          message: '',
        });
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.log(error)
      toast.error('Xəta baş verdi. Yenidən cəhd edin.', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">
      <span className="loader"></span>
    </div>;
  }
  // const { language } = useLanguageStore();
  return (
    <div className="w-full">
      <ToastContainer />
      <div className="blog_header w-full mobile:px-[16px] mobile:pb-[42px] mobile:pt-[16px] lg:px-[170px] lg:py-[100px] bg-[rgb(42,83,79)] relative">
        <h1 className="mobile:text-[32px] lg:text-[61px] font-bold text-[rgb(255,255,255)]">
          Əlaqə
        </h1>
        {/* <img
          src={BG_IMAGE}
          alt=""
          className="absolute right-0 bottom-0 mobilr:h-[112px] lg:h-[550px]"
        /> */}
      </div>
      <div className="flex mobile:flex-col  gap-x-[100px] py-[100px] mobile:py-[32px] mobile:px-[16px] gap-y-[64px] justify-center items-center md:gap-y-[50px] lg:flex-row lg:px-[20px]">
        <div className="mobile:w-full lg:w-[540px] flex flex-col justify-center">
          <h1 className="mobile:text-[24px] lg:text-[45px] font-bold text-[rgb(43,82,79)] mobile:mb-[34px] lg:mb-[68px]">
            Bizimlə əlaqə saxlayın
          </h1>
          <div className="contact ">
            <div className="flex mobile:justify-between lg:justify-start lg:gap-x-[50px]">
              <div className="flex flex-col mobile:gap-y-[8px] lg:gap-y-[18px]">
                <p className="mobile:text-[14px] lg:text-[16px] font-bold text-[rgb(43,82,79)]">
                  Telefon
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] font-bold text-[rgb(43,82,79)]">
                  Mail
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] font-bold text-[rgb(43,82,79)]">
                  İnstagram
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] font-bold text-[rgb(43,82,79)]">
                  Ünvan
                </p>
              </div>
              <div className="flex flex-col mobile:gap-y-[8px] lg:gap-y-[18px]">
                <p className="mobile:text-[14px] lg:text-[16px] text-[rgb(43,82,79)] mobile:text-right lg:text-left">
                  {settings?.Telefon?.az}
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] text-[rgb(43,82,79)] mobile:text-right lg:text-left">
                  {settings?.Mail?.az}
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] text-[rgb(43,82,79)] mobile:text-right lg:text-left">
                  {settings?.İnstagram?.az}
                </p>
                <p className="mobile:text-[14px] lg:text-[16px] text-[rgb(43,82,79)] mobile:text-right lg:text-left">
                  {settings?.Ünvan?.az}
                </p>
              </div>
            </div>
            <div className="logos mb-[24px] mt-[32px] flex gap-x-[25px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20.037"
                height="20.03"
                viewBox="0 0 10.037 10.03"
              >
                <path
                  id="Path_2000"
                  data-name="Path 2000"
                  d="M287.269,242.044a9.08,9.08,0,0,1-8.123-8.12,1.676,1.676,0,0,1,1.165-1.67l.684-.215a.51.51,0,0,1,.626.3l.86,2.138a.507.507,0,0,1-.1.533l-.674.738a.44.44,0,0,0-.08.453,6.823,6.823,0,0,0,3.362,3.365.44.44,0,0,0,.453-.083l.742-.674a.5.5,0,0,1,.53-.1l2.141.86a.51.51,0,0,1,.3.642l-.218.684A1.67,1.67,0,0,1,287.269,242.044Z"
                  transform="translate(-279.145 -232.017)"
                  fill="#967D2E"
                />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20.903"
                height="20.27"
                viewBox="0 0 12.903 9.27"
              >
                <path
                  id="Path_2001"
                  data-name="Path 2001"
                  d="M210.869,236.693a1.037,1.037,0,0,1,1.037-1.033h10.847a1.037,1.037,0,0,1,1.018.864l-6.7,3.846Zm0,7.167v-5.85l6.2,3.447,6.682-3.692h0v6.126a1.037,1.037,0,0,1-1.033,1.037H211.907a1.037,1.037,0,0,1-1.037-1.069Z"
                  transform="translate(-210.869 -235.66)"
                  fill="#967D2E"
                  fillRule="evenodd"
                />
              </svg>

              <a href="https://www.instagram.com/kob.klaster/" target="_blank" rel="noopener noreferrer">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20.79"
    height="20.79"
    viewBox="0 0 10.79 10.79"
  >
    <g id="ELEMENTS" transform="translate(0 0)">
      <g id="Group_113" data-name="Group 113" transform="translate(0 0)">
        <path
          id="Path_2003"
          data-name="Path 2003"
          d="M256.311,216.97a.631.631,0,1,0,.631.631A.631.631,0,0,0,256.311,216.97Z"
          transform="translate(-248.057 -215.038)"
          fill="#967D2E"
        />
        <path
          id="Path_2004"
          data-name="Path 2004"
          d="M247.522,219.477a2.708,2.708,0,0,0-3.755,3.755,1.937,1.937,0,0,0,.678.678,2.707,2.707,0,0,0,3.755-3.755A1.874,1.874,0,0,0,247.522,219.477Zm-.443,3.57a1.744,1.744,0,0,1-2.446-2.446.93.93,0,0,1,.263-.263,1.744,1.744,0,0,1,2.446,2.446A1.046,1.046,0,0,1,247.079,223.047Z"
          transform="translate(-240.546 -216.294)"
          fill="#967D2E"
        />
        <path
          id="Path_2005"
          data-name="Path 2005"
          d="M244.558,222.83h-5.867a2.46,2.46,0,0,1-2.461-2.461V214.5a2.46,2.46,0,0,1,2.461-2.461h5.867a2.46,2.46,0,0,1,2.461,2.461v5.867A2.46,2.46,0,0,1,244.558,222.83Zm-5.863-9.771a1.445,1.445,0,0,0-1.446,1.446v5.867a1.445,1.445,0,0,0,1.446,1.446h5.867a1.445,1.445,0,0,0,1.446-1.446v-5.867a1.445,1.445,0,0,0-1.446-1.446Z"
          transform="translate(-236.23 -212.04)"
          fill="#967D2E"
        />
      </g>
    </g>
  </svg>
</a>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20.236"
                height="20.369"
                viewBox="0 0 8.236 12.369"
              >
                <path
                  id="Path_2002"
                  data-name="Path 2002"
                  d="M351.467,237.611a2.1,2.1,0,1,1,1.485-.614,2.1,2.1,0,0,1-1.485.614m-2.9-5.015.037-.037h0a4.132,4.132,0,0,1,5.739,0h0l.037.037a4.139,4.139,0,0,1,.664,4.982l-3.574,6.191-3.567-6.191A4.139,4.139,0,0,1,348.564,232.6Z"
                  transform="translate(-347.352 -231.4)"
                  fill="#967D2E"
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-[14px] w-[250px] font-bold text-[rgb(43,82,79)]">
            {settings?.icon_bottom_text?.az}
          </p>
        </div>
        <form 
          onSubmit={handleSubmit}
          className="mobile:w-full lg:w-[540px] h-[516px] border border-[rgb(43,82,79)] rounded-tl-[20px] rounded-br-[20px] px-[83px] mobile:px-[32px] mobile:pt-[48px] lg:pt-[72px] pb-[40px] flex flex-col justify-between"
        >
          <div className="flex flex-col gap-y-[20px]">
            <div className="flex flex-col">
              <input 
                type="text" 
                id="full_name" 
                value={formData.full_name}
                onChange={handleChange}
                required
                className="border-b border-[rgb(43,82,79)] py-[16px] focus:outline-none placeholder:text-[#2A534F] text-[#2A534F]" 
                placeholder={settings?.name_sname?.az}
              />
            </div>

            <div className="flex flex-col">
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                required
                className="border-b border-[rgb(43,82,79)] py-[16px] focus:outline-none placeholder:text-[#2A534F] text-[#2A534F]" 
                placeholder={settings?.email?.az}
              />
            </div>

            <div className="flex flex-col">
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={handleChange}
                required
                className="border-b border-[rgb(43,82,79)] py-[16px] focus:outline-none placeholder:text-[#2A534F] text-[#2A534F]" 
                placeholder={settings?.phone?.az}
              />
            </div>

            {/* <div className="flex flex-col">
              <input 
                type="text" 
                id="subject" 
                value={formData.subject}
                onChange={handleChange}
                required
                className="border-b border-[rgb(43,82,79)] py-[16px] focus:outline-none placeholder:text-[#2A534F] text-[#2A534F]" 
                placeholder="Mövzu"
              />
            </div> */}

            <div className="flex flex-col">
              <textarea 
                id="message" 
                value={formData.message}
                onChange={handleChange}
                required
                className="border-b border-[rgb(43,82,79)] py-[16px] focus:outline-none resize-none placeholder:text-[#2A534F] text-[#2A534F]" 
                placeholder={settings?.message?.az} 
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={submitting}
              className={`w-[150px] h-[50px] bg-[#886B1F] text-[rgb(255,255,255)] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#886B1F] border-2 transition-all duration-150 border-[#886B1F] ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Göndərilir...' : 'Göndər'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
