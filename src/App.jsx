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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PasswordChangeConfirm } from "./pages/password/PasswordChangeConfirm";
import { ForgotPassword } from "./pages/password/ForgotPassword";
import { ResetPassword } from "./pages/password/ResetPassword";
import { VerifyEmail } from "./pages/verify/verify";
import { Maintenance } from "./pages/Maintenance";
import { useEffect, useState } from "react";

function App() {
  const [maintenance, setMaintenance] = useState(false);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://kobklaster.tw1.ru/api/settings")
      .then((res) => res.json())
      .then((data) => {
        // Data is now a nested array, so flatten it
        const settingsArr = Array.isArray(data) ? data.flat() : [];
        const maintenanceSetting = settingsArr.find(
          (item) => item.key === "maintenance"
        );
        if (
          maintenanceSetting &&
          maintenanceSetting.value &&
          maintenanceSetting.value.az === "true"
        ) {
          setMaintenance(true);
        } else {
          setMaintenance(false);
        }
        // setLoading(false);
      })
      .catch(() => {
        setMaintenance(false);
        // setLoading(false);
      });
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="loader3"></div>
  //     </div>
  //   );
  // }

  if (maintenance) {
    return <Maintenance />;
  }

  return (
    <>
      <ToastContainer />
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route
                  path="/password-change-confirm"
                  element={<PasswordChangeConfirm />}
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </ErrorBoundary>
    </>
  );
}

export default App;
