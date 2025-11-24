import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { supabase } from '@/integrations/supabase/client';

interface VideoChatProps {
  currentUserId: string;
  matchedUserId: string;
  onSignal: (callback: (message: any) => void) => void;
  sendSignal: (to: string, type: string, data: any) => void;
  onLeave: () => void;
  onEndCall: () => void;
}

const VideoChat = ({
  currentUserId,
  matchedUserId,
  onSignal,
  sendSignal,
  onLeave,
  onEndCall
}: VideoChatProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const hasInitiatedOffer = useRef(false);

  const {
    peerConnection,
    localStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    addLocalStream,
    cleanup
  } = useWebRTC(
    (state) => setConnectionStatus(state),
    (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    }
  );

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const pc = createPeerConnection();
        const stream = await addLocalStream();
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal(matchedUserId, 'ice-candidate', event.candidate);
          }
        };

        const isInitiator = currentUserId < matchedUserId;
        
        if (isInitiator && !hasInitiatedOffer.current) {
          hasInitiatedOffer.current = true;
          sendSignal(matchedUserId, 'ready', {});
          setTimeout(async () => {
            const offer = await createOffer();
            sendSignal(matchedUserId, 'offer', offer);
          }, 1000);
        } else {
          sendSignal(matchedUserId, 'ready', {});
        }
      } catch (error) {
        console.error('Error initializing call:', error);
      }
    };

    initializeCall();

    return () => {
      cleanup();
    };
  }, [currentUserId, matchedUserId]);

  useEffect(() => {
    onSignal(async (message) => {
      if (message.from !== matchedUserId) return;

      try {
        switch (message.type) {
          case 'ready':
            console.log('Peer is ready');
            break;

          case 'offer':
            await setRemoteDescription(message.data);
            const answer = await createAnswer();
            sendSignal(matchedUserId, 'answer', answer);
            break;

          case 'answer':
            await setRemoteDescription(message.data);
            break;

          case 'ice-candidate':
            await addIceCandidate(message.data);
            break;
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });
  }, [matchedUserId, onSignal, sendSignal, setRemoteDescription, createAnswer, addIceCandidate]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleSkip = async () => {
    cleanup();
    onLeave();
  };

  const handleEndCall = async () => {
    cleanup();
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {connectionStatus === 'connected' ? `Connected - ${formatDuration(duration)}` : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSkip}>
            Next
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEndCall}>
            End Call
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />
        
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
        />
      </div>

      <div className="flex items-center justify-center gap-4 p-6 border-t bg-card">
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
        
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-14 h-14"
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
