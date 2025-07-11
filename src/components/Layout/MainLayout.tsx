
import React, { useState } from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header with Navigation */}
      <Header onMenuToggle={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
