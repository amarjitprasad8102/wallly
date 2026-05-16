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

export interface PremiumMatchFilters {
  genderFilter?: string; // 'any' or any GENDER_OPTIONS value
  ageRange?: [number, number];
  priorityMatching?: boolean;
  interestPriority?: boolean;
}

export const useMatch = (
  userId: string,
  chatMode: 'video' | 'text' = 'video',
  isPremium: boolean = false,
  filters?: PremiumMatchFilters,
  userGender?: string | null,
) => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const [searchingUsersCount, setSearchingUsersCount] = useState(0);
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

    const channelName = `matchmaking-${chatMode}`;
    const channel = supabase.channel(channelName, {
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

  const joinMatchmaking = useCallback(() => {
    if (!userId) {
      console.warn('joinMatchmaking called without userId; aborting.');
      return;
    }
    console.log('[MATCH] Starting matchmaking for user:', userId);
    
    // Reset state before starting
    setMatchedUserId(null);
    setSearchingUsersCount(0);
    hasMatchedRef.current = false;
    isDirectConnectionRef.current = false;
    
    // Clear any existing channel
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
    }
    
    setIsSearching(true);

    const channelName = `matchmaking-${chatMode}`;
    const channel = supabase.channel(channelName, {
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
        const presenceState = channel.presenceState() as Record<string, Array<{
          user_id: string;
          is_premium?: boolean;
          gender?: string | null;
          filters?: PremiumMatchFilters;
        }>>;

        // Build a map of every present user (including self) → their state.
        const allUserIds = Object.keys(presenceState);
        const stateFor = (id: string) => presenceState[id]?.[0];

        const otherIds = allUserIds.filter((id) => id !== userId);
        setSearchingUsersCount(otherIds.length);

        if (hasMatchedRef.current) return;
        if (otherIds.length === 0) return;

        // Mutual-acceptance predicate.
        // Free users accept everyone; premium users honour their genderFilter.
        const accepts = (viewerId: string, candidateId: string): boolean => {
          const viewer = stateFor(viewerId);
          const candidate = stateFor(candidateId);
          if (!viewer || !candidate) return false;
          const viewerIsPremium = !!viewer.is_premium;
          const pref = viewer.filters?.genderFilter;
          if (!viewerIsPremium || !pref || pref === 'any') return true;
          return candidate.gender === pref;
        };

        // Deterministic greedy pairing across all clients: sort user ids,
        // walk in order, pair each unmatched user with the first later
        // unmatched user that is mutually compatible.
        const sortedIds = [...allUserIds].sort();
        const matched = new Set<string>();
        const pairs = new Map<string, string>();

        for (const a of sortedIds) {
          if (matched.has(a)) continue;
          for (const b of sortedIds) {
            if (b <= a || matched.has(b)) continue;
            if (accepts(a, b) && accepts(b, a)) {
              matched.add(a);
              matched.add(b);
              pairs.set(a, b);
              pairs.set(b, a);
              break;
            }
          }
        }

        const partner = pairs.get(userId);
        if (partner) {
          hasMatchedRef.current = true;
          const role = partner > userId ? 'initiator' : 'receiver';
          console.log('[MATCH] Matched with:', partner, 'as', role);
          setMatchedUserId(partner);
          setIsSearching(false);
        } else {
          console.log('[MATCH] No compatible partner yet — waiting.');
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
          console.log('[MATCH] Tracking presence for user:', userId, 'isPremium:', isPremium, 'gender:', userGender);
          await channel.track({
            user_id: userId,
            timestamp: Date.now(),
            is_premium: isPremium,
            gender: userGender ?? null,
            filters: filters || {},
          });
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
    setSearchingUsersCount(0);
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
    searchingUsersCount,
    joinMatchmaking,
    connectDirectly,
    leaveMatchmaking,
    sendSignal,
    onSignal,
  };
};
