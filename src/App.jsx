import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/home/HomePage";
import { Blog } from "./components/blog/Blog";
import { Contact } from "./pages/contact/Contact";
import { Faq } from "./pages/faq/Faq";
import { Legislation } from "./pages/legislation/Legislation";
import { NotFound } from "./pages/NotFound";
import { MapPage } from "./pages/map";
import { SignIn } from "./pages/signIn/SignIn";
import { SignUp } from "./pages/signUp/SignUp";
import { Profile } from "./pages/profile/profile";
import { Annoucements } from "./pages/announcements/Annoucements";
import { PlaceAnnoucement } from "./pages/announcements/PlaceAnnoucement";
import { SingleAnnouncement } from "./pages/announcements/SingleAnnouncement";
import ErrorBoundary from "./components/ErrorBoundary";
localStorage.removeItem("language-storage");

function App() {
  // useEffect(() => {
  //   let lastWidth = window.innerWidth;
  //   const breakpoint = 1024;

  //   const handleResize = () => {
  //     const currentWidth = window.innerWidth;
  //     if (
  //       (lastWidth < breakpoint && currentWidth >= breakpoint) ||
  //       (lastWidth >= breakpoint && currentWidth < breakpoint)
  //     ) {
  //       window.location.reload();
  //     }
  //     lastWidth = currentWidth;
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return (
    <ErrorBoundary>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/elaqe" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/qanunvericilik" element={<Legislation />} />
              <Route path="/elanlar" element={<Annoucements />} />
              <Route path="/elanlar/:id" element={<SingleAnnouncement />} />
              <Route path="/kob-klaster-xeritesi" element={<MapPage />} />
              <Route path="/daxil-ol" element={<SignIn />} />
              <Route path="/qeydiyyat" element={<SignUp />} />
              <Route path="/elan-yerlesdir" element={<PlaceAnnoucement />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/:slug" element={<Blog />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;
