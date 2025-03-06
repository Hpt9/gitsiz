import { useState, useEffect } from "react";
import { MapSVG } from "./components/mapSVG";
import { Region } from "./components/Region";
import { AnimatePresence, motion } from "framer-motion";
import { updatePageTitle } from '../../utils/updatePageTitle';
export const MapPage = () => {
  useEffect(() => {
    updatePageTitle('Klaster xəritəsi');
  }, []);
  const [isRegion, setIsRegion] = useState(false);
  const [element, setElement] = useState("");
  const [loading, setLoading] = useState(true);
  const [regionData, setRegionData] = useState(null);
  const [allData, setAllData] = useState([]);

  // Initial data fetch when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('https://kobklaster.tw1.ru/api/filter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            economical_zone_id: [],
            method_id: [],
            cluster_id: []
          })
        });
        const data = await response.json();
        setAllData(data);
        //console.log(data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update regionData when element or allData changes
  useEffect(() => {
    if (element && allData.length > 0) {
      const filteredData = allData.filter(item => 
        item.economical_zone[0].slug === element
      );
      setRegionData(filteredData);
    }
  }, [element, allData]);

  return (
    <div className="w-full">
      <div className="blog_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[170px] lg:py-[102px] bg-[rgb(42,83,79)] relative">
        <h1 className="mobile:text-[32px] leading-[39px] lg:text-[61px] font-bold text-[rgb(255,255,255)]">
          KOB Klaster xəritəsi
        </h1>
      </div>
      <div className="w-full flex flex-col relative left-[50%] translate-x-[-50%] mobile:px-[16px] mobile:py-[32px] lg:py-[64px] lg:px-[90px] 2xl:px-[170px] lg:pt-[74px] lg:gap-y-[80px]">
        <div className="w-full relative">
          {loading ? (
            <div className="flex justify-center items-center h-[50vh]">
              <span className="loader"></span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isRegion ? (
                <motion.div
                  className="flex flex-col gap-y-[120px]"
                  key="map"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[#2A534F] mobile:text-left lg:text-center text-[24px] leading-[29px] font-bold">
                    İqtisadi zonalar üzrə klaster potensialı haqqında məlumat
                  </p>
                  <MapSVG 
                    setIsRegion={setIsRegion} 
                    setElement={setElement} 
                    setRegionData={setRegionData} 
                    allData={allData}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="region"
                  className="w-full flex justify-center items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Region 
                    setIsRegion={setIsRegion} 
                    element={element} 
                    regionData={regionData} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
