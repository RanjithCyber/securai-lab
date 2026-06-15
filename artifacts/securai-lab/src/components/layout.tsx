import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, Code, ActivitySquare } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/scanner", label: "Scanner", icon: Code },
    { href: "/tracker", label: "Tracker", icon: ActivitySquare },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight uppercase text-primary">SecurAI-Lab</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 text-xs text-muted-foreground uppercase tracking-widest text-center border-t border-border/50">
          Terminal Access // V. 1.0.4
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="p-8 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
