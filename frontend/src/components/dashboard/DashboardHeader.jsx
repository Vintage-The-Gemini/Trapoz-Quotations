// frontend/src/components/dashboard/DashboardHeader.jsx
import { Link } from 'react-router-dom';
import { RefreshCcw, PlusCircle } from 'lucide-react';

const DashboardHeader = ({ onRefresh, refreshing }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back, here's an overview of your business</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onRefresh}
          className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
        <Link
          to="/quotations/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>New Quotation</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;