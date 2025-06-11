import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="890535917013-klnkcg0j6v8r2js38m4av3663a7ba9nn.apps.googleusercontent.com">
    <App/>
    </GoogleOAuthProvider>
  </StrictMode>,
)
