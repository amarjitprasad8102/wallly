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
      } catch (error) {
        console.error('Failed to initialize local stream:', error);
        toast({
          title: "Connection Failed",
          description: "Could not access camera/microphone. Please refresh and allow access.",
          variant: "destructive",
        });
        // Go back to home after error
        setTimeout(() => onEnd(), 3000);
      }
    };
    init();
  }, [initializeLocalStream, toast, onEnd]);

  useEffect(() => {
    if (matchedUserId && peerConnection === null) {
      const initiator = userId > matchedUserId;
      setIsInitiator(initiator);
      console.log('Match found:', matchedUserId, 'Initiator:', initiator);

      const setupConnection = async () => {
        try {
          const pc = createPeerConnection();

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('Sending ICE candidate');
              sendSignal(matchedUserId, 'ice-candidate', event.candidate);
            }
          };

          if (initiator) {
            console.log('Creating offer as initiator');
            const offer = await createOffer();
            if (offer) {
              console.log('Sending offer');
              sendSignal(matchedUserId, 'offer', offer);
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
  }, [matchedUserId, userId, createPeerConnection, createOffer, sendSignal, peerConnection, toast]);

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
    onEnd();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
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
        <div className="w-full lg:w-80 h-60 lg:h-auto relative bg-card rounded-2xl overflow-hidden shadow-card">
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
