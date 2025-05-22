import { useNavigate, useParams } from "react-router-dom";
import useLanguageStore from "../../store/languageStore";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    const sliderImages = imagesArr.length > 0 ? imagesArr : (announcement.cover_photo ? [announcement.cover_photo] : []);
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
        autoplay: false,
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto min-h-[calc(100vh-492px)] py-8 px-4 lg:px-[50px] xl:px-[100px]">
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

            <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
                {/* Image Slider */}
                <div className="w-full lg:w-1/2">
                    <Slider {...sliderSettings}>
                        {sliderImages.map((img, idx) => (
                            <div key={idx} className="aspect-[4/3] bg-[#2A534F] flex items-center justify-center">
                                <img
                                    src={getImageUrl(img)}
                                    alt={announcement.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
                <div className="flex-1">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-[#2A534F] mb-2">
                            {announcement.name}
                        </h2>
                        <div className="text-[#2A534F] font-medium">
                            {announcement.user?.name}
                        </div>
                        <div className="text-gray-500 text-sm mb-1">
                            {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-600 text-sm mb-1">
                            {announcement.cluster?.name}
                        </div>
                        <div className="text-gray-600 text-sm mb-1">
                            {announcement.service_name}
                        </div>
                        <div className="text-gray-600 text-sm mb-1">
                            {announcement.text && (
                                <span dangerouslySetInnerHTML={{ __html: announcement.text }} />
                            )}
                        </div>
                        {announcement.website && (
                            <div className="text-gray-600 text-sm mb-1">
                                <span className="font-bold">Website: </span>
                                <a href={announcement.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                                    {announcement.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Similar Announcements */}
            {similarAnnouncements.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-semibold text-[#2A534F] mb-4">
                        {language === "az" ? "Bənzər elanlar" : 
                         language === "en" ? "Similar announcements" : 
                         "Похожие объявления"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {similarAnnouncements.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-[16px] border border-[#A0A0A0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleSimilarAnnouncementClick(item.slug)}
                            >
                                <div className="aspect-[4/3] bg-[#2A534F] relative">
                                    <img
                                        src={getImageUrl(getImagesArray(item.images)[0] || "")}
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
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 