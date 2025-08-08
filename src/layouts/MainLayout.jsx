import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export const MainLayout = () => {
  useEffect(() => {
    // Initialize Lenis for smooth inertia scrolling site-wide
    const lenis = new Lenis({
      duration: 1.2, // Adjust for more/less inertia
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

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
