// frontend/src/components/dashboard/DashboardTabs.jsx

const DashboardTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'sales', label: 'Sales Pipeline' },
      { id: 'finance', label: 'Finance' },
      { id: 'operations', label: 'Operations' },
    ];
  
    return (
      <div className="border-b border-dark-lighter">
        <nav className="flex flex-wrap -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  export default DashboardTabs;