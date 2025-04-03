// frontend/src/components/dashboard/SimpleBarChart.jsx

const SimpleBarChart = ({ 
    data = [], 
    title = 'Chart',
    xAxisLabel = 'X Axis',
    yAxisLabel = 'Y Axis',
    barColor = 'bg-primary',
    barHoverColor = 'bg-primary-dark',
    maxValue = null,
    height = 200
  }) => {
    // Calculate max value from data if not provided
    const calculatedMax = maxValue || Math.max(...data.map(item => item.value)) * 1.1; // Add 10% for visual space
    
    return (
      <div className="bg-dark-light rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        
        <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
          {/* Y-axis label */}
          <div className="flex flex-col justify-center -mr-2">
            <span className="text-xs text-gray-400 transform -rotate-90 origin-center whitespace-nowrap">
              {yAxisLabel}
            </span>
          </div>
          
          {/* Chart bars */}
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-grow">
              {/* Bar container with fixed height */}
              <div className="relative w-full h-full">
                {/* Actual bar with dynamic height based on value */}
                <div 
                  className={`w-full absolute bottom-0 ${barColor} hover:${barHoverColor} transition-all duration-200`}
                  style={{ 
                    height: `${(item.value / calculatedMax) * 100}%`,
                  }}
                  title={`${item.label}: ${typeof item.value === 'number' ? item.value.toLocaleString() : item.value}`}
                ></div>
              </div>
              
              {/* X-axis label */}
              <div className="text-xs text-gray-400 mt-2">{item.label}</div>
            </div>
          ))}
        </div>
        
        {/* X-axis title */}
        <div className="text-xs text-gray-400 mt-4 text-center">{xAxisLabel}</div>
      </div>
    );
  };
  
  export default SimpleBarChart;