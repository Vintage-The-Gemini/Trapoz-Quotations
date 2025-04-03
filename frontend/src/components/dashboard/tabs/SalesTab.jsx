// frontend/src/components/dashboard/tabs/SalesTab.jsx
import { FileCheck, Truck } from "lucide-react";
import StatusBreakdown from "../StatusBreakdown";
import RecentItemsList from "../RecentItemsList";

const SalesTab = ({ data }) => {
  // Prepare quotation status breakdown data
  const quotationStatusItems = [
    {
      label: "Pending",
      value: data.quotations.pending,
      color: "bg-yellow-500",
    },
    {
      label: "Approved",
      value: data.quotations.approved,
      color: "bg-green-500",
    },
    {
      label: "Rejected",
      value: data.quotations.rejected,
      color: "bg-red-500",
    },
    {
      label: "Expired",
      value: data.quotations.expired,
      color: "bg-gray-500",
    },
  ];

  // Format LPO data
  const formatLPOItems = (lpos = []) => {
    return lpos.map((lpo, index) => ({
      _id: lpo._id || `lpo-${index}`,
      title: lpo.lpoNumber || `LPO${index + 1}`,
      subtitle: `${lpo.clientName || "Client"} • KSH ${
        lpo.totalAmount?.toLocaleString() || "0"
      }`,
      status: lpo.status || "processing",
      linkTo: lpo._id ? `/lpos/${lpo._id}` : null,
    }));
  };

  // Format delivery notes data
  const formatDeliveryItems = data.deliveries.pendingItems.map(
    (delivery, index) => ({
      _id: delivery._id || `delivery-${index}`,
      title: delivery.deliveryNumber || `DN${index + 1}`,
      subtitle: `${delivery.clientName || "Client"} • ${
        delivery.status === "in_transit" ? "In Transit" : "Pending"
      }`,
      date: delivery.date
        ? new Date(delivery.date).toLocaleDateString()
        : "Date not available",
      linkTo: delivery._id ? `/delivery-notes/${delivery._id}` : null,
    })
  );

  // Custom render function for LPO items
  const renderLPOItem = (item) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
          <FileCheck size={16} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">{item.title}</p>
          <p className="text-xs text-gray-400">{item.subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {item.amount ? `KSH ${item.amount.toLocaleString()}` : ""}
        </p>
        <p
          className={`text-xs ${
            item.status === "fulfilled" ? "text-gray-500" : "text-green-500"
          }`}
        >
          {item.status === "fulfilled" ? "Fulfilled" : "Processing"}
        </p>
      </div>
    </div>
  );

  // Custom render function for delivery notes
  const renderDeliveryItem = (item) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
          <Truck size={16} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">{item.title}</p>
          <p className="text-xs text-gray-400">{item.subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-yellow-500">
          {item.status === "in_transit" ? "In Transit" : "Pending"}
        </p>
        <p className="text-xs text-gray-400">{item.date}</p>
      </div>
    </div>
  );

  // Create summary for quotation status
  const quotationSummary = `${data.quotations.approved} out of ${data.quotations.total} quotations have been approved.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quotation Status Breakdown */}
      <div>
        <StatusBreakdown
          title="Quotation Status"
          items={quotationStatusItems}
          total={data.quotations.total}
          summary={quotationSummary}
        />
      </div>

      {/* Recent LPOs */}
      <div>
        <RecentItemsList
          title="Recent LPOs"
          items={formatLPOItems([
            // Sample LPO data - replace with actual data when available
            {
              _id: "lpo1",
              lpoNumber: "LPO2045",
              clientName: "ABC Company Ltd.",
              totalAmount: 125000,
              status: "processing",
            },
            {
              _id: "lpo2",
              lpoNumber: "LPO2044",
              clientName: "XYZ Industries",
              totalAmount: 85700,
              status: "fulfilled",
            },
            {
              _id: "lpo3",
              lpoNumber: "LPO2043",
              clientName: "123 Construction Co.",
              totalAmount: 230500,
              status: "processing",
            },
          ])}
          linkTo="/lpos"
          renderItem={renderLPOItem}
          emptyMessage="No LPOs found"
        />
      </div>

      {/* Pending Deliveries */}
      <div>
        <RecentItemsList
          title="Pending Deliveries"
          items={formatDeliveryItems}
          linkTo="/delivery-notes"
          renderItem={renderDeliveryItem}
          emptyMessage="No pending deliveries"
        />
      </div>
    </div>
  );
};

export default SalesTab;
