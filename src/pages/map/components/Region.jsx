import { region_svgs } from "../../../components/expoted_images.jsx";
import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";
import "./map.css"; // Make sure to import the CSS
import React, { useState, useEffect } from "react";
import useLanguageStore from "../../../store/languageStore";
export const Region = ({ regionData, element, setIsRegion }) => {
  //console.log(regionData)
  const { language } = useLanguageStore();
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
    "qarabagh": "#22423E",
    "ganja-dashkasan": "#41655F",
    "qazax-tovuz": "#30504A",
    "quba-xacmaz": "#3D6861",
    "zaqatala-sheki": "#688B84",
    "dagliq-shirvan": "#749792",
    "merkezi-aran": "#385953",
    "baku": "#749792",
    "shirvan-salyan": "#36625D",
    "mil-mughan": "#719D96",
    "naxchivan": "#22423E",
    "sherqi-zengezur": "#2C5650",
    "lankaran-astara": "#264A43",
    "absheron-xizi": "#22423E",
  };

  // Get unique methods from regionData
  const getAvailableMethods = () => {
    if (!regionData) return [];

    const uniqueMethods = new Set();
    regionData.forEach((item) => {
      const method = item.method[0];
      uniqueMethods.add(
        JSON.stringify({
          id: method.id,
          name: method.name.az,
        })
      );
    });
    return Array.from(uniqueMethods).map((m) => JSON.parse(m));
  };

  // Get the available methods
  const availableMethods = getAvailableMethods();

  // Get unique clusters from regionData based on selected method
  const getAvailableClusters = () => {
    if (!regionData) return [];

    const uniqueClusters = new Set();
    regionData.forEach((item) => {
      // Only include clusters that match the selected method
      if (!selectedMethod || item.method[0].id === selectedMethod) {
        const cluster = item.cluster[0];
        uniqueClusters.add(
          JSON.stringify({
            id: cluster.id,
            name: cluster.name.az,
          })
        );
      }
    });
    return Array.from(uniqueClusters).map((c) => JSON.parse(c));
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
      fetch(
        `https://kobklaster.tw1.ru/api/economical-zones/${regionData[0].economical_zone[0].slug}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data.zones);
          setZones(data.zones);
        })
        .catch((error) => console.error("Error fetching region data:", error));
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
    if (element.type === "path") {
      return React.cloneElement(element, {
        fill: regionColors[selectedRegion.name],
        style: { transition: "fill 0.3s ease" },
      });
    }

    // If it has children, recursively process them
    if (element.props.children) {
      const newChildren = React.Children.map(
        element.props.children,
        modifyChildren
      );
      return React.cloneElement(element, {}, newChildren);
    }

    return element;
  };

  // Create a modified version of the SVG with the correct fill color
  const modifiedSvg = React.cloneElement(
    selectedRegion.element,
    {
      className: "w-full h-full",
      preserveAspectRatio: "xMidYMid meet",
    },
    React.Children.map(selectedRegion.element.props.children, modifyChildren)
  );
  // {element.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}

  const getFilteredData = () => {
    if (!regionData) return [];

    const uniqueRows = new Set();

    return regionData
      .filter((item) => {
        const matchesCluster =
          selectedClusters.length === 0 ||
          selectedClusters.includes(item.cluster[0].id);
        const matchesMethod =
          !selectedMethod || item.method[0].id === selectedMethod;

        return matchesCluster && matchesMethod;
      })
      .map((item) => ({
        cluster: item.cluster[0].name.az,
        product: item.product[0].name.az,
      }))
      .filter((row) => {
        const key = `${row.cluster}-${row.product}`;
        if (!uniqueRows.has(key)) {
          uniqueRows.add(key);
          return true;
        }
        return false;
      });
  };

  const handleClusterChange = (clusterId) => {
    setSelectedClusters((prev) =>
      prev.includes(clusterId)
        ? prev.filter((id) => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const handleMethodChange = (methodId) => {
    console.log(methodId);
    setSelectedMethod(methodId);
  };
  const returnMethod = (methodId) => {
    if (methodId === 2) {
      return " - Təmərküzləşmə";
    } else if (methodId === 3) {
      return " - Beynəlxalq Potensiallı";
    }
  };

  const calculateTotals = () => {
    if (!zones.length) return null;

    return zones.reduce(
      (totals, zone) => ({
        population: (totals.population || 0) + zone.population_thousand_people,
        pensioners: (totals.pensioners || 0) + zone.number_of_pensioners,
        children:
          (totals.children || 0) + zone.number_of_children_thousand_people,
        young_people: (totals.young_people || 0) + zone.number_of_young_people,
        students: (totals.students || 0) + zone.number_of_students,
        paid_workers:
          (totals.paid_workers || 0) +
          zone.number_of_paid_workers_thousand_people,
        self_employed:
          (totals.self_employed || 0) +
          zone.number_of_registered_self_empleyeers,
        micro_enterprises:
          (totals.micro_enterprises || 0) +
          zone.number_of_registered_micro_employeer_entites,
        small_enterprises:
          (totals.small_enterprises || 0) +
          zone.number_of_registered_small_employeer_entites,
        middle_enterprises:
          (totals.middle_enterprises || 0) +
          zone.number_of_registered_middle_employeer_entites,
        large_enterprises:
          (totals.large_enterprises || 0) +
          zone.number_of_registered_large_employeer_entites,
        motels: (totals.motels || 0) + zone.number_of_motels,
        total_circulation:
          (totals.total_circulation || 0) + zone.total_circulation,
        retail_sale: (totals.retail_sale || 0) + zone.retail_sale_turnover,
        paid_services:
          (totals.paid_services || 0) +
          zone.paid_services_provided_to_the_population,
        avg_salary: Math.round(
          ((totals.avg_salary || 0) * (totals.count || 0) +
            zone.average_monthly_nominal_salary) /
            (totals.count + 1)
        ),
        count: (totals.count || 0) + 1,
      }),
      {}
    );
  };

  const renderRegionTotals = () => {
    const totals = calculateTotals();
    if (!totals) return null;

    return (
      <div className="bg-white/10">
        <div className="grid grid-cols-2 grid-rows-8 gap-1">
          {/* <p className="mobile:text-[12px] lg:text-[14px] mb-1 h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Ümumi əhali"
              : language === "en"
              ? "Total population"
              : "Общее население"}
            : {totals.population} min
          </p> */}
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Uşaqların sayı"
              : language === "en"
              ? "Number of children"
              : "Количество детей"}
            : {totals.children} min
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Gənclərin sayı"
              : language === "en"
              ? "Number of young people"
              : "Количество молодежи"}
            : {totals.young_people} min
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Pensiyaçıların sayı"
              : language === "en"
              ? "Number of pensioners"
              : "Количество пенсионеров"}
            : {totals.pensioners}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Muzdlu işçilərin sayı (min nəfər)"
              : language === "en"
              ? "Number of workers"
              : "Количество работников"}
            : {totals.paid_workers} min
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Qeydiyyatda olan fərdi sahibkarların sayı"
              : language === "en"
              ? "Number of self-employed"
              : "Количество самозанятых"}
            : {totals.self_employed}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Tədris ilinin əvvəlində ümumi təhsil müəssisələrində şagirdlərin sayı"
              : language === "en"
              ? "Number of students"
              : "Количество студентов"}
            : {totals.students}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Orta aylıq əmək haqqı"
              : language === "en"
              ? "Average monthly salary"
              : "Средняя месячная зарплата"}
            : {totals.avg_salary} ₼
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Mikro müəssisələr"
              : language === "en"
              ? "Micro enterprises"
              : "Микропредприятия"}
            : {totals.micro_enterprises}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Kiçik müəssisələr"
              : language === "en"
              ? "Small enterprises"
              : "Малые предприятия"}
            : {totals.small_enterprises}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Orta müəssisələr"
              : language === "en"
              ? "Medium enterprises"
              : "Средние предприятия"}
            : {totals.middle_enterprises}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "İri müəssisələr"
              : language === "en"
              ? "Large enterprises"
              : "Крупные предприятия"}
            : {totals.large_enterprises}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Mehmanxanaların sayı"
              : language === "en"
              ? "Number of motels"
              : "Количество мотелей"}
            : {totals.motels}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Ümumi dövriyyə"
              : language === "en"
              ? "Total circulation"
              : "Общий оборот"}
            : {totals.total_circulation.toFixed(1)}
          </p>
          <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Pərakəndə ticarət dövriyyəsi"
              : language === "en"
              ? "Retail sales turnover"
              : "Оборот розничной торговли"}
            : {totals.retail_sale}
          </p>
            <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
            {language === "az"
              ? "Əhaliyə göstərilən ödənişli xidmətlər"
              : language === "en"
              ? "Paid services provided to population"
              : "Платные услуги населению"}
            : {totals.paid_services}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col mobile:gap-y-[20px] lg:gap-y-[64px] w-full max-w-[1920px]">
      {/* Back Button - Absolute positioned on mobile */}
      <div className="relative z-[10] flex items-center justify-between">
        <button
          onClick={() => setIsRegion(false)}
          className="mobile:absolute mobile:top-[62px] mobile:left-[0] lg:relative lg:top-0 lg:left-0 w-fit px-2 py-2 bg-[white] border border-[#2a534f] text-[#2a534f] hover:text-white hover:bg-[#2a534f] rounded transition-colors z-[10]"
        >
          <svg
            className="w-5 h-5 transition-transform rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Title */}
        <p className="text-[#2A534F] text-center mobile:text-[18px] lg:text-[24px] font-bold">
          {language === "az"
            ? regionData[0].economical_zone[0].name["az"] +
              " iqtisadi rayonu üzrə KOB Klasterlər" +
              returnMethod(selectedMethod)
            : language === "en"
            ? regionData[0].economical_zone[0].name["az"] +
              " economic zone KOB Clusters"
            : regionData[0].economical_zone[0].name["az"] +
              " iqtisadi rayonu üzrə KOB Klasterlər"}
        </p>
        <div></div>
      </div>

      {/* Main Content Container */}
      <div className="flex mobile:flex-col lg:flex-row w-full mobile:gap-4 lg:gap-8 ">
        {/* Left side - Map on mobile, Filters and Table on desktop */}
        <div className="mobile:w-full lg:w-1/2 flex flex-col gap-y-4">
          {/* Map Container - Only visible on mobile */}
          <div className="lg:hidden w-full flex items-center justify-center  rounded-lg">
            <AnimatePresence>
              <motion.div
                className="w-full h-full flex items-center justify-center"
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
                <span className="mobile:text-[14px] lg:text-[16px]">
                  {language === "az"
                    ? "Klaster"
                    : language === "en"
                    ? "Cluster"
                    : "Кластер"}
                </span>
                <svg
                  className={`mobile:w-4 lg:w-5 mobile:h-4 lg:h-5 transition-transform ${
                    isClusterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isClusterOpen && (
                <div className="p-1 bg-gray-100 rounded mt-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {availableClusters.map((cluster) => (
                    <label
                      key={cluster.id}
                      className="flex items-center justify-between gap-2 p-2"
                    >
                      <span className="text-[#2A534F] text-[12px]">
                        {cluster.name}
                      </span>
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
                <span className="mobile:text-[14px] lg:text-[16px]">
                  {language === "az"
                    ? "Metod"
                    : language === "en"
                    ? "Method"
                    : "Метод"}
                </span>
                <svg
                  className={`mobile:w-4 lg:w-5 mobile:h-4 lg:h-5 transition-transform ${
                    isMethodOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isMethodOpen && (
                <div className="p-1 bg-gray-100 rounded mt-1">
                  {availableMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center justify-between gap-2 p-2"
                    >
                      <span className="text-[#2A534F] text-[12px]">
                        {method.name}
                      </span>
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
                        {language === "az"
                          ? "Məhsul qrupu"
                          : language === "en"
                          ? "Product group"
                          : "Группа продукта"}
                      </th>
                      <th className="text-left mobile:text-[12px] lg:text-sm font-medium text-white bg-[#2A534F] w-[50%] py-[10px] pl-[16px] pr-[16px]">
                        {language === "az"
                          ? selectedMethod === 2
                            ? "Məhsul"
                            : "Qeyd"
                          : language === "en"
                          ? selectedMethod === 2
                            ? "Product"
                            : "Note"
                          : selectedMethod === 2
                          ? "Продукт"
                          : "Заметка"}
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
              <div className="w-full h-[50px] bg-[#2A534F] text-white mobile:text-[12px] lg:text-[14px] flex items-center justify-center">İqtisadi Rayon Haqqında Məlumatlar</div>
              <div className="grid grid-cols-2 grid-rows-1 gap-1 mt-1">
                <p className="mobile:text-[12px] lg:text-[14px] h-[50px] p-[10px] pl-[16px] flex items-center">
                  {language === "az"
                    ? "Əhalinin sayı"
                    : language === "en"
                    ? "Population"
                    : "Численность населения"}{" "}
                  - {regionData[0].economical_zone[0].population}
                </p>
                <p className="mobile:text-[12px] lg:text-[14px]  h-[50px] p-[10px] pl-[16px] flex items-center">
                  {language === "az"
                    ? "Əhalinin sıxlığı"
                    : language === "en"
                    ? "Population density"
                    : "Плотность населения"}{" "}
                  - {regionData[0].economical_zone[0].density}
                </p>
              </div>
              {renderRegionTotals()}
              <p className="mobile:text-[12px] lg:text-[14px] mt-[20px]">
                {language === "az"
                  ? regionData[0].economical_zone[0].name["az"] +
                    " iqtisadi rayonuna daxildir:"
                  : language === "en"
                  ? regionData[0].economical_zone[0].name["az"] +
                    " economic zone belongs to:"
                  : regionData[0].economical_zone[0].name["az"] +
                    " iqtisadi rayonuna daxildir:"}
                {zones.map((zone, index) => (
                  <span
                    key={index}
                    className="mobile:text-[12px] lg:text-[14px]"
                  >
                    {zone.name?.az}
                    {index !== zones.length - 1 ? "," : ""}
                    {index < zones.length - 1 && " "}
                  </span>
                ))}
              </p>

              {/* <p>
              {zones.map((zone, index) => (
                  <span key={index} className="mobile:text-[12px] lg:text-[14px]">
                  {zone.name?.az}{index!==zones.length-1?',':''}
                  {index < zones.length - 1 && ' '}
                  </span>
                  
                ))}
              </p> */}
            </div>
          </div>

          {/* <div className="mt-6">
            <p className="text-[14px] font-semibold mb-4">
              {language === 'az' ? 'Region üzrə ümumi məlumat' : 
               language === 'en' ? 'General information about the region' : 
               'Общая информация по региону'}:
            </p>
            
          </div> */}
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
  setIsRegion: PropTypes.func.isRequired,
};
