import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { tokenStorage } from "@/shared/auth/tokenStorage";
import { useTheme } from "@/shared/theme/useTheme";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "text-sm font-semibold px-3 py-2 rounded-xl transition",
          isActive
            ? "bg-[rgb(var(--panel2))] border border-[rgb(var(--border))]"
            : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--panel2))]",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const logout = () => {
    tokenStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen theme-bg">
      <header className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))] backdrop-blur-xl">
        <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3">
          <div className="font-semibold tracking-tight">GroupsApp</div>

          <nav className="flex items-center gap-1">
            <NavItem to="/groups" label="Groups" />
            <NavItem to="/chat" label="Chat" />
          </nav>

          <div className="flex-1" />

          <Button variant="secondary" onClick={toggle}>
            {isDark ? "Light" : "Dark"}
          </Button>

          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}