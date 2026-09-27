import { useEffect, useState } from "react";
import { isLoggedIn } from "./api/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [screen, setScreen] = useState(isLoggedIn() ? "dashboard" : "login");

  useEffect(() => {
    function handleExpiredSession() {
      setScreen("login");
    }
    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  function handleLogin() {
    setScreen("dashboard");
  }

  if (screen === "signup") return <Signup goToLogin={() => setScreen("login")} />;

  if (screen === "dashboard") return (
    <Dashboard onLogout={() => setScreen("login")} />
  );

  return <Login onLogin={handleLogin} goToSignup={() => setScreen("signup")} />;
}
