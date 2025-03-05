import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/home/HomePage'
import { Blog } from './components/blog/Blog'
import { Contact } from './pages/contact/Contact'
import { Faq } from './pages/faq/Faq'
import { Legislation } from './pages/legislation/Legislation'
import { NotFound } from './pages/NotFound'
import { MapPage } from './pages/map'
import { SignIn } from './pages/signIn/SignIn'
import { SignUp } from './pages/signUp/SignUp'
import { Profile } from './pages/profile/profile'
localStorage.removeItem('language-storage');

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<Blog />} />
          <Route path="/elaqe" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/qanunvericilik" element={<Legislation />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/kob-klaster-xeritesi" element={<MapPage/>} />
          <Route path="/daxil-ol" element={<SignIn />} />
          <Route path="/qeydiyyat" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
