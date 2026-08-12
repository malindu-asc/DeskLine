import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, Zap, ZapOff, LogOut } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useAuth } from "../features/auth/useAuth";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { cn } from "../shared/utils/cn";
import type { UserRole } from "../shared/types";

interface AppLayoutProps {
  children: ReactNode;
}

// Same "declare which roles can see this" shape as RoleRoute's `allow`
// prop, applied to nav visibility instead of route access - one user
// shouldn't see a link that would just bounce them away if clicked.
const navLinks: { to: string; label: string; roles: UserRole[] }[] = [
  { to: "/my-requests", label: "My Requests", roles: ["requester"] },
  { to: "/queue", label: "Queue", roles: ["technician", "admin"] },
];

function AppLayout({ children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { reduceMotion, toggleReducedMotion } = useReducedMotion();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const visibleNavLinks = navLinks.filter((link) => user && link.roles.includes(user.role));

  return (
    <div className="flex h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="shrink-0 border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold">
              <span className="text-[var(--color-primary)]">Desk</span>
              <span className="text-[var(--color-secondary)]">Line</span>
            </span>

            <nav className="flex items-center gap-4">
              {visibleNavLinks.map((link) => (
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

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <Avatar name={user.name} />

                <div className="text-sm leading-tight">
                  <p className="font-medium text-[var(--color-text)]">{user.name}</p>
                  <p className="capitalize text-[var(--color-text-secondary)]">{user.role}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <Button
                variant="secondary"
                onClick={toggleReducedMotion}
                aria-label={reduceMotion ? "Turn off reduced motion" : "Turn on reduced motion"}
              >
                {reduceMotion ? <ZapOff className="size-4" /> : <Zap className="size-4" />}
              </Button>

              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 py-8 [scrollbar-gutter:stable]">{children}</main>

      <footer className="shrink-0 border-t border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-4 text-center text-sm text-[var(--color-text-secondary)]">
          © {new Date().getFullYear()} Deskline - Internal IT & Facilities Support
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
