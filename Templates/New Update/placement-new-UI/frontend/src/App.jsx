import { useEffect, useState } from "react";
import { isLoggedIn } from "./api/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { AdminDashboard } from "./pages/Admin";
import CompanyDashboard from "./Company.jsx";
import ProfileView from "./pages/ProfileView";
import MessagesPage from "./pages/Messages";

export default function App() {
  const [profileId, setProfileId] = useState(null);
  const [screen, setScreen] = useState(() => {
    if (!isLoggedIn()) return "login";
    const role = localStorage.getItem("role");
    return role === "admin" ? "admin" : role === "company" ? "company" : "dashboard";
  });

  useEffect(() => {
    function handleExpiredSession() {
      setScreen("login");
    }
    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  function handleLogin(role) {
    setScreen(role === "admin" ? "admin" : role === "company" ? "company" : "dashboard");
  }

  function openProfile(studentId) {
    setProfileId(studentId);
    setScreen("profile");
  }

  if (screen === "signup") return <Signup goToLogin={() => setScreen("login")} />;

  if (screen === "dashboard") {
    return <Dashboard onLogout={() => setScreen("login")} onViewProfile={openProfile} onMessages={() => setScreen("messages")} />;
  }
  if (screen === "admin") return <AdminDashboard onLogout={() => setScreen("login")} onViewProfile={openProfile} />;
  if (screen === "company") return <CompanyDashboard onLogout={() => setScreen("login")} onViewProfile={openProfile} onMessages={() => setScreen("messages")} />;
  if (screen === "messages") return <MessagesPage onBack={() => setScreen(localStorage.getItem("role") === "company" ? "company" : "dashboard")} />;
  if (screen === "profile") return <ProfileView studentId={profileId} onBack={() => setScreen(localStorage.getItem("role") === "company" ? "company" : localStorage.getItem("role") === "admin" ? "admin" : "dashboard")} onEdit={localStorage.getItem("studentId") === profileId ? () => setScreen("dashboard") : null} />;

  return <Login onLogin={handleLogin} goToSignup={() => setScreen("signup")} />;
}
