// frontend/src/pages/lpo/CreateLPO.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Info } from 'lucide-react';
import * as quotationService from '../../services/quotationService';
import * as clientService from '../../services/clientService';
import * as lpoService from '../../services/lpoService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const CreateLPO = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    lpoNumber: '',
    quotationId: '',
    clientId: '',
    issuedDate: '',
    clientName: '',
    clientAddress: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    items: [],
    deliveryAddress: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchInitialData();
    
    // Set default issued date (today)
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, issuedDate: today }));
  }, [quotationId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch clients for dropdown
      const clientsResponse = await clientService.getClients();
      setClients(clientsResponse.data);
      
      // Fetch approved quotations for dropdown
      const quotationsResponse = await quotationService.getQuotations();
      const approvedQuotations = quotationsResponse.data.filter(
        quotation => quotation.status === 'approved'
      );
      setQuotations(approvedQuotations);
      
      // If quotationId is provided in URL, load that quotation
      if (quotationId) {
        await loadQuotationDetails(quotationId);
      }
      
      setError(null);
    } catch (error) {
      setError('Failed to load initial data');
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotationDetails = async (id) => {
    try {
      const response = await quotationService.getQuotationById(id);
      const quotation = response.data;
      
      // Find client in our clients list
      const relatedClient = clients.find(
        client => client.name === quotation.clientName
      );
      
      setSelectedQuotation(quotation);
      setSelectedClient(relatedClient);
      
      // Populate form with quotation data
      setFormData(prev => ({
        ...prev,
        quotationId: quotation._id,
        clientId: relatedClient?._id || '',
        clientName: quotation.clientName,
        clientAddress: quotation.clientAddress || '',
        items: [...quotation.items.map(item => ({
          description: item.description,
          units: item.units || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        })), 
        ...(quotation.customItems || []).map(item => ({
          description: item.description,
          units: item.units || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        }))],
        deliveryAddress: quotation.site || ''
      }));
    } catch (error) {
      toast.error('Failed to load quotation details');
      console.error(error);
    }
  };

  const loadClientDetails = async (id) => {
    try {
      if (!id) return;
      
      const response = await clientService.getClientById(id);
      const client = response.data;
      
      setSelectedClient(client);
      
      // Update form with client data
      setFormData(prev => ({
        ...prev,
        clientId: client._id,
        clientName: client.name,
        clientAddress: client.address?.street && client.address?.city ? 
          `${client.address.street}, ${client.address.city}${client.address.state ? ', ' + client.address.state : ''}${client.address.postalCode ? ' ' + client.address.postalCode : ''}` :
          '',
        contactPerson: client.contactPerson?.name || '',
        contactEmail: client.contactPerson?.email || client.email || '',
        contactPhone: client.contactPerson?.phone || client.phone || '',
        deliveryAddress: client.address?.street && client.address?.city ? 
          `${client.address.street}, ${client.address.city}${client.address.state ? ', ' + client.address.state : ''}${client.address.postalCode ? ' ' + client.address.postalCode : ''}` :
          ''
      }));
    } catch (error) {
      toast.error('Failed to load client details');
      console.error(error);
    }
  };

  const handleQuotationChange = async (e) => {
    const quotationId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      quotationId,
      // Reset items when quotation changes
      items: []
    }));
    
    if (quotationId) {
      await loadQuotationDetails(quotationId);
    } else {
      setSelectedQuotation(null);
    }
  };

  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      clientId,
      // Don't reset items when client changes
    }));
    
    if (clientId) {
      await loadClientDetails(clientId);
    } else {
      setSelectedClient(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
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
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', units: '', quantity: 1, unitPrice: 0, amount: 0 }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File is too large. Maximum file size is 10MB.');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const calculateTotals = () => {
    const subTotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const vat = subTotal * 0.16;
    const totalAmount = subTotal + vat;
    
    return { subTotal, vat, totalAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { subTotal, vat, totalAmount } = calculateTotals();
      
      // Create form data for file upload
      const submitData = new FormData();
      
      // Add LPO data
      const lpoData = {
        ...formData,
        subTotal,
        vat,
        totalAmount
      };
      
      // Convert to FormData for file upload
      if (uploadedFile) {
        submitData.append('attachment', uploadedFile);
      }
      
      // Append JSON data as a string
      submitData.append('lpoData', JSON.stringify(lpoData));
      
      const response = await lpoService.createLPO(submitData);
      toast.success('LPO recorded successfully');
      navigate(`/lpos/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to record LPO');
      console.error('Error recording LPO:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lpos')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          Record New LPO
        </h1>
      </div>

      {error ? (
        <Error message={error} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Information note */}
          <div className="bg-blue-900/30 border border-blue-700 text-blue-200 p-4 rounded-lg flex items-start">
            <Info size={20} className="flex-shrink-0 mt-0.5 mr-3" />
            <p className="text-sm">
              Use this form to record Local Purchase Orders (LPOs) received from clients. You can link it to an approved quotation or create a standalone LPO.
            </p>
          </div>

          {/* LPO Details Section */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">LPO Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  LPO Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lpoNumber"
                  className="input w-full"
                  value={formData.lpoNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter client's LPO number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="issuedDate"
                  className="input w-full"
                  value={formData.issuedDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Based on Quotation
                </label>
                <select
                  name="quotationId"
                  className="input w-full"
                  value={formData.quotationId}
                  onChange={handleQuotationChange}
                >
                  <option value="">Select a quotation (optional)</option>
                  {quotations.map(quotation => (
                    <option key={quotation._id} value={quotation._id}>
                      {quotation.quoteNumber} - {quotation.clientName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Linking to a quotation will auto-fill client and item details
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Upload LPO Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-lighter border-dashed rounded-md">
                  {!uploadedFile ? (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-lighter rounded-md font-medium text-primary hover:text-primary-light px-3 py-2">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" 
                            onChange={handleFileUpload}
                            accept="application/pdf,image/jpeg,image/png"
                          />
                        </label>
                        <p className="pl-1 pt-2">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <div className="flex items-center justify-between bg-dark-lighter p-2 rounded mb-2">
                        <span className="text-sm text-gray-300 truncate">{uploadedFile.name}</span>
                        <button 
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Section */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
            
            {/* Client Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Select Client
              </label>
              <select
                name="clientId"
                className="input w-full"
                value={formData.clientId}
                onChange={handleClientChange}
                disabled={!!selectedQuotation} // Disable if quotation is selected
              >
                <option value="">Select a client or enter details below</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedQuotation ? 'Client details are populated from the selected quotation' : 'Selecting a client will auto-fill the details below'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  className="input w-full"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  readOnly={!!selectedQuotation} // Read-only if quotation is selected
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  className="input w-full"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Contact person's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  className="input w-full"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Contact email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  className="input w-full"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Contact phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Client Address
                </label>
                <textarea
                  name="clientAddress"
                  className="input w-full"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Client's address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  className="input w-full"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Where items should be delivered"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
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

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="min-w-full mt-4">
                <thead>
                  <tr className="border-b border-dark">
                    <th className="text-left py-3 px-4 text-gray-400">Description</th>
                    <th className="text-left py-3 px-4 text-gray-400">Units</th>
                    <th className="text-right py-3 px-4 text-gray-400">Quantity</th>
                    <th className="text-right py-3 px-4 text-gray-400">Unit Price</th>
                    <th className="text-right py-3 px-4 text-gray-400">Amount</th>
                    <th className="text-center py-3 px-4 text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-400">
                        No items added yet. {selectedQuotation ? 'Items should be loaded from the quotation.' : 'Click "Add Item" to add items to this LPO.'}
                      </td>
                    </tr>
                  ) : (
                    formData.items.map((item, index) => (
                      <tr key={index} className="border-b border-dark-lighter">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            className="input w-full"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            required
                            placeholder="Item description"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            className="input w-full"
                            value={item.units}
                            onChange={(e) => handleItemChange(index, 'units', e.target.value)}
                            placeholder="e.g., pcs, kg, days"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            className="input w-full text-right"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            min="1"
                            required
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            className="input w-full text-right"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {formData.items.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Subtotal</td>
                      <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(calculateTotals().subTotal)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">VAT (16%)</td>
                      <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(calculateTotals().vat)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total</td>
                      <td className="text-right py-3 px-4 font-medium text-primary">{formatCurrency(calculateTotals().totalAmount)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Notes</h2>
            <textarea
              name="additionalNotes"
              className="input w-full h-32 resize-none"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any additional notes, terms, or special instructions..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/lpos')}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={submitting}
            >
              <Save size={20} />
              {submitting ? 'Saving...' : 'Record LPO'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateLPO;