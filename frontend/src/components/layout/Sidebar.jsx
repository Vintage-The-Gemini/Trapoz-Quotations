// frontend/src/components/layout/Sidebar.jsx
import { useLocation, Link } from 'react-router-dom';
import { Home, FileText, Settings, PlusCircle, List } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: Home },
    { title: 'New Quotation', path: '/quotation/create', icon: PlusCircle },
    { title: 'Quotations', path: '/quotations', icon: FileText },
    { title: 'Items', path: '/admin/items', icon: List },
    { title: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-dark-light min-h-screen">
      <div className="p-4">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-dark hover:text-primary'
                }`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;