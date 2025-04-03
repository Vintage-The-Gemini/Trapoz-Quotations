// frontend/src/pages/client/CreateClient.jsx
import { useState } from 'react';
import ClientForm from '../../components/client/ClientForm';
import * as clientService from '../../services/clientService';
import { toast } from 'react-hot-toast';

const CreateClient = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateClient = async (clientData) => {
    try {
      setLoading(true);
      const response = await clientService.createClient(clientData);
      return response.data;
    } catch (error) {
      toast.error('Failed to create client');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return <ClientForm onSubmit={handleCreateClient} isEditing={false} />;
};

export default CreateClient;