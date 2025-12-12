"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Trophy, Users, UtensilsCrossed, CalendarDays, BarChart3, Award, Settings, LogOut, QrCode, ShieldCheck, User, DollarSign, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface UserData {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

// Navigation items based on roles
const navigationByRole = {
  SUPER_ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Admin Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { name: "Players", href: "/players", icon: Users },
    { name: "Food Distribution", href: "/food", icon: UtensilsCrossed },
    { name: "Committee", href: "/committee", icon: Users },
    { name: "Teams", href: "/teams", icon: Trophy },
    { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { name: "Matches", href: "/matches", icon: CalendarDays },
    { name: "Awards", href: "/awards", icon: Award },
    { name: "Budget Management", href: "/admin/budget", icon: DollarSign },
    { name: "QR Scanner", href: "/scanner", icon: QrCode },
  ],
  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Players", href: "/players", icon: Users },
    { name: "Food Distribution", href: "/food", icon: UtensilsCrossed },
    { name: "Committee", href: "/committee", icon: Users },
    { name: "Teams", href: "/teams", icon: Trophy },
    { name: "Matches", href: "/matches", icon: CalendarDays },
    { name: "Awards", href: "/awards", icon: Award },
    { name: "QR Scanner", href: "/scanner", icon: QrCode },
  ],
  USER: [
    { name: "Matches", href: "/matches", icon: CalendarDays },
    { name: "Food Status", href: "/food/scanner", icon: UtensilsCrossed },
    { name: "Teams", href: "/teams", icon: Trophy },
  ],
};

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Organizer',
  USER: 'Player',
};

const roleBadgeColors = {
  SUPER_ADMIN: 'bg-red-500 text-white',
  ADMIN: 'bg-blue-500 text-white',
  USER: 'bg-green-500 text-white',
};

export function AppSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Get navigation items based on user role
  const navigation = user ? navigationByRole[user.role] : navigationByRole.ADMIN;
  const displayName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]
    : 'Admin User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Trophy className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Cricket Fiesta</h1>
          <p className="text-xs text-muted-foreground">
            {user ? roleLabels[user.role] : 'Admin Panel'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-accent p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || 'admin@slt.com'}</p>
            {user && (
              <Badge className={cn("mt-1 text-[10px] px-1.5 py-0", roleBadgeColors[user.role])}>
                {roleLabels[user.role]}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <Link href="/settings" className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-transparent flex-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}

// Sidebar content component for reuse
function SidebarContent({ user, navigation, pathname, handleLogout, onNavigate }: {
  user: UserData | null;
  navigation: typeof navigationByRole.ADMIN;
  pathname: string;
  handleLogout: () => void;
  onNavigate?: () => void;
}) {
  const displayName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]
    : 'Admin User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4 lg:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Trophy className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Cricket Fiesta</h1>
          <p className="text-xs text-muted-foreground">
            {user ? roleLabels[user.role] : 'Admin Panel'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 lg:p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} onClick={onNavigate}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sm",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-3 lg:p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-accent p-2 lg:p-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || 'admin@slt.com'}</p>
            {user && (
              <Badge className={cn("mt-1 text-[10px] px-1.5 py-0", roleBadgeColors[user.role])}>
                {roleLabels[user.role]}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <Link href="/settings" className="flex-1" onClick={onNavigate}>
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                <span className="hidden lg:inline">Settings</span>
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-transparent flex-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile Header with menu toggle
export function MobileHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navigation = user ? navigationByRole[user.role] : navigationByRole.ADMIN;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            user={user} 
            navigation={navigation} 
            pathname={pathname} 
            handleLogout={handleLogout}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Trophy className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold">Cricket Fiesta</span>
      </div>
    </header>
  );
}

// Responsive layout wrapper
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      
      {/* Mobile Header - hidden on desktop */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

