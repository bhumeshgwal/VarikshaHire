import { useEffect, useState } from "react";
import { isLoggedIn } from "./api/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { AdminDashboard } from "./pages/Admin";

export default function App() {
  const [screen, setScreen] = useState(() => {
    if (!isLoggedIn()) return "login";
    return localStorage.getItem("role") === "admin" ? "admin" : "dashboard";
  });

  useEffect(() => {
    function handleExpiredSession() {
      setScreen("login");
    }
    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  function handleLogin(role) {
    setScreen(role === "admin" ? "admin" : "dashboard");
  }

  if (screen === "signup") return <Signup goToLogin={() => setScreen("login")} />;

  if (screen === "dashboard") return (
    <Dashboard onLogout={() => setScreen("login")} />
  );
  if (screen === "admin") return <AdminDashboard onLogout={() => setScreen("login")} />;

  return <Login
    onLogin={handleLogin}
    goToSignup={() => setScreen("signup")}
  />;
}
