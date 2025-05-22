import { useNavigate, useParams } from "react-router-dom";
import useLanguageStore from "../../store/languageStore";
import { useEffect, useState } from "react";

export const SingleAnnouncement = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // id is actually the slug
    const { language } = useLanguageStore();
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState(null);
    const [similarAnnouncements, setSimilarAnnouncements] = useState([]);

    const getFirstImage = (imagesString) => {
        try {
            const images = JSON.parse(imagesString);
            return images[0] ? `https://kobklaster.tw1.ru/storage/${images[0]}` : null;
        } catch {
            return null;
        }
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

            <div className="w-full max-w-[1200px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Image */}
                    <div className="lg:w-1/2">
                        <div className="aspect-[4/3] bg-[#2A534F] rounded-[16px] relative overflow-hidden">
                            {announcement.images && (
                                <img
                                    src={getFirstImage(announcement.images)}
                                    alt={announcement.name}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                />
                            )}
                            <h1 className="absolute bottom-4 left-4 text-4xl font-bold text-white">
                                {announcement.name}
                            </h1>
                        </div>
                    </div>

                    {/* Right Side - Details */}
                    <div className="lg:w-1/2">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-[#2A534F]">{announcement.user?.name}</h2>
                            <p className="text-gray-600">{announcement.service_name}</p>
                            <p className="text-gray-500 text-sm">{new Date(announcement.created_at).toLocaleDateString()}</p>
                        </div>

                        {/* Two Column List */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                            <div>
                                <p className="text-[#2A534F]">{announcement.cluster?.name}</p>
                                {/* If you have region info, add here */}
                            </div>
                            <div>
                                {/* Add more info if needed */}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: announcement.text }} />

                        {/* Contact Info */}
                        {announcement.user?.phone && (
                            <div className="mb-4">
                                <span className="font-semibold">Phone: </span>{announcement.user.phone}
                            </div>
                        )}
                        {announcement.website && (
                            <div className="mb-4">
                                <span className="font-semibold">Website: </span>
                                <a href={announcement.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{announcement.website}</a>
                            </div>
                        )}
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
                                            src={getFirstImage(item.images)}
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
        </div>
    );
}; 