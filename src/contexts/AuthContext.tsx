/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import { AuthContextType, User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
