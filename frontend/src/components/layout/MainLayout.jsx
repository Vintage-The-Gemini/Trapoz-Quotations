// src/components/layout/MainLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../ErrorBoundary";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar toggle for desktop
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    localStorage.setItem("sidebarCollapsed", !isSidebarCollapsed);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Load sidebar state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed") === "true";
    setIsSidebarCollapsed(savedState);
  }, []);

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleMobileMenu={toggleMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1E1E1E",
            color: "#fff",
            border: "1px solid #2D2D2D",
          },
          success: {
            icon: "✅",
            style: {
              background: "#064E3B",
              border: "1px solid #065F46",
            },
          },
          error: {
            icon: "❌",
            style: {
              background: "#7F1D1D",
              border: "1px solid #991B1B",
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
