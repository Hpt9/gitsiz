import { useState, useEffect } from 'react';
// import { FaPersonRifle } from 'react-icons/fa6'; // Remove unused import
import useUserStore from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { base_url } from '../../components/expoted_images';
export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const fetchUserProfile = useUserStore(state => state.fetchUserProfile);
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (localStorage.getItem('token') === null) {
      navigate('/daxil-ol');
    }
  }, [user, navigate]);

  // Local state for editing, initialized from user data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleEdit = async () => {
    if (isEditing) {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.put(
          `${base_url}/user/edit`,
          {
            name: profileData.fullName,
            email: profileData.email,
            phone: profileData.phone
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data); // update user in store if needed
      } catch (error) {
        console.error('Profile update error:', error);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-[1920px] lg:px-[170px] lg:py-[64px]">
      <div className="w-full bg-[url('/src/assets/blog_image.svg')] bg-[#2A534F] bg-cover bg-center h-[120px]">
        <h1 className="text-[32px] text-white font-bold p-[24px]">Profil</h1>
      </div>

      <div className="bg-[#F9F9F9] rounded-b-[8px] p-[24px]">
        <div className="flex flex-col items-start gap-y-[24px]">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[20px] font-semibold text-[#2A534F]">
              {isEditing ? 'Redaktə et' : 'Şəxsi məlumatlarım'}
            </h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-[14px] text-[#2A534F] hover:text-[#1a3331]"
              >
                Redaktə et
              </button>
            )}
          </div>

          <div className="flex items-center gap-x-[16px]">
            <div className="w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="w-full space-y-[16px]">
            <div className="space-y-[8px]">
              <label className="text-[14px] text-gray-600">Ad, soyad</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                />
              ) : (
                <p className="text-[14px]">{profileData.fullName}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <label className="text-[14px] text-gray-600">E-poçt ünvanı</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                />
              ) : (
                <p className="text-[14px]">{profileData.email}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <label className="text-[14px] text-gray-600">Mobil nömrə</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full p-[12px] border border-gray-300 rounded-[4px]"
                />
              ) : (
                <p className="text-[14px]">{profileData.phone}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-x-[16px] w-full">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 p-[12px] border border-[#2A534F] text-[#2A534F] rounded-[4px] hover:bg-gray-50"
              >
                Ləğv et
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 p-[12px] bg-[#977F2E] text-white rounded-[4px] hover:bg-[#876f29]"
              >
                Yadda saxla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
