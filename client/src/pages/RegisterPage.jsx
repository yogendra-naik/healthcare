import { Navigate } from "react-router-dom";

/** Registration uses verified Google only — same as sign-in. */
export default function RegisterPage() {
  return <Navigate to="/login" replace />;
}
