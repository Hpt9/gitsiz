import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
export const MainLayout = () => {
  return (

      <div className="flex flex-col w-full">
        <Navbar />
        <main className="bg-white">
          <Outlet />
        </main>
        <Footer />
      </div>
  );
};
