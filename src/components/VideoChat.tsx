import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, SkipForward } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';

interface VideoChatProps {
  userId: string;
  matchedUserId: string;
  sendSignal: (to: string, type: 'offer' | 'answer' | 'ice-candidate' | 'ready', data: any) => void;
  onSignal: (callback: (message: { from: string; to: string; type: string; data: any }) => void) => void;
  leaveMatchmaking: () => void;
  onEnd: () => void;
}

const VideoChat = ({ userId, matchedUserId, sendSignal, onSignal, leaveMatchmaking, onEnd }: VideoChatProps) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [messageText, setMessageText] = useState('');
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const hasSetupConnection = useRef(false);
  const hasReceivedReady = useRef(false);
  const hasSentReady = useRef(false);
  const isInitiator = userId < matchedUserId;

  const {
    initializeLocalStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup,
    peerConnection,
  } = useWebRTC(localVideoRef, remoteVideoRef, setConnectionState);

  // Initialize local media stream
  useEffect(() => {
    console.log('Initializing local stream...');
    initializeLocalStream().catch((error) => {
      console.error('Failed to initialize local stream:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Could not access your camera/microphone. Please allow access and try again.",
        variant: "destructive",
      });
      setTimeout(() => onEnd(), 3000);
    });
  }, [initializeLocalStream, toast, onEnd]);

  // Setup WebRTC peer connection
  useEffect(() => {
    if (!matchedUserId || hasSetupConnection.current) return;

    console.log(`Setting up connection. I am ${isInitiator ? 'INITIATOR' : 'RECEIVER'}`);
    hasSetupConnection.current = true;

    const setupConnection = async () => {
      try {
        const pc = createPeerConnection();

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate');
            sendSignal(matchedUserId, 'ice-candidate', event.candidate.toJSON());
          }
        };

        // Create data channel for chat (only initiator creates it)
        if (isInitiator) {
          const dc = pc.createDataChannel('chat');
          dc.onopen = () => console.log('Data channel opened (initiator)');
          dc.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
          };
          dataChannelRef.current = dc;
        } else {
          // Receiver waits for data channel
          pc.ondatachannel = (event) => {
            console.log('Data channel received');
            const dc = event.channel;
            dc.onopen = () => console.log('Data channel opened (receiver)');
            dc.onmessage = (event) => {
              const message = JSON.parse(event.data);
              setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
            };
            dataChannelRef.current = dc;
          };
        }

        // Send ready signal
        if (!hasSentReady.current) {
          hasSentReady.current = true;
          console.log('Sending ready signal');
          sendSignal(matchedUserId, 'ready', {});
        }

        // If initiator and already received ready, start negotiation
        if (isInitiator && hasReceivedReady.current) {
          console.log('Creating offer (already received ready)');
          const offer = await createOffer();
          if (offer) {
            sendSignal(matchedUserId, 'offer', offer);
          }
        }
      } catch (error) {
        console.error('Error setting up connection:', error);
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
      console.log('Handling signal:', message.type);

      if (message.type === 'ready') {
        hasReceivedReady.current = true;
        console.log('Received ready signal');
        
        // If initiator and connection is setup, create offer
        if (isInitiator && hasSetupConnection.current) {
          console.log('Creating offer after ready');
          const offer = await createOffer();
          if (offer) {
            sendSignal(matchedUserId, 'offer', offer);
          }
        }
      } else if (message.type === 'offer') {
        console.log('Received offer');
        await setRemoteDescription(message.data);
        const answer = await createAnswer();
        if (answer) {
          console.log('Sending answer');
          sendSignal(message.from, 'answer', answer);
        }
      } else if (message.type === 'answer') {
        console.log('Received answer');
        await setRemoteDescription(message.data);
      } else if (message.type === 'ice-candidate') {
        await addIceCandidate(message.data);
      }
    });
  }, [onSignal, isInitiator, matchedUserId, sendSignal, createOffer, createAnswer, setRemoteDescription, addIceCandidate]);

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setIsAudioEnabled(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoEnabled(enabled);
  };

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

  const handleSendMessage = () => {
    if (messageText.trim() && dataChannelRef.current?.readyState === 'open') {
      const message = { text: messageText };
      dataChannelRef.current.send(JSON.stringify(message));
      setChatMessages((prev) => [...prev, { from: 'you', text: messageText }]);
      setMessageText('');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <div className="flex-1 flex gap-4 p-4">
        {/* Video Section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Remote Video */}
          <div className="flex-1 relative bg-card rounded-2xl overflow-hidden shadow-card">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {connectionState !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur">
              <div className="text-center">
                <div className="animate-pulse-glow w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Connecting...</p>
              </div>
            </div>
          )}
          {connectionState === 'connected' && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-4 py-2 rounded-lg">
              <span className="text-white font-mono">{formatDuration(callDuration)}</span>
            </div>
          )}
          </div>

          {/* Local Video */}
          <div className="w-full h-48 relative bg-card rounded-2xl overflow-hidden shadow-card">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-lg">
            <span className="text-white text-sm">You</span>
          </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-80 flex flex-col bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Chat</h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.from === 'you' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-input text-sm"
              />
              <Button onClick={handleSendMessage} size="sm">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-card/50 backdrop-blur">
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          <Button
            onClick={handleToggleAudio}
            size="lg"
            variant={isAudioEnabled ? 'secondary' : 'destructive'}
            className="rounded-full w-14 h-14 p-0 transition-all hover:scale-110"
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={handleToggleVideo}
            size="lg"
            variant={isVideoEnabled ? 'secondary' : 'destructive'}
            className="rounded-full w-14 h-14 p-0 transition-all hover:scale-110"
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={handleEndCall}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16 p-0 transition-all hover:scale-110 bg-destructive hover:bg-destructive/90"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>

          <Button
            onClick={handleSkip}
            size="lg"
            variant="secondary"
            className="rounded-full w-14 h-14 p-0 transition-all hover:scale-110"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
