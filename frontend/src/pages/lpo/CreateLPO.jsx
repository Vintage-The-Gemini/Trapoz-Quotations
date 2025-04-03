// frontend/src/pages/lpo/CreateLPO.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload, File } from 'lucide-react';
import * as quotationService from '../../services/quotationService';
import * as clientService from '../../services/clientService';
import * as itemService from '../../services/itemService';
import * as lpoService from '../../services/lpoService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';

const CreateLPO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [lpoFile, setLpoFile] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    lpoNumber: '',
    quotationId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
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
    // Check for quotation ID in URL params
    const params = new URLSearchParams(location.
};

export default CreateLPO;