import { useNavigate, useParams } from "react-router-dom";
import useLanguageStore from "../../store/languageStore";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

// Minimalist custom arrows for react-slick
const ArrowLeft = (props) => (
  <button
    {...props}
    type="button"
    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-1 shadow border border-gray-200"
    style={{ ...props.style, display: 'block' }}
    aria-label="Previous"
  >
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const ArrowRight = (props) => (
  <button
    {...props}
    type="button"
    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-1 shadow border border-gray-200"
    style={{ ...props.style, display: 'block' }}
    aria-label="Next"
  >
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export const SingleAnnouncement = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // id is actually the slug
    const { language } = useLanguageStore();
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState(null);
    const [similarAnnouncements, setSimilarAnnouncements] = useState([]);

    const getImagesArray = (images) => {
        if (!images) return [];
        if (typeof images === 'string' && images.startsWith('[')) {
            try {
                return JSON.parse(images);
            } catch {
                return [];
            }
        }
        if (Array.isArray(images)) return images;
        return [];
    };

    useEffect(() => {
        setLoading(true);
        fetch(`https://kobklaster.tw1.ru/api/adverts/${id}`)
            .then(res => res.json())
            .then(data => {
                setAnnouncement(data);
                setSimilarAnnouncements(data.related || []);
                setLoading(false);
            })
            .catch(() => {
                navigate('/elanlar');
                setLoading(false);
            });
    }, [id, navigate]);

    const handleSimilarAnnouncementClick = (slug) => {
        navigate(`/elanlar/${slug}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <span className="loader"></span>
            </div>
        );
    }

    if (!announcement) {
        return null;
    }

    const imagesArr = getImagesArray(announcement.images);
    // Parse cover images (could be a stringified array or a single string)
    let coverImages = [];
    if (announcement.cover_photo) {
      if (typeof announcement.cover_photo === 'string' && announcement.cover_photo.startsWith('[')) {
        try {
          coverImages = JSON.parse(announcement.cover_photo);
        } catch {
          coverImages = [];
        }
      } else {
        coverImages = [announcement.cover_photo];
      }
    }
    // Combine cover images and images array, but avoid duplicates
    const sliderImages = [
      ...coverImages,
      ...imagesArr.filter(img => !coverImages.includes(img)),
    ];
    const getImageUrl = (img) =>
        img.startsWith('http')
            ? img
            : `https://kobklaster.tw1.ru/storage/${img.replace(/^adverts\//, 'adverts/')}`;
    const sliderSettings = {
        infinite: true,
        dots: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: <ArrowLeft />,
        nextArrow: <ArrowRight />,
        autoplay: false,
    };

    const similarSliderSettings = {
        infinite: false,
        dots: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        arrows: true,
        prevArrow: <ArrowLeft />,
        nextArrow: <ArrowRight />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="w-full max-w-[1920px] min-h-[calc(100vh-492px)] py-8 px-4 lg:px-[50px] xl:px-[100px]">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/elanlar')}
                className="mb-6 flex items-center text-[#2A534F] hover:text-[#1a3330] transition-colors"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className="w-6 h-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-8">
                {/* Image Slider */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                    <div className="w-full h-fit aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 relative asdfg">
                        <Slider {...sliderSettings} className="h-[450px]">
                            {sliderImages.map((img, idx) => (
                                <div key={idx} className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={getImageUrl(img)}
                                        alt={announcement.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
                {/* Info Section */}
                <div className="flex-1 flex flex-col">
                    {/* Title and Meta */}
                    <h2 className="text-3xl font-bold text-[#2A534F] mb-2">{announcement.name}</h2>
                    <div className="text-[#2A534F] font-medium">{announcement.user?.name}</div>
                    <div className="text-gray-500 text-sm mb-1">{new Date(announcement.created_at).toLocaleDateString()}</div>

                    {/* Two-column Info Grid */}
                    <div className="grid grid-cols-2 gap-x-1 gap-y-1 my-4 w-[250px]">
                        <div className="text-gray-700">Email:</div>
                        <div className="text-gray-900">{announcement.user?.email}</div>
                        <div className="text-gray-700">Telefon:</div>
                        <div className="text-gray-900">{announcement.user?.phone}</div>
                        <div className="text-gray-700">Klaster:</div>
                        <div className="text-gray-900">{announcement.cluster?.name}</div>
                        <div className="text-gray-700">Xidmət:</div>
                        <div className="text-gray-900">{announcement.service_name}</div>
                        <div className="text-gray-700">Website:</div>
                        <div className="text-gray-900 w-full">
                            <a href='#' className="text-blue-600 " target="_blank" rel="noopener noreferrer">
                                {announcement.website}
                            </a>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4 text-gray-700">
                        <span className="font-bold">Açıqlama: </span>
                        {announcement.text && (
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.text) }} />
                        )}
                    </div>
                </div>
            </div>

            {/* Similar Announcements */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold text-[#2A534F] mb-4">
                    {language === "az" ? "Bənzər elanlar" : 
                     language === "en" ? "Similar announcements" : 
                     "Похожие объявления"}
                </h3>
                {similarAnnouncements.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        {language === "az"
                            ? "Oxşar elan yoxdur"
                            : language === "en"
                            ? "No similar announcements"
                            : "Похожих объявлений нет"}
                    </div>
                ) : (
                    <Slider {...similarSliderSettings}>
                        {similarAnnouncements.map((item) => (
                            <div key={item.id} className="p-2">
                                <div 
                                    className="bg-white rounded-[16px] border border-[#A0A0A0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleSimilarAnnouncementClick(item.slug)}
                                >
                                    <div className="aspect-[4/3] bg-[#2A534F] relative">
                                        <img
                                            src={getImageUrl(item.cover_photo)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                        />
                                        <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                                            {item.name}
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[#2A534F] font-medium">{item.service_name}</p>
                                        <p className="text-sm text-gray-500 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                )}
            </div>
        </div>
    );
}; 