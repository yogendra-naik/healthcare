import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/api.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SignInModalProvider } from "./context/SignInModalContext.jsx";
import MedRouteKiosk from "./components/MedRouteKiosk.jsx";
import SignInModal from "./components/SignInModal.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<MedRouteKiosk />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const routes = (
    <AuthProvider>
      <SignInModalProvider>
        <BrowserRouter>
          <AppRoutes />
          <SignInModal />
        </BrowserRouter>
      </SignInModalProvider>
    </AuthProvider>
  );

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {routes}
      </GoogleOAuthProvider>
    );
  }

  return routes;
}
