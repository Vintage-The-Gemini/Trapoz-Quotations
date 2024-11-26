// frontend/src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Home, Settings, PlusCircle, List } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { title: 'Home', path: '/', icon: <Home size={20} /> },
    { title: 'New Quotation', path: '/quotation/create', icon: <PlusCircle size={20} /> },
    { title: 'Quotations', path: '/quotations', icon: <FileText size={20} /> },
    { title: 'Items', path: '/admin/items', icon: <List size={20} /> },
    { title: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-light border-b border-dark-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">QuoteSystem</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                    ${isActivePath(item.path) 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:text-primary hover:bg-dark'}`}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 
                hover:text-white hover:bg-dark"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActivePath(item.path) 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-primary hover:bg-dark'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;