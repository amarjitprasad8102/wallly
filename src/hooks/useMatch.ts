import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'ready';

interface SignalMessage {
  from: string;
  to: string;
  type: SignalType;
  data: any;
}

export const useMatch = (userId: string) => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const [searchingUsersCount, setSearchingUsersCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onSignalRef = useRef<((message: SignalMessage) => void) | null>(null);
  const hasMatchedRef = useRef(false);
  const isDirectConnectionRef = useRef(false);
  const pendingSignalsRef = useRef<SignalMessage[]>([]);
  const matchCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueCountIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectDirectly = useCallback((targetUserId: string) => {
    if (!userId) {
      console.warn('connectDirectly called without userId; aborting.');
      return;
    }
    console.log('[MATCH] Connecting directly to:', targetUserId);
    
    // Reset all state before connecting
    setIsSearching(false);
    setSearchingUsersCount(0);
    hasMatchedRef.current = true;
    isDirectConnectionRef.current = true;
    
    // Clear any existing channel
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
    }
    
    setMatchedUserId(targetUserId);

    const channel = supabase.channel('matchmaking', {
      config: {
        presence: {
          key: userId,
        },
        broadcast: {
          self: false,
        },
      },
    });

    channel
      .on('broadcast', { event: 'signal' }, (payload) => {
        const message = payload.payload as SignalMessage;
        console.log('[MATCH] Broadcast received:', message.type, 'from:', message.from, 'to:', message.to);
        if (message.to === userId) {
          if (onSignalRef.current) {
            onSignalRef.current(message);
          } else {
            console.log('[MATCH] Queueing signal (no handler yet):', message.type);
            pendingSignalsRef.current.push(message);
          }
        }
      })
      .subscribe(async (status) => {
        console.log('[MATCH] Direct connection channel status:', status);
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, timestamp: Date.now() });
        }
      });

    channelRef.current = channel;
  }, [userId]);

  const joinMatchmaking = useCallback(async () => {
    if (!userId) {
      console.warn('joinMatchmaking called without userId; aborting.');
      return;
    }
    console.log('[MATCH] Starting database-based matchmaking for user:', userId);
    
    // Reset state before starting
    setMatchedUserId(null);
    setSearchingUsersCount(0);
    hasMatchedRef.current = false;
    isDirectConnectionRef.current = false;
    
    // Clear any existing channel and intervals
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
    }
    if (matchCheckIntervalRef.current) {
      clearInterval(matchCheckIntervalRef.current);
    }
    if (queueCountIntervalRef.current) {
      clearInterval(queueCountIntervalRef.current);
    }
    
    setIsSearching(true);

    // Get user's unique_id from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', userId)
      .single();

    if (!profile?.unique_id) {
      console.error('[MATCH] Could not find user profile');
      setIsSearching(false);
      return;
    }

    // Setup broadcast channel for WebRTC signaling
    const channel = supabase.channel('matchmaking', {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    channel
      .on('broadcast', { event: 'signal' }, (payload) => {
        const message = payload.payload as SignalMessage;
        console.log('[MATCH] Signal received:', message.type, 'from:', message.from, 'to:', message.to);
        if (message.to === userId) {
          if (onSignalRef.current) {
            onSignalRef.current(message);
          } else {
            console.log('[MATCH] Queueing signal (no handler yet):', message.type);
            pendingSignalsRef.current.push(message);
          }
        }
      })
      .subscribe((status) => {
        console.log('[MATCH] Channel status:', status);
      });

    channelRef.current = channel;

    // Try to find a match immediately
    try {
      const { data: matchData } = await supabase.rpc('find_match', {
        p_user_id: userId,
        p_unique_id: profile.unique_id
      });

      if (matchData && matchData.length > 0 && matchData[0].matched_user_id) {
        hasMatchedRef.current = true;
        console.log('[MATCH] Immediately matched with:', matchData[0].matched_user_id);
        setMatchedUserId(matchData[0].matched_user_id);
        setIsSearching(false);
        return;
      }
    } catch (error) {
      console.error('[MATCH] Error finding match:', error);
    }

    // Poll for matches every 2 seconds
    matchCheckIntervalRef.current = setInterval(async () => {
      if (hasMatchedRef.current) {
        if (matchCheckIntervalRef.current) {
          clearInterval(matchCheckIntervalRef.current);
        }
        return;
      }

      try {
        const { data: queueData } = await supabase
          .from('matchmaking_queue')
          .select('matched_with_user_id, matched_with_unique_id')
          .eq('user_id', userId)
          .eq('status', 'matched')
          .single();

        if (queueData?.matched_with_user_id) {
          hasMatchedRef.current = true;
          console.log('[MATCH] Found match from queue:', queueData.matched_with_user_id);
          setMatchedUserId(queueData.matched_with_user_id);
          setIsSearching(false);
          if (matchCheckIntervalRef.current) {
            clearInterval(matchCheckIntervalRef.current);
          }
        }
      } catch (error) {
        // User not matched yet, continue polling
      }
    }, 2000);

    // Update queue count every 3 seconds
    queueCountIntervalRef.current = setInterval(async () => {
      try {
        const { data: count } = await supabase.rpc('get_queue_count');
        setSearchingUsersCount(count || 0);
      } catch (error) {
        console.error('[MATCH] Error getting queue count:', error);
      }
    }, 3000);

    // Get initial count
    try {
      const { data: count } = await supabase.rpc('get_queue_count');
      setSearchingUsersCount(count || 0);
    } catch (error) {
      console.error('[MATCH] Error getting initial queue count:', error);
    }
  }, [userId]);

  const sendSignal = useCallback(
    (to: string, type: SignalType, data: any) => {
      if (channelRef.current) {
        const message: SignalMessage = { from: userId, to, type, data };
        console.log('Sending signal:', type, 'to:', to);
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: message,
        });
      }
    },
    [userId]
  );

  const onSignal = useCallback((callback: (message: SignalMessage) => void) => {
    onSignalRef.current = callback;
    // Flush any queued signals now that we have a handler
    if (pendingSignalsRef.current.length) {
      for (const msg of pendingSignalsRef.current) {
        try {
          callback(msg);
        } catch (e) {
          console.error('Error delivering queued signal:', e);
        }
      }
      pendingSignalsRef.current = [];
    }
  }, []);

  const leaveMatchmaking = useCallback(async () => {
    // Clear intervals
    if (matchCheckIntervalRef.current) {
      clearInterval(matchCheckIntervalRef.current);
      matchCheckIntervalRef.current = null;
    }
    if (queueCountIntervalRef.current) {
      clearInterval(queueCountIntervalRef.current);
      queueCountIntervalRef.current = null;
    }

    // Remove from queue
    try {
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('[MATCH] Error leaving queue:', error);
    }

    // Clean up channel
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setIsSearching(false);
    setMatchedUserId(null);
    setSearchingUsersCount(0);
    hasMatchedRef.current = false;
    isDirectConnectionRef.current = false;
  }, [userId]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (matchCheckIntervalRef.current) {
        clearInterval(matchCheckIntervalRef.current);
      }
      if (queueCountIntervalRef.current) {
        clearInterval(queueCountIntervalRef.current);
      }
      
      // Remove from queue when component unmounts
      if (userId) {
        (async () => {
          try {
            await supabase
              .from('matchmaking_queue')
              .delete()
              .eq('user_id', userId);
            console.log('[MATCH] Cleaned up queue on unmount');
          } catch (err) {
            console.error('[MATCH] Error cleaning queue:', err);
          }
        })();
      }
      
      leaveMatchmaking();
    };
  }, [leaveMatchmaking, userId]);

  return {
    isSearching,
    matchedUserId,
    searchingUsersCount,
    joinMatchmaking,
    connectDirectly,
    leaveMatchmaking,
    sendSignal,
    onSignal,
  };
};
