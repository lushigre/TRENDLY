import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          data-testid={`nav-link-${link.label.toLowerCase()}`}
        >
          <span
            className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === link.href
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:text-primary hover:bg-primary/10"
            } ${mobile ? "block w-full text-left" : ""}`}
          >
            {link.label}
          </span>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" data-testid="logo-link">
              <h1 className="text-2xl font-bold text-primary">Trendly</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" data-testid="notifications-button">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu-trigger">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32`} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem data-testid="profile-menu-item">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="settings-menu-item">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} data-testid="logout-menu-item">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="login-button">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-primary" data-testid="register-button">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks mobile />
                    {!user && (
                      <div className="pt-4 space-y-2">
                        <Link href="/login">
                          <Button variant="ghost" className="w-full justify-start" data-testid="mobile-login-button">
                            Login
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button className="btn-primary w-full" data-testid="mobile-register-button">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}