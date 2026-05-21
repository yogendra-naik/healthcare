import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isVerifiedGoogleUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSignInModal } from "../context/SignInModalContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openSignInModal } = useSignInModal();

  useEffect(() => {
    if (isVerifiedGoogleUser(user)) {
      navigate("/", { replace: true });
      return;
    }
    navigate("/", { replace: true });
    openSignInModal();
  }, [user, navigate, openSignInModal]);

  return null;
}
