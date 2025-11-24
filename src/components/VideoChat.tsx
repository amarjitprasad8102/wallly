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
    (state) => {
      console.log('Connection state changed:', state);
      setConnectionStatus(state);
    },
    (stream) => {
      console.log('Remote stream received:', stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        console.log('Remote video srcObject set');
      }
    }
  );

  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log('Initializing call...');
        const pc = createPeerConnection();
        console.log('Peer connection created');
        
        const stream = await addLocalStream();
        console.log('Local stream obtained:', stream);
        
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
          console.log('Local video srcObject set');
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate');
            sendSignal(matchedUserId, 'ice-candidate', event.candidate);
          }
        };

        const isInitiator = currentUserId < matchedUserId;
        console.log('Is initiator:', isInitiator);
        
        if (isInitiator && !hasInitiatedOffer.current) {
          hasInitiatedOffer.current = true;
          sendSignal(matchedUserId, 'ready', {});
          setTimeout(async () => {
            console.log('Creating and sending offer');
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
      console.log('Cleaning up video chat');
      cleanup();
    };
  }, [currentUserId, matchedUserId]);

  useEffect(() => {
    onSignal(async (message) => {
      console.log('Received signal:', message.type, 'from:', message.from);
      if (message.from !== matchedUserId) return;

      try {
        switch (message.type) {
          case 'ready':
            console.log('Peer is ready');
            break;

          case 'offer':
            console.log('Received offer, creating answer');
            await setRemoteDescription(message.data);
            const answer = await createAnswer();
            sendSignal(matchedUserId, 'answer', answer);
            console.log('Answer sent');
            break;

          case 'answer':
            console.log('Received answer');
            await setRemoteDescription(message.data);
            break;

          case 'ice-candidate':
            console.log('Received ICE candidate');
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
    if (localStream?.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('Video toggled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream?.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('Audio toggled:', audioTrack.enabled);
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
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-xs sm:text-sm font-medium">
            {connectionStatus === 'connected' ? `${formatDuration(duration)}` : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleSkip} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            Next
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEndCall} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            End
          </Button>
        </div>
      </div>

      {/* Video Grid - Responsive Layout */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-2 p-2 overflow-hidden">
        {/* Remote Video */}
        <div className="relative flex-1 md:col-span-1 md:row-span-2 bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)' }}
          />
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            User 2
          </div>
        </div>
        
        {/* Local Video */}
        <div className="relative flex-1 md:col-span-1 md:row-span-2 bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0) scaleX(-1)' }}
          />
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 p-4 border-t bg-card safe-bottom">
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation"
          aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
        </Button>
        
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation"
          aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation"
          aria-label="End call"
        >
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
