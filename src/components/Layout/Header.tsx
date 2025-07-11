
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Moon,
  Sun,
  Globe,
  LogOut,
  X,
  Settings,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, mobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: t("nav.dashboard"),
      adminOnly: false,
    },
    {
      href: "/orders",
      icon: ShoppingCart,
      label: t("nav.orders"),
      adminOnly: false,
    },
    {
      href: "/clients",
      icon: Users,
      label: t("nav.clients"),
      adminOnly: true,
    },
  ];

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleLanguageToggle = () => {
    const newLang = language.code === "en" ? "ar" : "en";
    const languages = [
      { code: "en", name: "English", direction: "ltr" },
      { code: "ar", name: "العربية", direction: "rtl" },
    ];
    const found = languages.find((lang) => lang.code === newLang);
    if (found) {
      setLanguage(found as any);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Mobile Menu + Logo + Navigation */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Link to="/">
                  <span className="text-white font-bold text-sm">OS</span>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems
                .filter((item) => !item.adminOnly || user?.role === "admin")
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        "text-sm font-medium",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Right Section - Settings + User Dropdown */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="h-9 w-9 p-0"
            >
              <Globe className="h-4 w-4" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-foreground">
                      {user?.name.split(" ")[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>بيانات الحساب</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>الإعدادات</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-card">
          <nav className="px-4 py-4 space-y-2">
            {navItems
              .filter((item) => !item.adminOnly || user?.role === "admin")
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onMenuToggle}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      "text-sm font-medium",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
