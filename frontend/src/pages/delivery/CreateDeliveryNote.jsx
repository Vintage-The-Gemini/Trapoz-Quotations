// frontend/src/pages/delivery/CreateDeliveryNote.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Info, Trash2 } from 'lucide-react';
import * as lpoService from '../../services/lpoService';
import * as deliveryService from '../../services/deliveryService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';

const CreateDeliveryNote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lpoId = searchParams.get('lpoId');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lpo, setLpo] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    lpoId: '',
    items: [],
    vehicleDetails: '',
    driverName: '',
    driverContact: '',
    notes: ''
  });

  useEffect(() => {
    if (lpoId) {
      fetchLpoDetails();
    } else {
      setLoading(false);
    }
  }, [lpoId]);

  const fetchLpoDetails = async () => {
    try {
      setLoading(true);
      const response = await lpoService.getLPOById(lpoId);
      const lpoData = response.data;
      
      setLpo(lpoData);
      
      // Initialize delivery items from LPO items
      const deliveryItems = lpoData.items.map(item => ({
        description: item.description,
        units: item.units || '',
        quantity: item.quantity,
        remarks: ''
      }));
      
      setFormData({
        lpoId: lpoData._id,
        items: deliveryItems,
        vehicleDetails: '',
        driverName: '',
        driverContact: '',
        notes: '',
        clientName: lpoData.clientName,
        clientAddress: lpoData.clientAddress,
        deliveryAddress: lpoData.deliveryAddress || lpoData.clientAddress
      });
      
      setError(null);
    } catch (error) {
      setError('Failed to load LPO details');
      toast.error('Error loading LPO information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', units: '', quantity: 1, remarks: '' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await deliveryService.createDeliveryNote(formData);
      toast.success('Delivery note created successfully');
      navigate(`/delivery-notes/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create delivery note');
      console.error('Error creating delivery note:', error);
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
          onClick={() => navigate('/delivery-notes')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          Create Delivery Note
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
              {lpo ? 
                `This delivery note is based on LPO #${lpo.lpoNumber} for ${lpo.clientName}.` : 
                'Create a delivery note to track shipments to clients based on an LPO.'}
            </p>
          </div>

          {/* LPO Selection if not already selected */}
          {!lpo && (
            <div className="bg-dark-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select LPO</h2>
              <p className="text-gray-400 mb-4">
                Please select an LPO to create a delivery note.
              </p>
              <Link to="/lpos" className="btn btn-primary">
                Select an LPO
              </Link>
            </div>
          )}

          {lpo && (
            <>
              {/* Delivery Details */}
              <div className="bg-dark-light rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Delivery Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.clientName}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      LPO Number
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={lpo.lpoNumber}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Vehicle Details
                    </label>
                    <input
                      type="text"
                      name="vehicleDetails"
                      className="input w-full"
                      value={formData.vehicleDetails}
                      onChange={handleInputChange}
                      placeholder="Vehicle make, model, registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      className="input w-full"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      placeholder="Driver's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Driver Contact
                    </label>
                    <input
                      type="text"
                      name="driverContact"
                      className="input w-full"
                      value={formData.driverContact}
                      onChange={handleInputChange}
                      placeholder="Driver's phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      name="deliveryAddress"
                      className="input w-full"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Delivery location"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-dark-light rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Items for Delivery</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full mt-4">
                    <thead>
                      <tr className="border-b border-dark">
                        <th className="text-left py-3 px-4 text-gray-400">Description</th>
                        <th className="text-left py-3 px-4 text-gray-400">Units</th>
                        <th className="text-right py-3 px-4 text-gray-400">Quantity</th>
                        <th className="text-left py-3 px-4 text-gray-400">Remarks</th>
                        <th className="text-center py-3 px-4 text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-gray-400">
                            No items added yet. Click "Add Item" to add items to this delivery.
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
                                type="text"
                                className="input w-full"
                                value={item.remarks}
                                onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                                placeholder="Any notes about this item"
                              />
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
                  </table>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn bg-dark-lighter hover:bg-dark text-gray-300"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-dark-light rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Additional Notes</h2>
                <textarea
                  name="notes"
                  className="input w-full h-32 resize-none"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this delivery..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/delivery-notes')}
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
                  {submitting ? 'Creating...' : 'Create Delivery Note'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default CreateDeliveryNote;