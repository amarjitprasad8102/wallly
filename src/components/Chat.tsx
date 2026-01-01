import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOff, SkipForward, Send } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReportDialog from '@/components/ReportDialog';
import ConnectionQualityIndicator from '@/components/ConnectionQualityIndicator';

interface ChatProps {
  userId: string;
  matchedUserId: string;
  sendSignal: (to: string, type: 'offer' | 'answer' | 'ice-candidate' | 'ready', data: any) => void;
  onSignal: (callback: (message: { from: string; to: string; type: string; data: any }) => void) => void;
  leaveMatchmaking: () => void;
  onEnd: () => void;
}

const Chat = ({ userId, matchedUserId, sendSignal, onSignal, leaveMatchmaking, onEnd }: ChatProps) => {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [chatDuration, setChatDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [messageText, setMessageText] = useState('');
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const hasSetupConnection = useRef(false);
  const hasReceivedReady = useRef(false);
  const hasSentReady = useRef(false);
  const isInitiator = userId < matchedUserId;

  const {
    peerConnection,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup,
  } = useWebRTC(setConnectionState);

  // Setup WebRTC peer connection
  useEffect(() => {
    if (!matchedUserId || hasSetupConnection.current) return;

    console.log(`[CHAT] Setting up connection. I am ${isInitiator ? 'INITIATOR' : 'RECEIVER'}`);
    hasSetupConnection.current = true;

    const setupConnection = async () => {
      try {
        const pc = createPeerConnection();

        // Handle ICE candidates - MUST be set before creating offer/answer
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('[CHAT] Sending ICE candidate:', event.candidate.candidate?.substring(0, 50));
            sendSignal(matchedUserId, 'ice-candidate', event.candidate.toJSON());
          } else {
            console.log('[CHAT] ICE gathering complete');
          }
        };

        pc.onicegatheringstatechange = () => {
          console.log('[CHAT] ICE gathering state:', pc.iceGatheringState);
        };

        // Create data channel for chat (only initiator creates it)
        if (isInitiator) {
          console.log('[CHAT] Creating data channel as initiator');
          const dc = pc.createDataChannel('chat', {
            ordered: true,
          });
          dc.onopen = () => {
            console.log('[CHAT] Data channel opened (initiator)');
          };
          dc.onclose = () => console.log('[CHAT] Data channel closed (initiator)');
          dc.onerror = (e) => console.error('[CHAT] Data channel error (initiator):', e);
          dc.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
          };
          dataChannelRef.current = dc;
        } else {
          // Receiver waits for data channel
          pc.ondatachannel = (event) => {
            console.log('[CHAT] Data channel received');
            const dc = event.channel;
            dc.onopen = () => {
              console.log('[CHAT] Data channel opened (receiver)');
            };
            dc.onclose = () => console.log('[CHAT] Data channel closed (receiver)');
            dc.onerror = (e) => console.error('[CHAT] Data channel error (receiver):', e);
            dc.onmessage = (event) => {
              const message = JSON.parse(event.data);
              setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
            };
            dataChannelRef.current = dc;
          };
        }

        // Small delay to ensure event handlers are attached
        await new Promise(resolve => setTimeout(resolve, 100));

        // Send ready signal
        if (!hasSentReady.current) {
          hasSentReady.current = true;
          console.log('[CHAT] Sending ready signal');
          sendSignal(matchedUserId, 'ready', {});
        }

        // If initiator and already received ready, start negotiation
        if (isInitiator && hasReceivedReady.current) {
          console.log('[CHAT] Creating offer (already received ready)');
          const offer = await createOffer();
          if (offer) {
            console.log('[CHAT] Sending offer');
            sendSignal(matchedUserId, 'offer', offer);
          }
        }
      } catch (error) {
        console.error('[CHAT] Error setting up connection:', error);
        toast({
          title: "Connection Failed",
          description: "Could not establish connection. Please try again.",
          variant: "destructive",
        });
      }
    };

    setupConnection();
  }, [matchedUserId, isInitiator, sendSignal, createPeerConnection, createOffer, toast]);

  // Handle incoming signals
  useEffect(() => {
    onSignal(async (message) => {
      // Security: Only process signals from our matched user
      if (message.from !== matchedUserId) {
        console.warn('[CHAT] Ignoring signal from unauthorized sender:', message.from);
        return;
      }

      console.log('[CHAT] Handling signal:', message.type);

      try {
        if (message.type === 'ready') {
          hasReceivedReady.current = true;
          console.log('[CHAT] Received ready signal from:', message.from);
          
          // If initiator and connection is setup, create offer
          if (isInitiator && hasSetupConnection.current) {
            // Small delay to ensure peer connection is fully ready
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('[CHAT] Creating offer after ready signal');
            const offer = await createOffer();
            if (offer) {
              console.log('[CHAT] Sending offer');
              sendSignal(matchedUserId, 'offer', offer);
            }
          }
        } else if (message.type === 'offer') {
          console.log('[CHAT] Received offer, creating answer');
          await setRemoteDescription(message.data);
          const answer = await createAnswer();
          if (answer) {
            console.log('[CHAT] Sending answer');
            sendSignal(message.from, 'answer', answer);
          }
        } else if (message.type === 'answer') {
          console.log('[CHAT] Received answer, setting remote description');
          await setRemoteDescription(message.data);
        } else if (message.type === 'ice-candidate') {
          console.log('[CHAT] Adding ICE candidate');
          await addIceCandidate(message.data);
        }
      } catch (error) {
        console.error('[CHAT] Error handling signal:', message.type, error);
      }
    });
  }, [onSignal, isInitiator, matchedUserId, sendSignal, createOffer, createAnswer, setRemoteDescription, addIceCandidate]);

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        setChatDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const handleSkip = () => {
    toast({
      title: 'Searching for next person...',
    });
    cleanup();
    leaveMatchmaking();
    onEnd();
  };

  const handleEndCall = () => {
    cleanup();
    leaveMatchmaking();
    dataChannelRef.current?.close();
    onEnd();
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || dataChannelRef.current?.readyState !== 'open') return;

    try {
      // Moderate content
      const moderationResponse = await supabase.functions.invoke('moderate-content', {
        body: { text: messageText }
      });

      if (moderationResponse.error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      const { moderated, moderatedText, reason } = moderationResponse.data;
      if (reason === 'phone_number') {
        toast({
          title: "Phone Number Blocked",
          description: "Sharing phone numbers is not allowed",
          variant: "destructive",
        });
        return;
      }

      if (moderated && reason === 'adult_content') {
        toast({
          title: "Content Filtered",
          description: "Adult content has been censored",
        });
      }

      const message = { text: moderatedText };
      dataChannelRef.current.send(JSON.stringify(message));
      setChatMessages((prev) => [...prev, { from: 'you', text: moderatedText }]);
      setMessageText('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="px-6 py-4 bg-card/50 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold">Chat Room</h2>
              <p className="text-sm text-muted-foreground">
                {connectionState === 'connected' ? (
                  <span className="text-green-500">● Connected - {formatDuration(chatDuration)}</span>
                ) : (
                  'Connecting...'
                )}
              </p>
            </div>
            <ConnectionQualityIndicator 
              peerConnection={peerConnection.current} 
              isConnected={connectionState === 'connected'} 
            />
          </div>
          <div className="flex gap-2">
            <ReportDialog reportedUserId={matchedUserId} />
            <Button
              onClick={handleSkip}
              variant="outline"
              size="sm"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Next
            </Button>
            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="sm"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-card rounded-2xl shadow-card">
          {connectionState !== 'connected' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse-glow w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Establishing connection...</p>
              </div>
            </div>
          )}
          
          {chatMessages.length === 0 && connectionState === 'connected' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No messages yet. Say hi! 👋
              </p>
            </div>
          )}
          
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.from === 'you' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm font-medium mb-1 opacity-70">
                  {msg.from === 'you' ? 'You' : 'Stranger'}
                </p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              disabled={connectionState !== 'connected'}
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <Button 
              onClick={handleSendMessage} 
              size="lg"
              disabled={connectionState !== 'connected' || !messageText.trim()}
              className="px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
