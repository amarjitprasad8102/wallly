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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onSignalRef = useRef<((message: SignalMessage) => void) | null>(null);
  const hasMatchedRef = useRef(false);
  const isDirectConnectionRef = useRef(false);
  // Buffer signals received before a handler is registered (prevents race conditions)
  const pendingSignalsRef = useRef<SignalMessage[]>([]);

  const connectDirectly = useCallback((targetUserId: string) => {
    if (!userId) {
      console.warn('connectDirectly called without userId; aborting.');
      return;
    }
    console.log('Connecting directly to:', targetUserId);
    setIsSearching(false);
    setMatchedUserId(targetUserId);
    hasMatchedRef.current = true;
    isDirectConnectionRef.current = true;

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
        console.log('Broadcast received:', message.type, 'from:', message.from, 'to:', message.to);
        if (message.to === userId) {
          if (onSignalRef.current) {
            onSignalRef.current(message);
          } else {
            console.log('Queueing signal (no handler yet):', message.type);
            pendingSignalsRef.current.push(message);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, timestamp: Date.now() });
        }
      });

    channelRef.current = channel;
  }, [userId]);

  const joinMatchmaking = useCallback(() => {
    if (!userId) {
      console.warn('joinMatchmaking called without userId; aborting.');
      return;
    }
    console.log('[MATCH] Starting matchmaking for user:', userId);
    setIsSearching(true);
    setMatchedUserId(null);
    hasMatchedRef.current = false;
    isDirectConnectionRef.current = false;

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
      .on('presence', { event: 'sync' }, () => {
        if (hasMatchedRef.current) return;
        
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState).filter(id => id !== userId);
        console.log('[MATCH] Available users:', users);

        if (users.length > 0) {
          // Sort users to ensure deterministic matching
          const sortedUsers = [...users, userId].sort();
          const myIndex = sortedUsers.indexOf(userId);
          
          // Only match if we're at an even index (0, 2, 4...)
          // and there's a user right after us
          if (myIndex % 2 === 0 && myIndex + 1 < sortedUsers.length) {
            const partner = sortedUsers[myIndex + 1];
            hasMatchedRef.current = true;
            console.log('[MATCH] Matched with:', partner, 'as initiator');
            setMatchedUserId(partner);
            setIsSearching(false);
          } 
          // If we're at odd index (1, 3, 5...), match with user before us
          else if (myIndex % 2 === 1) {
            const partner = sortedUsers[myIndex - 1];
            hasMatchedRef.current = true;
            console.log('[MATCH] Matched with:', partner, 'as receiver');
            setMatchedUserId(partner);
            setIsSearching(false);
          } else {
            console.log('[MATCH] Waiting for a partner... (odd number of users)');
          }
        }
      })
      .on('broadcast', { event: 'signal' }, (payload) => {
        const message = payload.payload as SignalMessage;
        console.log('Broadcast received:', message.type, 'from:', message.from, 'to:', message.to);
        if (message.to === userId) {
          if (onSignalRef.current) {
            onSignalRef.current(message);
          } else {
            // No handler yet: queue it so Chat can process later
            console.log('Queueing signal (no handler yet):', message.type);
            pendingSignalsRef.current.push(message);
          }
        }
      })
      .subscribe(async (status) => {
        console.log('[MATCH] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[MATCH] Tracking presence for user:', userId);
          await channel.track({ user_id: userId, timestamp: Date.now() });
        }
      });

    channelRef.current = channel;
  }, [userId, matchedUserId]);

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

  const leaveMatchmaking = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsSearching(false);
    setMatchedUserId(null);
    hasMatchedRef.current = false;
    isDirectConnectionRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      leaveMatchmaking();
    };
  }, [leaveMatchmaking]);

  return {
    isSearching,
    matchedUserId,
    joinMatchmaking,
    connectDirectly,
    leaveMatchmaking,
    sendSignal,
    onSignal,
  };
};
