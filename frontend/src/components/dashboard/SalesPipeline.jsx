// frontend/src/components/dashboard/SalesPipeline.jsx
import { ChevronRight, FileText, FileCheck, Truck, CreditCard, Receipt } from 'lucide-react';

const SalesPipeline = ({ data }) => {
  // Generate pipeline data from the dashboard data
  const pipelineSteps = [
    {
      title: 'Quotations',
      total: data.quotations.total,
      processed: data.quotations.approved,
      icon: FileText,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      progressColor: 'bg-primary',
    },
    {
      title: 'LPOs',
      total: data.lpos.total,
      processed: data.lpos.processing + data.lpos.fulfilled,
      icon: FileCheck,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      progressColor: 'bg-blue-500',
    },
    {
      title: 'Deliveries',
      total: data.deliveries.pending + data.deliveries.delivered,
      processed: data.deliveries.delivered,
      icon: Truck,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500',
    },
    {
      title: 'Invoices',
      total: data.invoices.total,
      processed: data.invoices.paid + data.invoices.partiallyPaid,
      icon: CreditCard,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      progressColor: 'bg-orange-500',
    },
    {
      title: 'Payments',
      total: data.invoices.total,
      processed: data.invoices.paid,
      icon: Receipt,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      progressColor: 'bg-green-500',
    },
  ];

  return (
    <div className="bg-dark-light rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Sales Pipeline</h2>
        <button className="text-xs text-primary hover:text-primary-light">View details</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-0">
        {pipelineSteps.map((step, index) => (
          <div key={step.title} className="flex flex-1 flex-col">
            {/* Step content */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-2`}>
                <step.icon className={`h-8 w-8 ${step.textColor}`} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{step.total}</h3>
                <p className="text-sm text-gray-400">{step.title}</p>
              </div>
              <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                <div
                  className={`absolute h-full ${step.progressColor} rounded`}
                  style={{
                    width: `${step.total ? (step.processed / step.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Chevron between steps, except for the last one */}
            {index < pipelineSteps.length - 1 && (
              <div className="w-8 h-8 hidden md:flex items-center justify-center">
                <ChevronRight className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPipeline;