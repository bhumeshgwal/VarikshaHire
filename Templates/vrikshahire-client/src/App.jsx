import { useState } from "react";
import { isLoggedIn } from "./api/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// This whole file is just: "which screen are we on?" stored in one variable.
// No routing library, no URLs changing — just three possible screen values.
// That's a deliberate choice: fewer moving parts to explain.

export default function App() {
  const [screen, setScreen] = useState(isLoggedIn() ? "dashboard" : "login");

  if (screen === "signup") {
    return <Signup goToLogin={() => setScreen("login")} />;
  }

  if (screen === "dashboard") {
    return (
      <Dashboard
        studentId={null /* see note in README about this */}
        onLogout={() => setScreen("login")}
      />
    );
  }

  return (
    <Login
      onLogin={() => setScreen("dashboard")}
      goToSignup={() => setScreen("signup")}
    />
  );
}
