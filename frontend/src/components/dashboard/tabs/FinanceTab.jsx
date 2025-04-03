// frontend/src/components/dashboard/tabs/FinanceTab.jsx
import { Receipt } from 'lucide-react';
import StatusBreakdown from '../StatusBreakdown';
import RecentItemsList from '../RecentItemsList';

const FinanceTab = ({ data }) => {
  // Prepare invoice status breakdown data
  const invoiceStatusItems = [
    {
      label: 'Unpaid',
      value: data.invoices.unpaid,
      color: 'bg-blue-500',
    },
    {
      label: 'Partially Paid',
      value: data.invoices.partiallyPaid,
      color: 'bg-yellow-500',
    },
    {
      label: 'Paid',
      value: data.invoices.paid,
      color: 'bg-green-500',
    },
    {
      label: 'Overdue',
      value: data.invoices.overdue,
      color: 'bg-red-500',
    },
  ];

  // Format payments data
  const formatPayments = data.payments.recentItems.map((payment, index) => ({
    _id: payment._id || `payment-${index}`,
    title: payment.receiptNumber || `RCT${index + 1}`,
    subtitle: `${payment.invoice?.clientName || 'Client'} • ${payment.paymentMethod ? payment.paymentMethod.replace('_', ' ').toUpperCase() : 'Payment Method'}`,
    amount: payment.amount,
    date: payment.date ? new Date(payment.date).toLocaleDateString() : 'Date not available',
    linkTo: payment._id ? `/payments/${payment._id}` : null,
  }));

  // Custom render function for payment items
  const renderPaymentItem = (item) => (
    <div className="flex justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
          <Receipt size={16} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">
            {item.title} - {item.subtitle.split(' • ')[0]}
          </p>
          <p className="text-xs text-gray-400">
            {item.subtitle.split(' • ')[1]}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          KSH {item.amount?.toLocaleString() || '0'}
        </p>
        <p className="text-xs text-gray-400">
          {item.date}
        </p>
      </div>
    </div>
  );

  // Create summary for invoice status
  const invoiceSummary = `${data.invoices.paid + data.invoices.partiallyPaid} out of ${data.invoices.total} invoices have received payments.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Invoice Status */}
      <div>
        <StatusBreakdown
          title="Invoice Status"
          items={invoiceStatusItems}
          total={data.invoices.total}
          summary={invoiceSummary}
        />
      </div>

      {/* Recent Payments */}
      <div>
        <RecentItemsList
          title="Recent Payments"
          items={formatPayments}
          linkTo="/payments"
          renderItem={renderPaymentItem}
          emptyMessage="No recent payments"
        />
      </div>

      {/* Monthly Revenue Chart - Placeholder for future implementation */}
      <div className="bg-dark-light rounded-lg p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold text-white mb-4">Monthly Revenue</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Revenue chart will be displayed here</p>
          {/* Future implementation of chart component */}
        </div>
      </div>
    </div>
  );
};

export default FinanceTab;