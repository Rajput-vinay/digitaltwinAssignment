import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import ThemePanel from "./ThemePanel";


export default function Layout({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  return (
    <div className="shell">
      <header className="topbar">
        <strong className="brand">Roster</strong>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/users">Users</NavLink>
        </nav>
        <button
          className="btn ghost"
          onClick={() => setPanelOpen(true)}
          aria-haspopup="dialog"
        >
          Theme
        </button>
      </header>
      <main className="content">{children}</main>
      {panelOpen && <ThemePanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}
