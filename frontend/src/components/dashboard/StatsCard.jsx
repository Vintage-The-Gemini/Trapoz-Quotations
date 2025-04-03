// frontend/src/components/dashboard/StatsCard.jsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'primary',
  linkTo,
  linkText = 'View all',
  statusItems = [],
}) => {
  // Generate background and text color classes based on the iconColor prop
  const getBgColor = (color) => {
    const colors = {
      primary: 'bg-primary/10',
      blue: 'bg-blue-500/10',
      green: 'bg-green-500/10',
      purple: 'bg-purple-500/10',
      yellow: 'bg-yellow-500/10',
      orange: 'bg-orange-500/10',
      red: 'bg-red-500/10',
    };
    return colors[color] || colors.primary;
  };

  const getTextColor = (color) => {
    const colors = {
      primary: 'text-primary',
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colors[color] || colors.primary;
  };

  const bgColorClass = getBgColor(iconColor);
  const textColorClass = getTextColor(iconColor);

  return (
    <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {typeof value === 'number' && title.toLowerCase().includes('revenue')
                ? `KSH ${value.toLocaleString()}`
                : value}
            </h3>
            {statusItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {statusItems.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.bgColor || 'bg-gray-500/10'} ${
                      item.textColor || 'text-gray-400'
                    } text-xs px-2 py-1 rounded flex items-center`}
                  >
                    {item.icon && <item.icon size={12} className="mr-1" />}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`${bgColorClass} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${textColorClass}`} />
          </div>
        </div>
      </div>
      {linkTo && (
        <div className="px-4 py-3 bg-dark-lighter">
          <div className="flex justify-between items-center">
            <Link
              to={linkTo}
              className={`text-xs ${textColorClass} hover:opacity-80 flex items-center`}
            >
              {linkText}
              <ChevronRight size={14} className="ml-1" />
            </Link>
            {/* Optional slot for additional info */}
            {statusItems.length > 0 && (
              <div className="flex items-center space-x-2">
                {statusItems.slice(0, 2).map((item, index) => (
                  <span key={`footer-${index}`} className={`text-xs ${item.textColor || 'text-gray-400'}`}>
                    {item.footerText || item.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;