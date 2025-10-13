import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SignalType = 'offer' | 'answer' | 'ice-candidate';

interface SignalMessage {
  from: string;
  to: string;
  type: SignalType;
  data: any;
}

export const useVideoMatch = (userId: string) => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onSignalRef = useRef<((message: SignalMessage) => void) | null>(null);

  const joinMatchmaking = useCallback(() => {
    if (!userId) {
      console.warn('joinMatchmaking called without userId; aborting.');
      return;
    }
    setIsSearching(true);
    setMatchedUserId(null);

    const channel = supabase.channel('video-matchmaking', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState).sort();
        console.log('Users in channel:', users);

        if (!matchedUserId) {
          const myIndex = users.indexOf(userId);
          if (myIndex !== -1) {
            const partner = myIndex % 2 === 0 ? users[myIndex + 1] : users[myIndex - 1];
            if (partner) {
              console.log('Matched with:', partner);
              setMatchedUserId(partner);
              setIsSearching(false);
            }
          }
        }
      })
      .on('broadcast', { event: 'signal' }, (payload) => {
        const message = payload.payload as SignalMessage;
        if (message.to === userId && onSignalRef.current) {
          onSignalRef.current(message);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, timestamp: Date.now() });
        }
      });

    channelRef.current = channel;
  }, [userId, matchedUserId]);

  const sendSignal = useCallback(
    (to: string, type: SignalType, data: any) => {
      if (channelRef.current) {
        const message: SignalMessage = { from: userId, to, type, data };
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
  }, []);

  const leaveMatchmaking = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsSearching(false);
    setMatchedUserId(null);
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
    leaveMatchmaking,
    sendSignal,
    onSignal,
  };
};
