import { useEffect, useState } from "react";

export default function AccountMenu({ onInbox, onReport, onLogout }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => { document.documentElement.classList.toggle("theme-dark", dark); localStorage.setItem("theme", dark ? "dark" : "light"); }, [dark]);
  function choose(action) { setOpen(false); action?.(); }

  return <div className="account-menu">
    <button className="logout-btn" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="menu">Account</button>
    {open && <div className="account-popover" role="menu">
      {onReport && <button onClick={() => choose(onReport)}>Report</button>}
      {onInbox && <button onClick={() => choose(onInbox)}>Inbox / Messages</button>}
      <button onClick={() => setDark(value => !value)}>{dark ? "Light mode" : "Dark mode"}</button>
      <button className="menu-danger" onClick={() => choose(onLogout)}>Log out</button>
    </div>}
  </div>;
}
