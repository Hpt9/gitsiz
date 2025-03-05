import { useState } from 'react';
import PropTypes from 'prop-types';

export const ClusterFilter = ({ selectedRegions, onClustersChange, data, selectedMethods }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState([]);

  const getAvailableClusters = () => {
    if (!data) return [];
    
    const uniqueClusters = new Set();
    data.forEach(item => {
      // Show clusters based on selected regions and methods
      const matchesRegion = selectedRegions.length === 0 || 
        selectedRegions.includes(item.economical_zone[0].id);
      
      const matchesMethod = selectedMethods.length === 0 || 
        selectedMethods.includes(item.method[0].id);

      if (matchesRegion && matchesMethod) {
        const cluster = item.cluster[0];
        uniqueClusters.add(JSON.stringify({
          id: cluster.id,
          name: cluster.name.az
        }));
      }
    });
    return Array.from(uniqueClusters).map(c => JSON.parse(c));
  };

  const handleCheckboxChange = (clusterId, event) => {
    event.stopPropagation();
    
    let newSelectedClusters;
    if (selectedClusters.includes(clusterId)) {
      // Remove if already selected
      newSelectedClusters = selectedClusters.filter(id => id !== clusterId);
    } else {
      // Add if not selected
      newSelectedClusters = [...selectedClusters, clusterId];
    }
    
    setSelectedClusters(newSelectedClusters);
    onClustersChange(newSelectedClusters);
  };

  const handleReset = (event) => {
    event.stopPropagation();
    setSelectedClusters([]);
    onClustersChange([]);
  };

  const availableClusters = getAvailableClusters();

  return (
    <div className="relative tablet:w-[50%] mobile:w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2A534F] rounded-[4px] shadow-lg px-[12px] py-[11px] mobile:w-full tablet:w-[200px] lg:w-[280px] flex justify-between gap-x-[8px] items-center"
      >
        <span className="text-[12px] font-semibold text-[white]">
          Klasterlər
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
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2 mobile:max-h-[200px] lg:max-h-[400px] overflow-y-auto custom-scrollbar">
            {availableClusters.map((cluster) => (
              <label
                key={cluster.id}
                className="flex items-center justify-between space-x-3 pr-[6px] py-[2px] rounded cursor-pointer group hover:bg-gray-100"
              >
                <span className="text-gray-700 group-hover:text-[#2A534F] mobile:text-[12px] lg:text-[16px]">
                  {cluster.name}
                </span>
                <input
                  type="checkbox"
                  checked={selectedClusters.includes(cluster.id)}
                  onChange={(event) => handleCheckboxChange(cluster.id, event)}
                  className="mobile:w-[12px] mobile:h-[12px] lg:w-4 lg:h-4 text-[#2A534F] border-gray-300 rounded focus:ring-[#2A534F]"
                />
              </label>
            ))}
          </div>
          
          {selectedClusters.length > 0 && (
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Sıfırla
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ClusterFilter.propTypes = {
  selectedRegions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClustersChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  selectedMethods: PropTypes.arrayOf(PropTypes.number).isRequired
}; 