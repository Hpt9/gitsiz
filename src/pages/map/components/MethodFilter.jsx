import { useState } from 'react';
import PropTypes from 'prop-types';
import useLanguageStore from '../../../store/languageStore';
export const MethodFilter = ({ onMethodsChange, data, selectedRegions, selectedClusters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState([]);
  const { language } = useLanguageStore();
  const getAvailableMethods = () => {
    if (!data) return [];
    
    const uniqueMethods = new Set();
    data.forEach(item => {
      // Show methods based on selected regions and clusters
      const matchesRegion = selectedRegions.length === 0 || 
        selectedRegions.includes(item.economical_zone[0].id);
      const matchesCluster = selectedClusters.length === 0 || 
        selectedClusters.includes(item.cluster[0].id);
      
      if (matchesRegion && matchesCluster) {
        const method = item.method[0];
        uniqueMethods.add(JSON.stringify({
          id: method.id,
          name: method.name.az
        }));
      }
    });
    return Array.from(uniqueMethods).map(m => JSON.parse(m));
  };

  const handleCheckboxChange = (methodId, event) => {
    event.stopPropagation();
    
    let newSelectedMethods;
    if (selectedMethods.includes(methodId)) {
      newSelectedMethods = selectedMethods.filter(id => id !== methodId);
    } else {
      newSelectedMethods = [...selectedMethods, methodId];
    }
    
    setSelectedMethods(newSelectedMethods);
    onMethodsChange(newSelectedMethods);
  };

  const handleReset = (event) => {
    event.stopPropagation();
    setSelectedMethods([]);
    onMethodsChange([]);
  };

  const methods = getAvailableMethods();

  return (
    <div className="relative tablet:w-[50%] mobile:w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2A534F] rounded-[4px] shadow-lg px-[12px] py-[11px] mobile:w-full tablet:w-[200px] lg:w-[280px] flex justify-between gap-x-[8px] items-center"
      >
        <span className="text-[12px] font-semibold text-[white]">
          {language === 'az' ? 'Metod' : 
           language === 'en' ? 'Method' : 
           'Метод'}
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
          className="absolute top-full left-0 w-full mt-2 bg-[rgba(255,255,255,.8)] rounded-lg shadow-lg mobile:p-2 lg:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {methods.map((method) => (
              <label
                key={method.id}
                className="flex items-center justify-between space-x-3 pr-[6px] py-[2px] rounded cursor-pointer group hover:bg-gray-100"
              >
                <span className="text-gray-700 group-hover:text-[#2A534F] mobile:text-[12px] lg:text-[16px]">
                  {method.name}
                </span>
                <input
                  type="checkbox"
                  checked={selectedMethods.includes(method.id)}
                  onChange={(event) => handleCheckboxChange(method.id, event)}
                  className="mobile:w-[12px] mobile:h-[12px] lg:w-4 lg:h-4 text-[#2A534F] border-gray-300 rounded focus:ring-[#2A534F]"
                />
              </label>
            ))}
          </div>
          
          {selectedMethods.length > 0 && (
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

MethodFilter.propTypes = {
  onMethodsChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  selectedRegions: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedClusters: PropTypes.arrayOf(PropTypes.number).isRequired
}; 