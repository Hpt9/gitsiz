import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useLanguageStore from '../../../store/languageStore';

export const RegionFilter = ({ onRegionsChange, data, selectedClusters, selectedMethods, resetTrigger }) => {
  const { language } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);

  useEffect(() => {
    setSelectedRegions([]);
  }, [resetTrigger]);

  const getAvailableRegions = () => {
    if (!data) return [];
    
    const uniqueRegions = new Set();
    data.forEach(item => {
      // Show regions based on selected clusters and methods
      const matchesCluster = selectedClusters.length === 0 || 
        selectedClusters.includes(item.cluster[0].id);
      
      const matchesMethod = selectedMethods.length === 0 || 
        selectedMethods.includes(item.method[0].id);

      if (matchesCluster && matchesMethod) {
        const region = item.economical_zone[0];
        uniqueRegions.add(JSON.stringify({
          id: region.id,
          name: region.name.az,
          slug: region.slug
        }));
      }
    });
    return Array.from(uniqueRegions).map(r => JSON.parse(r));
  };

  const handleCheckboxChange = (regionId, event) => {
    event.stopPropagation();
    
    let newSelectedRegions;
    if (selectedRegions.includes(regionId)) {
      // Remove if already selected
      newSelectedRegions = selectedRegions.filter(id => id !== regionId);
    } else {
      // Add if not selected
      newSelectedRegions = [...selectedRegions, regionId];
    }
    
    setSelectedRegions(newSelectedRegions);
    onRegionsChange(newSelectedRegions);
  };

  const handleReset = (event) => {
    event.stopPropagation();
    setSelectedRegions([]);
    onRegionsChange([]);
  };

  const regions = getAvailableRegions();

  return (
    <div className="relative tablet:w-[50%] mobile:w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2A534F] rounded-[4px] shadow-lg px-[12px] py-[11px] mobile:w-full tablet:w-[200px] lg:w-[280px] flex justify-between gap-x-[8px] items-center"
      >
        <span className="text-[12px] font-semibold text-[white]">
          {language === 'az' ? 'İqtisadi Rayon' : 
           language === 'en' ? 'Economic Region' : 
           'Экономический район'}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform text-white ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full z-[1000] left-0 w-full mt-1 bg-[rgba(255,255,255,.8)] rounded-lg shadow-lg p-4"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing dropdown
        >
          <div className="space-y-2 mobile:max-h-[200px] lg:max-h-[400px] overflow-y-auto custom-scrollbar">
            {regions.map((region) => (
              <label
                key={region.id}
                className="flex items-center justify-between space-x-3 pr-[6px] py-[2px] rounded cursor-pointer group hover:bg-gray-100"
              >
                <span className="text-gray-700 group-hover:text-[#2A534F] mobile:text-[12px] lg:text-[16px] ">
                  {region.name}
                </span>
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region.id)}
                  onChange={(e) => handleCheckboxChange(region.id, e)}
                  className="w-4 h-4 text-[#2A534F] border-gray-300 rounded focus:ring-[#2A534F]"
                />
              </label>
            ))}
          </div>
          
          {selectedRegions.length > 0 && (
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {language === 'az' ? 'Sıfırla' : 
                 language === 'en' ? 'Reset' : 
                 'Сбросить'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

RegionFilter.propTypes = {
  onRegionsChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  selectedClusters: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedMethods: PropTypes.arrayOf(PropTypes.number).isRequired,
  resetTrigger: PropTypes.bool.isRequired
}; 