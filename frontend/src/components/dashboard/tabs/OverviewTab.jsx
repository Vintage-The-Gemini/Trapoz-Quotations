// frontend/src/components/dashboard/tabs/OverviewTab.jsx
import { FileText, DollarSign, Users, ArrowUpRight, FileCheck } from 'lucide-react';
import StatsCard from '../StatsCard';
import SalesPipeline from '../SalesPipeline';
import RecentItemsList from '../RecentItemsList';

const OverviewTab = ({ data }) => {
  // Process data for quotations card
  const quotationsCardData = {
    title: 'Quotations',
    value: data.quotations.total,
    icon: FileText,
    iconColor: 'primary',
    linkTo: '/quotations',
    statusItems: [
      {
        text: `${data.quotations.pending} Pending`,
        bgColor: 'bg-primary/10',
        textColor: 'text-primary',
      },
      {
        footerText: `${data.quotations.approved} Approved`,
        text: `${data.quotations.approved} Approved`,
        textColor: 'text-green-500',
      },
      {
        footerText: `${data.quotations.rejected} Rejected`,
        text: `${data.quotations.rejected} Rejected`,
        textColor: 'text-red-500',
      },
    ],
  };

  // Process data for invoices card
  const invoicesCardData = {
    title: 'Invoices',
    value: data.invoices.total,
    icon: FileCheck,
    iconColor: 'blue',
    linkTo: '/invoices',
    statusItems: [
      {
        text: `${data.invoices.overdue} Overdue`,
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
      },
      {
        footerText: `${data.invoices.paid} Paid`,
        text: `${data.invoices.paid} Paid`,
        textColor: 'text-green-500',
      },
      {
        footerText: `${data.invoices.partiallyPaid} Partial`,
        text: `${data.invoices.partiallyPaid} Partial`,
        textColor: 'text-yellow-500',
      },
    ],
  };

  // Process data for revenue card
  const revenueCardData = {
    title: 'Monthly Revenue',
    value: data.payments.thisMonth,
    icon: DollarSign,
    iconColor: 'green',
    linkTo: '/payments',
    linkText: 'View payments',
    statusItems: [
      {
        text: `Today: KSH ${data.payments.today.toLocaleString()}`,
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-500',
        icon: ArrowUpRight,
      },
      {
        footerText: `${data.payments.count} Payments`,
        text: `${data.payments.count} Payments`,
        textColor: 'text-gray-400',
      },
    ],
  };

  // Process data for clients card
  const clientsCardData = {
    title: 'Clients',
    value: data.clients.total,
    icon: Users,
    iconColor: 'purple',
    linkTo: '/clients',
    linkText: 'View clients',
    statusItems: [
      {
        text: `${data.clients.active} Active`,
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-500',
      },
      {
        footerText: `${data.clients.new} New this month`,
        text: `${data.clients.new} New this month`,
        textColor: 'text-green-500',
      },
    ],
  };

  // Process recent quotations data
  const formatRecentQuotations = data.quotations.recentItems.map(quote => ({
    _id: quote._id,
    title: `${quote.quoteNumber} - ${quote.clientName}`,
    subtitle: `Amount: KSH ${quote.totalAmount.toLocaleString()}`,
    linkTo: `/quotations/${quote._id}`,
    status: quote.status,
  }));

  // Process upcoming payments data
  const formatUpcomingPayments = data.upcomingPayments.map(invoice => ({
    _id: invoice._id,
    title: `${invoice.invoiceNumber} - ${invoice.clientName}`,
    subtitle: `Due: ${new Date(invoice.dueDate).toLocaleDateString()} • Amount: KSH ${invoice.balance?.toLocaleString() || invoice.totalAmount?.toLocaleString()}`,
    linkTo: `/invoices/${invoice._id}`,
  }));

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard {...quotationsCardData} />
        <StatsCard {...invoicesCardData} />
        <StatsCard {...revenueCardData} />
        <StatsCard {...clientsCardData} />
      </div>

      {/* Sales Pipeline Visualization */}
      <SalesPipeline data={data} />

      {/* Recent Activity and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <RecentItemsList
          title="Recent Quotations"
          items={formatRecentQuotations}
          linkTo="/quotations"
          icon={FileText}
          iconColor="primary"
          emptyMessage="No quotations found"
        />

        {/* Upcoming Payments */}
        <RecentItemsList
          title="Upcoming Payments"
          items={formatUpcomingPayments}
          linkTo="/invoices"
          icon={DollarSign}
          iconColor="orange"
          emptyMessage="No upcoming payments"
        />
      </div>
    </>
  );
};

export default OverviewTab;