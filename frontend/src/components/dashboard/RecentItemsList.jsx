// frontend/src/components/dashboard/RecentItemsList.jsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const RecentItemsList = ({
  title,
  items = [],
  emptyMessage = 'No items found',
  linkTo,
  linkText = 'View all',
  renderItem = null,
  icon: Icon = null,
  iconColor = 'primary',
}) => {
  // Generate background and text color classes based on the iconColor prop
  const getColors = (color) => {
    const colors = {
      primary: { bg: 'bg-primary/10', text: 'text-primary' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      green: { bg: 'bg-green-500/10', text: 'text-green-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
      red: { bg: 'bg-red-500/10', text: 'text-red-500' },
    };
    return colors[color] || colors.primary;
  };

  const { bg: bgColorClass, text: textColorClass } = getColors(iconColor);

  return (
    <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className={`text-xs ${textColorClass} hover:opacity-80`}>
            {linkText}
          </Link>
        )}
      </div>
      <div className="divide-y divide-dark-lighter max-h-96 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={item._id || `item-${index}`} className="p-4 hover:bg-dark-lighter transition-colors">
              {renderItem ? (
                renderItem(item)
              ) : (
                <div className="flex justify-between">
                  <div className="flex items-center">
                    {Icon && (
                      <div className={`h-8 w-8 rounded-full ${bgColorClass} ${textColorClass} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">
                        {item.title || item.id || item.name || 'Item'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.subtitle || item.description || ''}
                      </p>
                    </div>
                  </div>
                  {item.linkTo && (
                    <Link to={item.linkTo} className={textColorClass}>
                      <ChevronRight size={20} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

export default RecentItemsList;