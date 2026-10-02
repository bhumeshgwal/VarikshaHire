import { useEffect, useRef, useState } from "react";

export default function AccountMenu({ onInbox, onReport, onLogout }) {
  const [open, setOpen] = useState(false);
  // Dark is the default look; only an explicit "light" choice switches it off.
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
  const ref = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Close on outside tap / Escape (important on phones, where there is no hover).
  useEffect(() => {
    if (!open) return;
    function onPointer(event) { if (ref.current && !ref.current.contains(event.target)) setOpen(false); }
    function onKey(event) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function choose(action) { setOpen(false); action?.(); }

  return <div className="account-menu" ref={ref}>
    <button className="logout-btn" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="menu">Account</button>
    {open && <div className="account-popover" role="menu">
      {onReport && <button onClick={() => choose(onReport)}>Report</button>}
      {onInbox && <button onClick={() => choose(onInbox)}>Inbox / Messages</button>}
      <button onClick={() => setDark(value => !value)}>{dark ? "Light mode" : "Dark mode"}</button>
      <button className="menu-danger" onClick={() => choose(onLogout)}>Log out</button>
    </div>}
  </div>;
}