// frontend/src/components/client/ClientForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, Users, Phone, Mail, MapPin, CreditCard, ReceiptText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClientForm = ({ client, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Kenya'
    },
    contactPerson: {
      name: '',
      position: '',
      email: '',
      phone: ''
    },
    phone: '',
    email: '',
    website: '',
    industry: '',
    status: 'active',
    paymentTerms: {
      dueDate: 30,
      discountDays: 0,
      discountPercent: 0
    },
    taxInfo: {
      vatNumber: '',
      pinNumber: '',
      taxExempt: false
    },
    notes: ''
  });

  useEffect(() => {
    if (client) {
      // Initialize form with client data for editing
      setFormData({
        name: client.name || '',
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          postalCode: client.address?.postalCode || '',
          country: client.address?.country || 'Kenya'
        },
        contactPerson: {
          name: client.contactPerson?.name || '',
          position: client.contactPerson?.position || '',
          email: client.contactPerson?.email || '',
          phone: client.contactPerson?.phone || ''
        },
        phone: client.phone || '',
        email: client.email || '',
        website: client.website || '',
        industry: client.industry || '',
        status: client.status || 'active',
        paymentTerms: {
          dueDate: client.paymentTerms?.dueDate || 30,
          discountDays: client.paymentTerms?.discountDays || 0,
          discountPercent: client.paymentTerms?.discountPercent || 0
        },
        taxInfo: {
          vatNumber: client.taxInfo?.vatNumber || '',
          pinNumber: client.taxInfo?.pinNumber || '',
          taxExempt: client.taxInfo?.taxExempt || false
        },
        notes: client.notes || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fields (e.g., 'address.street')
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success(`Client ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/clients');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} client`);
      console.error('Form submission error:', error);
    }
  };

  // Tab content components
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center p-3 ${
        activeTab === id
          ? 'bg-primary text-white'
          : 'text-gray-400 hover:bg-dark hover:text-white'
      } rounded-lg transition-all duration-200`}
    >
      <Icon size={18} className="mr-2" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="text-gray-400 hover:text-white"
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          {isEditing ? 'Edit Client' : 'New Client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-light rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-dark-lighter p-4">
          <div className="flex flex-wrap gap-2">
            <TabButton id="basic" label="Basic Information" icon={Building} />
            <TabButton id="contact" label="Contact Details" icon={Users} />
            <TabButton id="address" label="Address" icon={MapPin} />
            <TabButton id="payment" label="Payment & Tax" icon={CreditCard} />
            <TabButton id="notes" label="Notes" icon={ReceiptText} />
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input w-full"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="input w-full"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    className="input w-full"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="E.g. Construction, Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    className="input w-full"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Primary Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone size={16} className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        className="input pl-10 w-full"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail size={16} className="text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        className="input pl-10 w-full"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="company@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-dark-lighter pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Contact Person</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="contactPerson.name"
                      className="input w-full"
                      value={formData.contactPerson.name}
                      onChange={handleChange}
                      placeholder="Contact person's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      name="contactPerson.position"
                      className="input w-full"
                      value={formData.contactPerson.position}
                      onChange={handleChange}
                      placeholder="E.g. Procurement Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="contactPerson.phone"
                      className="input w-full"
                      value={formData.contactPerson.phone}
                      onChange={handleChange}
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="contactPerson.email"
                      className="input w-full"
                      value={formData.contactPerson.email}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Address Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    className="input w-full"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      className="input w-full"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      className="input w-full"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State or province"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.postalCode"
                      className="input w-full"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      placeholder="Postal or ZIP code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      className="input w-full"
                      value={formData.address.country}
                      onChange={handleChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Tax Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Payment Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Due (Days)
                  </label>
                  <input
                    type="number"
                    name="paymentTerms.dueDate"
                    className="input w-full"
                    value={formData.paymentTerms.dueDate}
                    onChange={handleChange}
                    min="0"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of days until payment is due
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Early Payment Discount Days
                  </label>
                  <input
                    type="number"
                    name="paymentTerms.discountDays"
                    className="input w-full"
                    value={formData.paymentTerms.discountDays}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Days for early payment discount (0 for none)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Early Payment Discount (%)
                  </label>
                  <input
                    type="number"
                    name="paymentTerms.discountPercent"
                    className="input w-full"
                    value={formData.paymentTerms.discountPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage discount for early payment
                  </p>
                </div>
              </div>

              <div className="border-t border-dark-lighter pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Tax Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxInfo.vatNumber"
                      className="input w-full"
                      value={formData.taxInfo.vatNumber}
                      onChange={handleChange}
                      placeholder="VAT registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      PIN Number
                    </label>
                    <input
                      type="text"
                      name="taxInfo.pinNumber"
                      className="input w-full"
                      value={formData.taxInfo.pinNumber}
                      onChange={handleChange}
                      placeholder="Personal Identification Number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="taxInfo.taxExempt"
                        id="taxExempt"
                        className="h-4 w-4 rounded border-dark-lighter text-primary focus:ring-primary"
                        checked={formData.taxInfo.taxExempt}
                        onChange={handleChange}
                      />
                      <label htmlFor="taxExempt" className="ml-2 text-sm text-gray-300">
                        This client is tax exempt
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Additional Notes</h2>
              <div>
                <textarea
                  name="notes"
                  className="input w-full h-64 resize-none"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes about this client..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes are for internal use only and will not be visible to the client.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="border-t border-dark-lighter p-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {isEditing ? 'Update' : 'Save'} Client
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;