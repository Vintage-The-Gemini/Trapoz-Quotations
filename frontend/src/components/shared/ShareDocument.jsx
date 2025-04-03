// frontend/src/components/shared/ShareDocument.jsx
import { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ShareDocument = ({ 
  documentType, 
  documentId, 
  documentNumber, 
  clientName, 
  clientEmail, 
  onClose 
}) => {
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '');
  const [recipientName, setRecipientName] = useState(clientName || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const documentTypeLabels = {
    'quotation': 'Quotation',
    'lpo': 'Local Purchase Order',
    'invoice': 'Invoice',
    'receipt': 'Receipt',
    'delivery-note': 'Delivery Note'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipientEmail) {
      toast.error('Please enter a recipient email');
      return;
    }
    
    try {
      setSending(true);
      
      const response = await axios.post('/api/share', {
        documentType,
        documentId,
        recipientEmail,
        recipientName,
        message
      });
      
      toast.success('Document shared successfully');
      onClose();
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-dark-light rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-dark-lighter">
          <h2 className="text-lg font-semibold text-white">
            Share {documentTypeLabels[documentType] || documentType}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-dark-lighter">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-dark-lighter rounded-lg p-3 text-sm text-gray-300">
            <p className="mb-1">Document: <span className="font-medium text-white">{documentNumber}</span></p>
            <p>Type: <span className="text-primary">{documentTypeLabels[documentType] || documentType}</span></p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipient Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={16} className="text-gray-500" />
              </div>
              <input
                type="email"
                className="input pl-10 w-full"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              className="input w-full"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Message (Optional)
            </label>
            <textarea
              className="input w-full h-32 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personalized message..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={sending}
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareDocument;