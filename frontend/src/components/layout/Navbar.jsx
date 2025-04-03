// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  PlusCircle,
  FilePlus,
  FileCheck,
  FileText,
  Truck,
} from "lucide-react";

const Navbar = ({ toggleMobileMenu }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const createMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample notifications - in a real app, these would come from an API
  useEffect(() => {
    // Simulating notifications data
    setNotifications([
      {
        id: 1,
        title: "New LPO Received",
        message: "Client XYZ has sent a new LPO for review",
        time: "10 minutes ago",
        read: false,
      },
      {
        id: 2,
        title: "Payment Received",
        message: "Payment for Invoice #INV2304001 has been received",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 3,
        title: "Quotation Approved",
        message: "Client ABC has approved Quotation #Q2304002",
        time: "1 day ago",
        read: true,
      },
    ]);
  }, []);

  return (
    <header className="bg-dark-light border-b border-dark-lighter">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div className="hidden md:block ml-4">
            <div className="relative">
              <input
                type="text"
                className="bg-dark border border-dark-lighter rounded-md py-2 pl-4 pr-10 w-64 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search..."
              />
              <button className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Nav Items */}
        <div className="flex items-center space-x-4">
          {/* Create New Button with Dropdown */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="flex items-center text-sm text-gray-300 bg-dark-lighter hover:bg-dark px-3 py-2 rounded-md focus:outline-none"
            >
              <PlusCircle size={16} className="mr-2" />
              <span>Create New</span>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-light rounded-md shadow-lg z-50 border border-dark-lighter overflow-hidden">
                <div className="py-1">
                  <Link
                    to="/quotations/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <FilePlus size={16} className="mr-2" />
                    <span>New Quotation</span>
                  </Link>
                  <Link
                    to="/lpos/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <FileCheck size={16} className="mr-2" />
                    <span>New LPO</span>
                  </Link>
                  <Link
                    to="/delivery-notes/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <Truck size={16} className="mr-2" />
                    <span>New Delivery Note</span>
                  </Link>
                  <Link
                    to="/invoices/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <FileText size={16} className="mr-2" />
                    <span>New Invoice</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-dark focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-dark-light rounded-md shadow-lg z-50 border border-dark-lighter overflow-hidden">
                <div className="px-4 py-2 border-b border-dark-lighter">
                  <h3 className="text-sm font-medium text-white">
                    Notifications
                  </h3>
                </div>
                <div className="divide-y divide-dark-lighter max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-dark ${
                          notification.read ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-white">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-dark-lighter">
                  <button
                    className="text-xs text-primary hover:text-primary-dark"
                    onClick={() => {
                      // Mark all as read logic would go here
                      setIsNotificationsOpen(false);
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center text-sm text-white focus:outline-none"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <ChevronDown size={16} className="ml-1 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-md shadow-lg z-50 border border-dark-lighter overflow-hidden">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-dark-lighter">
                    <p className="text-sm font-medium text-white">John Doe</p>
                    <p className="text-xs text-gray-400">admin@example.com</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    <span>Your Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    <span>Settings</span>
                  </Link>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white w-full text-left"
                    onClick={() => {
                      // Logout logic would go here
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
