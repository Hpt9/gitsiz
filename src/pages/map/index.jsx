import { useState, useEffect } from "react";
import { MapSVG } from "./components/mapSVG";
import { Region } from "./components/Region";
import { AnimatePresence, motion } from "framer-motion";
import { updatePageTitle } from '../../utils/updatePageTitle';
import useLanguageStore from "../../store/languageStore";
import axios from 'axios';

export const MapPage = () => {
  const { language } = useLanguageStore();
  const [isRegion, setIsRegion] = useState(false);
  const [element, setElement] = useState("");
  const [loading, setLoading] = useState(true);
  const [regionData, setRegionData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [economicalZonesData, setEconomicalZonesData] = useState(null);

  useEffect(() => {
    updatePageTitle('Klaster xəritəsi');
  }, []);

  // Initial data fetch when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch both datasets in parallel
        const [filterResponse, zonesResponse] = await Promise.all([
          fetch('https://kobklaster.tw1.ru/api/filter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              economical_zone_id: [],
              method_id: [],
              cluster_id: []
            })
          }),
          axios.get('https://kobklaster.tw1.ru/api/economical-zones')
        ]);

        const filterData = await filterResponse.json();
        setAllData(filterData);
        setEconomicalZonesData(zonesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
      <div className="blog_header w-full mobile:pt-[16px] mobile:pb-[64px] mobile:px-[16px] lg:px-[100px] lg:py-[102px] bg-[rgb(42,83,79)] relative">
        <h1 className="mobile:text-[32px] leading-[39px] lg:text-[61px] font-bold text-[rgb(255,255,255)]">
        {language === 'az' ? 'KOB Klaster xəritəsi' : 
         language === 'en' ? 'SME Cluster Map' : 
         'КОБ Кластер карта'}
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
                  className="flex flex-col gap-y-[120px] justify-center"
                  key="map"
                  initial={{ opacity: 0}}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[#2A534F] mobile:text-left lg:text-center text-[24px] leading-[29px] font-bold">
                  {language === 'az' ? 'İqtisadi rayonlar üzrə klaster potensialı haqqında məlumat' : 
                   language === 'en' ? 'Information about the cluster potential in economic regions' : 
                   'Информация о потенциале кластеров в экономических районах'}
                  </p>
                  <MapSVG 
                    setIsRegion={setIsRegion} 
                    setElement={setElement} 
                    setRegionData={setRegionData} 
                    allData={allData}
                    economicalZonesData={economicalZonesData}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="region"
                  className="w-full flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0}}
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
