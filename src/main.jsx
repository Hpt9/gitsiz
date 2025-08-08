import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <GoogleOAuthProvider clientId="890535917013-eesikppsdabrks7d5a6gtnvl4rn67ep0.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  // </StrictMode>
);
