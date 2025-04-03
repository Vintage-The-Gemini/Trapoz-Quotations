// src/components/layout/Sidebar.jsx
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  PlusCircle,
  List,
  ChevronRight,
  ChevronLeft,
  Users,
  FileCheck,
  FilePlus,
  Truck,
  CreditCard,
  Receipt,
  BarChart4,
} from "lucide-react";

const Sidebar = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSidebarCollapsed,
  toggleSidebar,
}) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState("");

  // Define navigation sections
  const navigationSections = [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", path: "/dashboard", icon: Home },
        { title: "Analytics", path: "/analytics", icon: BarChart4 },
      ],
    },
    {
      title: "Sales Process",
      items: [
        { title: "Quotations", path: "/quotations", icon: FilePlus },
        { title: "LPOs", path: "/lpos", icon: FileCheck },
        { title: "Delivery Notes", path: "/delivery-notes", icon: Truck },
        { title: "Invoices", path: "/invoices", icon: FileText },
        { title: "Payments", path: "/payments", icon: CreditCard },
        { title: "Receipts", path: "/receipts", icon: Receipt },
      ],
    },
    {
      title: "Management",
      items: [
        { title: "Clients", path: "/clients", icon: Users },
        { title: "Items", path: "/items", icon: List },
        { title: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  // Toggle expanded section
  const toggleSection = (title) => {
    if (expandedSection === title) {
      setExpandedSection("");
    } else {
      setExpandedSection(title);
    }
  };

  // Check if a path is active
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Sidebar class based on collapsed state
  const sidebarClass = isSidebarCollapsed
    ? "hidden md:block md:w-20 bg-dark-light min-h-screen transition-all duration-300"
    : "hidden md:block md:w-64 bg-dark-light min-h-screen transition-all duration-300";

  // Mobile menu class
  const mobileMenuClass = isMobileMenuOpen
    ? "fixed inset-0 z-40 md:hidden"
    : "hidden";

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={sidebarClass}>
        <div className="flex items-center justify-between p-4 border-b border-dark-lighter">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary">Trapoz System</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-dark flex items-center justify-center"
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar h-[calc(100vh-64px)]">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!isSidebarCollapsed && (
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
                  {section.title}
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? "bg-primary text-white"
                          : "text-gray-300 hover:bg-dark hover:text-primary"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} />
                      {!isSidebarCollapsed && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={mobileMenuClass}>
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm bg-dark-light z-50">
          <div className="flex items-center justify-between p-4 border-b border-dark-lighter">
            <h1 className="text-xl font-bold text-primary">Trapoz System</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded hover:bg-dark"
              aria-label="Close menu"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div
                  className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-2 cursor-pointer"
                  onClick={() => toggleSection(section.title)}
                >
                  <span>{section.title}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      expandedSection === section.title ? "rotate-90" : ""
                    }`}
                  />
                </div>

                <div
                  className={`space-y-1 ${
                    expandedSection === section.title ? "block" : "hidden"
                  }`}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
                          isActivePath(item.path)
                            ? "bg-primary text-white"
                            : "text-gray-300 hover:bg-dark hover:text-primary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
                        <span className="ml-3">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
