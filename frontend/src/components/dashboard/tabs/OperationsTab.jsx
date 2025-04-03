// frontend/src/components/dashboard/tabs/OperationsTab.jsx
import { Truck, CheckCircle, Calendar } from 'lucide-react';

const OperationsTab = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Delivery Status */}
      <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-dark-lighter">
          <h2 className="text-lg font-semibold text-white">Delivery Status</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Truck className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{data.deliveries.pending}</h3>
              <p className="text-sm text-gray-400">Pending Deliveries</p>
            </div>
            <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{data.deliveries.delivered}</h3>
              <p className="text-sm text-gray-400">Completed Deliveries</p>
            </div>
            <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{data.lpos.processing}</h3>
              <p className="text-sm text-gray-400">LPOs in Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Performance - Placeholder for future implementation */}
      <div className="bg-dark-light rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Delivery Performance</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Delivery performance metrics will be displayed here</p>
          {/* Future implementation of performance metrics */}
        </div>
      </div>

      {/* Delivery Calendar - Placeholder for future implementation */}
      <div className="bg-dark-light rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Deliveries</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Delivery calendar will be displayed here</p>
          {/* Future implementation of calendar component */}
        </div>
      </div>
    </div>
  );
};

export default OperationsTab;