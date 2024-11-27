// src/pages/quotation/EditQuotation.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import * as quotationService from '../../services/quotationService';
import * as itemService from '../../services/itemService';
import { toast } from 'react-hot-toast';

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    site: '',
    termsAndConditions: ''
  });

  useEffect(() => {
    fetchQuotation();
    fetchItems();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await quotationService.getQuotationById(id);
      const quotation = response.data;

      setFormData({
        clientName: quotation.clientName,
        clientAddress: quotation.clientAddress,
        site: quotation.site,
        termsAndConditions: quotation.termsAndConditions
      });

      // Set selected items
      const selected = quotation.items.map(item => ({
        itemId: item.item?._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      }));
      setSelectedItems(selected);

      // Set custom items
      setCustomItems(quotation.customItems || []);
    } catch (error) {
      toast.error('Failed to fetch quotation');
      console.error('Error fetching quotation:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemService.getItems();
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemId: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleAddCustomItem = () => {
    setCustomItems([...customItems, {
      description: '',
      units: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      isCustomItem: true
    }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedItems];
    
    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: value,
          unitPrice: selectedItem.unitPrice,
          amount: selectedItem.unitPrice * updatedItems[index].quantity
        };
      }
    } else if (field === 'quantity') {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: Number(value),
        amount: updatedItems[index].unitPrice * Number(value)
      };
    }
    
    setSelectedItems(updatedItems);
  };

  const handleCustomItemChange = (index, field, value) => {
    const updatedItems = [...customItems];
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : updatedItems[index].unitPrice;
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: Number(value),
        amount: quantity * unitPrice
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    setCustomItems(updatedItems);
  };

  const calculateSubtotal = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const customItemsTotal = customItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    return itemsTotal + customItemsTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const subtotal = calculateSubtotal();
        const vat = subtotal * 0.16;
        const total = subtotal + vat;

        const quotationData = {
            clientName: formData.clientName,
            clientAddress: formData.clientAddress,
            site: formData.site,
            items: selectedItems.map(item => ({
                item: item.itemId,
                description: items.find(i => i._id === item.itemId)?.description || '',
                units: items.find(i => i._id === item.itemId)?.units || '',
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                amount: Number(item.amount)
            })),
            customItems: customItems.map(item => ({
                description: item.description,
                units: item.units,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                amount: Number(item.amount)
            })),
            subTotal: subtotal,
            vat: vat,
            totalAmount: total,
            termsAndConditions: formData.termsAndConditions
        };

        console.log('Sending quotation data:', quotationData); // Debug log

        const response = await quotationService.updateQuotation(id, quotationData);
        console.log('Update response:', response.data); // Debug log

        toast.success('Quotation updated successfully');
        navigate(`/quotations/${id}`);
    } catch (error) {
        console.error('Error payload:', error.response?.data); // Debug log
        toast.error(error.response?.data?.message || 'Failed to update quotation');
    }
};
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/quotations/${id}`)}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">Edit Quotation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Details */}
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Client Name
              </label>
              <input
                type="text"
                className="input w-full"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Client Address
              </label>
              <input
                type="text"
                className="input w-full"
                value={formData.clientAddress}
                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Site
              </label>
              <input
                type="text"
                className="input w-full"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-dark-light rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>

          {/* Regular Items */}
          <div className="space-y-4">
            {selectedItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                {/* Item selection and other fields */}
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Item
                  </label>
                  <select
                    className="input w-full"
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={item.unitPrice}
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={item.amount}
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                    className="btn bg-red-500 hover:bg-red-600 text-white w-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Items */}
        <div className="bg-dark-light rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Custom Items</h2>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Custom Item
            </button>
          </div>

          <div className="space-y-4">
            {customItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                {/* Custom item fields */}
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={item.description}
                    onChange={(e) => handleCustomItemChange(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Units
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={item.units}
                    onChange={(e) => handleCustomItemChange(index, 'units', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={item.quantity}
                    onChange={(e) => handleCustomItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={item.unitPrice}
                    onChange={(e) => handleCustomItemChange(index, 'unitPrice', e.target.value)}
                    min="0"
                    required
                  />
                </div>
                <div className="col-span-2">
                <button
                    type="button"
                    onClick={() => setCustomItems(customItems.filter((_, i) => i !== index))}
                    className="btn bg-red-500 hover:bg-red-600 text-white w-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-dark-light rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Terms and Conditions
          </label>
          <textarea
            className="input w-full h-32 resize-none"
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            placeholder="Enter terms and conditions..."
          />
        </div>

        {/* Totals */}
        <div className="bg-dark-light rounded-lg p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">KSH {calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">VAT (16%):</span>
              <span className="text-white">KSH {(calculateSubtotal() * 0.16).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-400">Total:</span>
              <span className="text-primary">KSH {(calculateSubtotal() * 1.16).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/quotations/${id}`)}
            className="btn bg-dark-lighter hover:bg-dark text-gray-300"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuotation;