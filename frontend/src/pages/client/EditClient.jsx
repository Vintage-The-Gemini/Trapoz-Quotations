// frontend/src/pages/client/EditClient.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ClientForm from '../../components/client/ClientForm';
import * as clientService from '../../services/clientService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';

const EditClient = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClientById(id);
      setClient(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch client details');
      toast.error('Error loading client information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (clientData) => {
    try {
      setLoading(true);
      const response = await clientService.updateClient(id, clientData);
      return response.data;
    } catch (error) {
      toast.error('Failed to update client');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return <ClientForm client={client} onSubmit={handleUpdateClient} isEditing={true} />;
};

export default EditClient;