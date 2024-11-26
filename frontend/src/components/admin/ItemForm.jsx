// frontend/src/components/admin/ItemForm.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ItemForm = ({ item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    units: '',
    unitPrice: 0,
    isParent: false,
    parentId: null
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-light rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-primary">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              className="input w-full"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="Transport">Transport</option>
              <option value="Equipment">Equipment</option>
              <option value="Labour">Labour</option>
              <option value="Auxiliaries">Auxiliaries</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Units
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              placeholder="e.g., Days, Trucks, Item"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Unit Price
            </label>
            <input
              type="number"
              className="input w-full"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;