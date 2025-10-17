import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
  last_message_at: string | null;
  connected_profile?: {
    unique_id: string;
    email: string;
  };
}

interface PendingRequest {
  id: string;
  to_user_id: string;
  from_user_id: string;
  status: string;
  created_at: string;
  to_profile?: {
    unique_id: string;
    email: string;
  };
}

export const useConnections = (userId: string | undefined) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchConnections = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (!error && data) {
        // Fetch connected user profiles separately
        const connectedUserIds = data.map(c => c.connected_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, unique_id, email')
          .in('id', connectedUserIds);

        const enrichedData = data.map(connection => ({
          ...connection,
          connected_profile: profiles?.find(p => p.id === connection.connected_user_id)
        }));

        setConnections(enrichedData);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to load connections');
        setLoading(false);
      }
    };

    fetchConnections();

    // Fetch pending sent requests
    const fetchPendingRequests = async () => {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('from_user_id', userId)
        .eq('status', 'pending');

      if (!error && data) {
        const toUserIds = data.map(r => r.to_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, unique_id, email')
          .in('id', toUserIds);

        const enrichedRequests = data.map(request => ({
          ...request,
          to_profile: profiles?.find(p => p.id === request.to_user_id)
        }));

        setPendingRequests(enrichedRequests);
      }
    };

    fetchPendingRequests();

    // Subscribe to changes
    const channel = supabase
      .channel('connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const disconnectUser = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
      return { error: error.message };
    }

    toast.success('Connection removed');
    return { error: null };
  };

  const cancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('connection_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error canceling request:', error);
      toast.error('Failed to cancel request');
      return { error: error.message };
    }

    toast.success('Request canceled');
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    return { error: null };
  };

  return { connections, pendingRequests, loading, disconnectUser, cancelRequest };
};
