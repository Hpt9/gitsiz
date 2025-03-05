import { region_svgs } from "../../../components/expoted_images.jsx";
import { AnimatePresence, motion } from "framer-motion";
import PropTypes from 'prop-types';
import "./map.css"; // Make sure to import the CSS
import React, { useState, useEffect } from 'react';

export const Region = ({ regionData, element, setIsRegion }) => {
  if (!regionData || !regionData[0]) {
    return <div>Loading...</div>;
  }
  
  // console.log('Region Component Data:', regionData);
  
  const [isClusterOpen, setIsClusterOpen] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [zones, setZones] = useState([]);
  const regionColors = {
    'qarabagh': '#977F2E',
    'ganja-dashkasan': '#41655F',
    'qazax-tovuz': '#30504A',
    'quba-xacmaz': '#3D6861',
    'zaqatala-sheki': '#688B84',
    'dagliq-shirvan': '#749792',
    'merkezi-aran': '#385953',
    'baku': '#749792',
    'shirvan-salyan': '#36625D',
    'mil-mughan': '#719D96',
    'naxchivan': '#22423E',
    'sherqi-zengezur': '#2C5650',
    'lankaran-astara': '#264A43',
    'absheron-xizi': '#22423E'
  };

  // Get unique methods from regionData
  const getAvailableMethods = () => {
    if (!regionData) return [];
    
    const uniqueMethods = new Set();
    regionData.forEach(item => {
      const method = item.method[0];
      uniqueMethods.add(JSON.stringify({
        id: method.id,
        name: method.name.az
      }));
    });
    return Array.from(uniqueMethods).map(m => JSON.parse(m));
  };

  // Get the available methods
  const availableMethods = getAvailableMethods();

  // Get unique clusters from regionData based on selected method
  const getAvailableClusters = () => {
    if (!regionData) return [];
    
    const uniqueClusters = new Set();
    regionData.forEach(item => {
      // Only include clusters that match the selected method
      if (!selectedMethod || item.method[0].id === selectedMethod) {
        const cluster = item.cluster[0];
        uniqueClusters.add(JSON.stringify({
          id: cluster.id,
          name: cluster.name.az
        }));
      }
    });
    return Array.from(uniqueClusters).map(c => JSON.parse(c));
  };

  // Get the available clusters
  const availableClusters = getAvailableClusters();

  // First useEffect - for setting initial method
  useEffect(() => {
    if (availableMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(availableMethods[0].id);
    }
  }, [availableMethods, selectedMethod]);

  // Second useEffect - for resetting clusters
  useEffect(() => {
    setSelectedClusters([]);
  }, [selectedMethod]);

  // Third useEffect - for fetching zones
  useEffect(() => {
    if (regionData && regionData[0]?.economical_zone[0]?.slug) {
      fetch(`https://kobklaster.tw1.ru/api/economical-zones/${regionData[0].economical_zone[0].slug}`)
        .then(response => response.json())
        .then(data => {
          setZones(data.zones);
        })
        .catch(error => console.error('Error fetching region data:', error));
    }
  }, [regionData]);

  const selectedRegion = region_svgs.find((region) => region.name === element);
  // console.log(regionData[0].economical_zone[0].name['az']);
  if (!selectedRegion) return null;
  // console.log(regionData)

  // Helper function to recursively modify SVG elements
  const modifyChildren = (element) => {
    if (!element || !React.isValidElement(element)) return element;

    // If it's a path element, update its fill color
    if (element.type === 'path') {
      return React.cloneElement(element, {
        fill: regionColors[selectedRegion.name],
        style: { transition: 'fill 0.3s ease' }
      });
    }

    // If it has children, recursively process them
    if (element.props.children) {
      const newChildren = React.Children.map(element.props.children, modifyChildren);
      return React.cloneElement(element, {}, newChildren);
    }

    return element;
  };

  // Create a modified version of the SVG with the correct fill color
  const modifiedSvg = React.cloneElement(selectedRegion.element, {
    className: "w-full h-full",
    preserveAspectRatio: "xMidYMid meet",
  }, React.Children.map(selectedRegion.element.props.children, modifyChildren));
  // {element.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}

  const getFilteredData = () => {
    if (!regionData) return [];
    
    const uniqueRows = new Set();
    
    return regionData
      .filter(item => {
        const matchesCluster = selectedClusters.length === 0 || 
          selectedClusters.includes(item.cluster[0].id);
        const matchesMethod = !selectedMethod || 
          item.method[0].id === selectedMethod;
        
        return matchesCluster && matchesMethod;
      })
      .map(item => ({
        cluster: item.cluster[0].name.az,
        product: item.product[0].name.az
      }))
      .filter(row => {
        const key = `${row.cluster}-${row.product}`;
        if (!uniqueRows.has(key)) {
          uniqueRows.add(key);
          return true;
        }
        return false;
      });
  };

  const handleClusterChange = (clusterId) => {
    setSelectedClusters(prev => 
      prev.includes(clusterId) 
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const handleMethodChange = (methodId) => {
    setSelectedMethod(methodId);
  };

  return (
    <div className="flex flex-col gap-y-[20px] w-full max-w-[1920px]">
      {/* Back Button - Absolute positioned on mobile */}
      <button 
        onClick={() => setIsRegion(false)}
        className="mobile:absolute mobile:top-[30px] mobile:left-[16px] lg:relative lg:top-0 lg:left-0 w-fit px-2 py-2 bg-[white] border border-[#2a534f] text-[#2a534f] hover:text-white hover:bg-[#2a534f] rounded transition-colors z-[10]"
      >
        <svg 
          className="w-5 h-5 transition-transform rotate-90"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Title */}
      <p className="text-[#2A534F] text-center mobile:text-[18px] lg:text-[24px] font-bold">
        {regionData[0].economical_zone[0].name['az']} iqtisadi rayonu üzrə KOB Klasterlər
      </p>

      {/* Main Content Container */}
      <div className="flex mobile:flex-col lg:flex-row w-full mobile:gap-4 lg:gap-8 lg:px-4">
        {/* Left side - Map on mobile, Filters and Table on desktop */}
        <div className="mobile:w-full lg:w-1/2 flex flex-col gap-y-4">
          {/* Map Container - Only visible on mobile */}
          <div className="lg:hidden w-full h-[300px] flex items-center justify-center  rounded-lg">
            <AnimatePresence>
              <motion.div 
                className="w-full h-full flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {modifiedSvg}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Filters Container */}
          <div className="flex mobile:gap-x-2 lg:gap-x-4">
            {/* Cluster Filter */}
            <div className="filter-section flex-1">
              <button 
                onClick={() => setIsClusterOpen(!isClusterOpen)}
                className="w-full flex justify-between items-center mobile:p-2 lg:p-3 bg-[#2A534F] text-white rounded"
              >
                <span className="mobile:text-[14px] lg:text-[16px]">Klaster</span>
                <svg className={`mobile:w-4 lg:w-5 mobile:h-4 lg:h-5 transition-transform ${isClusterOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isClusterOpen && (
                <div className="p-1 bg-gray-100 rounded mt-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {availableClusters.map(cluster => (
                    <label key={cluster.id} className="flex items-center justify-between gap-2 p-2">
                      <span className="text-[#2A534F] text-[12px]">{cluster.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedClusters.includes(cluster.id)}
                        onChange={() => handleClusterChange(cluster.id)}
                        className="form-checkbox text-[#2A534F]"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Method Filter */}
            <div className="filter-section flex-1">
              <button 
                onClick={() => setIsMethodOpen(!isMethodOpen)}
                className="w-full flex justify-between items-center mobile:p-2 lg:p-3 bg-[#2A534F] text-white rounded"
              >
                <span className="mobile:text-[14px] lg:text-[16px]">Metod</span>
                <svg className={`mobile:w-4 lg:w-5 mobile:h-4 lg:h-5 transition-transform ${isMethodOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMethodOpen && (
                <div className="p-1 bg-gray-100 rounded mt-1">
                  {availableMethods.map(method => (
                    <label key={method.id} className="flex items-center justify-between gap-2 p-2">
                      <span className="text-[#2A534F] text-[12px]">{method.name}</span>
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethod === method.id}
                        onChange={() => handleMethodChange(method.id)}
                        className="form-radio text-[#2A534F]"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="mt-4 relative">
            <div className="bg-white rounded shadow">
              {/* Fixed Header */}
              <div className="sticky top-0 z-10">
                <table className="w-full">
                  <thead>
                    <tr className="w-full">
                      <th className="text-left mobile:text-[12px] lg:text-sm font-medium text-white bg-[#2A534F] w-[50%] py-[10px] pl-[16px] pr-[16px]">
                        Məhsul qrupu
                      </th>
                      <th className="text-left mobile:text-[12px] lg:text-sm font-medium text-white bg-[#2A534F] w-[50%] py-[10px] pl-[16px] pr-[16px]">
                        Məhsul
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredData().map((row, index) => (
                      <tr key={index}>
                        <td className="mobile:text-[12px] lg:text-sm text-gray-900 pl-[16px] py-[10px] pr-[10px] w-[51%]">
                          {row.cluster}
                        </td>
                        <td className="mobile:text-[12px] lg:text-sm text-gray-900 pl-[16px] py-[10px] pr-[10px] w-[49%]">
                          {row.product}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Region Information Text */}
          <div className="mt-4 text-[#2A534F]">
            <div className="flex flex-col">
              <p className="mobile:text-[12px] lg:text-[14px]">
                Əhalinin sayı - {regionData[0].economical_zone[0].population}
              </p>
              <p className="mobile:text-[12px] lg:text-[14px]">
                Əhalinin sıxlığı - {regionData[0].economical_zone[0].density}
              </p>
              <p className="mobile:text-[12px] lg:text-[14px] mt-[10px]">
                {regionData[0].economical_zone[0].name['az']} iqtisadi rayonuna daxildir:
              </p>
              <ul className="list-none mt-[5px] space-y-1">
                {zones.map((zone, index) => (
                  <li key={index} className="mobile:text-[12px] lg:text-[14px]">
                    {zone.name?.az}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right side - Map on desktop */}
        <div className="mobile:hidden lg:flex lg:w-1/2 items-center justify-center">
          <AnimatePresence>
            <motion.div 
              className="w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              {modifiedSvg}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

Region.propTypes = {
  regionName: PropTypes.string,
  regionData: PropTypes.array,
  element: PropTypes.string.isRequired,
  setIsRegion: PropTypes.func.isRequired
};
