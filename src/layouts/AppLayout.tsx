import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Button } from "../components/ui/Button";
import { cn } from "../shared/utils/cn";

interface AppLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { to: "/my-requests", label: "My Requests" },
  { to: "/queue", label: "Queue" },
  { to: "/requests/new", label: "New Request" },
];

function AppLayout({ children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { reduceMotion, toggleReducedMotion } = useReducedMotion();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold">Deskline</span>

          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                    isActive && "text-[var(--color-text)] font-semibold underline underline-offset-4"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>

          <Button variant="secondary" onClick={toggleReducedMotion}>
            {reduceMotion ? "Motion: Reduced" : "Motion: Full"}
          </Button>

          <Button variant="ghost">Logout</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

export default AppLayout;
