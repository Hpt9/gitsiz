import { TbArrowBackUp } from "react-icons/tb";


export const NotFound = () => {
  return (
    <div className="mobile:min-h-[calc(100vh-600px)] lg:min-h-[calc(100vh-448px)] xl:min-h-[calc(100vh-492px)] flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Səhifə Tapılmadı</h2>
      <p className="text-gray-500 mb-8">Səhifə axtarışda tapılmadı və ya ünvanı dəyişdirilib.</p>
      <a
        href="/"
        className="px-6 py-3 bg-[#2A534F] border border-[#2A534F] text-white rounded-[12px] hover:bg-[white] hover:text-[#2A534F] transition-colors flex items-center gap-x-[10px]"
      >
        Ana Səhifəyə Qayıt
        <TbArrowBackUp className="mr-2 w-[20px] h-[20px]" />
      </a>
    </div>
  );
};

export default NotFound; 