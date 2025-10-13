import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, SkipForward } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useVideoMatch } from '@/hooks/useVideoMatch';
import { useToast } from '@/hooks/use-toast';

interface VideoChatProps {
  userId: string;
  onEnd: () => void;
}

const VideoChat = ({ userId, onEnd }: VideoChatProps) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [callDuration, setCallDuration] = useState(0);
  const [isInitiator, setIsInitiator] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [messageText, setMessageText] = useState('');
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

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

  const { matchedUserId, sendSignal, onSignal, leaveMatchmaking } = useVideoMatch(userId);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeLocalStream();
        setLocalStreamReady(true);
        console.log('Local stream initialized successfully');
      } catch (error) {
        console.error('Failed to initialize local stream:', error);
        toast({
          title: "Connection Failed",
          description: "Could not access camera/microphone. Please refresh and allow access.",
          variant: "destructive",
        });
        setTimeout(() => onEnd(), 3000);
      }
    };
    init();
  }, [initializeLocalStream, toast, onEnd]);

  useEffect(() => {
    if (matchedUserId && peerConnection === null && localStreamReady) {
      const initiator = userId > matchedUserId;
      setIsInitiator(initiator);
      console.log('Match found:', matchedUserId, 'Initiator:', initiator, 'Local stream ready:', localStreamReady);

      const setupConnection = async () => {
        try {
          const pc = createPeerConnection();

          // Create data channel for chat
          const dataChannel = pc.createDataChannel('chat');
          dataChannelRef.current = dataChannel;

          dataChannel.onopen = () => {
            console.log('Data channel opened');
          };

          dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
          };

          // Handle incoming data channel
          pc.ondatachannel = (event) => {
            const channel = event.channel;
            dataChannelRef.current = channel;

            channel.onmessage = (e) => {
              const message = JSON.parse(e.data);
              setChatMessages((prev) => [...prev, { from: 'them', text: message.text }]);
            };
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('Sending ICE candidate');
              sendSignal(matchedUserId, 'ice-candidate', event.candidate.toJSON());
            } else {
              console.log('ICE gathering complete');
            }
          };

          // Renegotiate whenever tracks are added (e.g., if local media initialized later)
          pc.onnegotiationneeded = async () => {
            try {
              if (initiator) {
                console.log('Negotiation needed - creating/sending offer');
                const offer = await createOffer();
                if (offer) {
                  sendSignal(matchedUserId, 'offer', offer);
                }
              } else {
                console.log('Negotiation needed - non-initiator will wait for offer');
              }
            } catch (err) {
              console.error('Negotiation error:', err);
            }
          };

          // If already initiator and local tracks are present, send initial offer
          if (initiator) {
            try {
              console.log('Creating initial offer as initiator');
              const offer = await createOffer();
              if (offer) {
                console.log('Sending initial offer');
                sendSignal(matchedUserId, 'offer', offer);
              }
            } catch (err) {
              console.error('Initial offer error:', err);
            }
          } else {
            console.log('Waiting for offer as receiver');
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
    }
  }, [matchedUserId, userId, createPeerConnection, createOffer, sendSignal, peerConnection, toast, localStreamReady]);

  useEffect(() => {
    onSignal(async (message) => {
      console.log('Received signal:', message.type);

      if (message.type === 'offer') {
        await setRemoteDescription(message.data);
        const answer = await createAnswer();
        if (answer) {
          sendSignal(message.from, 'answer', answer);
        }
      } else if (message.type === 'answer') {
        await setRemoteDescription(message.data);
      } else if (message.type === 'ice-candidate') {
        await addIceCandidate(message.data);
      }
    });
  }, [onSignal, setRemoteDescription, createAnswer, sendSignal, addIceCandidate]);

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
