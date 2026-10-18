import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  // MODE TEST : en mock, on laisse passer sans connexion
  if (import.meta.env.VITE_USE_MOCK === "true") return children;

  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    /* ignore */
  }
  if (!token || user?.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}