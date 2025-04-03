// frontend/src/components/dashboard/StatusBreakdown.jsx

const StatusBreakdown = ({ 
    title, 
    items = [], 
    total = 0, 
    summary = null 
  }) => {
    return (
      <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-dark-lighter">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>{item.label}</span>
                  <span>
                    {item.value} ({total ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-dark-lighter rounded-full">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${total ? (item.value / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {summary && (
            <div className="mt-4 pt-4 border-t border-dark-lighter">
              <p className="text-sm text-gray-400">
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default StatusBreakdown;