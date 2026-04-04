import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CartProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </CartProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
