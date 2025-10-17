import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  from_profile?: {
    unique_id: string;
  };
}

export const useConnectionRequests = (userId: string | undefined) => {
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [acceptedRequest, setAcceptedRequest] = useState<ConnectionRequest | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch pending requests
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('to_user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching connection requests:', error);
        return;
      }

      // Fetch profiles for each request
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('unique_id')
            .eq('id', request.from_user_id)
            .single();

          return {
            ...request,
            from_profile: profile,
          };
        })
      );

      setPendingRequests(requestsWithProfiles);
    };

    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('connection_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_requests',
          filter: `to_user_id=eq.${userId}`,
        },
        async (payload) => {
          const newRequest = payload.new as ConnectionRequest;
          
          // Fetch the sender's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('unique_id')
            .eq('id', newRequest.from_user_id)
            .single();

          const requestWithProfile = {
            ...newRequest,
            from_profile: profile,
          };

          setPendingRequests((prev) => [...prev, requestWithProfile]);
          
          toast.info(
            `Connection request from user ${profile?.unique_id || 'Unknown'}`,
            {
              duration: 10000,
              action: {
                label: 'View',
                onClick: () => {},
              },
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connection_requests',
          filter: `from_user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as ConnectionRequest;
          if (updated.status === 'accepted') {
            setAcceptedRequest(updated);
            toast.success('Connection request accepted!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sendConnectionRequest = async (toUserId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('connection_requests')
      .insert({
        from_user_id: userId,
        to_user_id: toUserId,
        status: 'pending',
      });

    if (error) {
      if (error.code === '23505') {
        return { error: 'Connection request already sent' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const acceptConnectionRequest = async (requestId: string, fromUserId: string) => {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to accept connection request');
      return { error: error.message, fromUserId: null };
    }

    // Create connection records for both users
    if (userId) {
      await supabase.from('connections').insert([
        { user_id: userId, connected_user_id: fromUserId },
        { user_id: fromUserId, connected_user_id: userId }
      ]);
    }

    const acceptedRequest = pendingRequests.find(req => req.id === requestId);
    setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    toast.success('Connection request accepted! Connecting...');
    return { error: null, fromUserId: acceptedRequest?.from_user_id || fromUserId };
  };

  const rejectConnectionRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to reject connection request');
      return { error: error.message };
    }

    setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    return { error: null };
  };

  return {
    pendingRequests,
    acceptedRequest,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    clearAcceptedRequest: () => setAcceptedRequest(null),
  };
};
