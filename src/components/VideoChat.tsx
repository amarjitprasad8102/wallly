import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send, MessageCircle } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { soundEffects } from '@/utils/sounds';
import { haptics } from '@/utils/haptics';

interface VideoChatProps {
  currentUserId: string;
  matchedUserId: string;
  onSignal: (callback: (message: any) => void) => void;
  sendSignal: (to: string, type: string, data: any) => void;
  onLeave: () => void;
  onEndCall: () => void;
  onOtherUserDisconnected: () => void;
}

const VideoChat = ({
  currentUserId,
  matchedUserId,
  onSignal,
  sendSignal,
  onLeave,
  onEndCall,
  onOtherUserDisconnected,
}: VideoChatProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'me' | 'them'; timestamp: Date }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const hasInitiatedOffer = useRef(false);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
      console.log('[VIDEO] Connection state changed:', state);
      setConnectionStatus(state);
      
      // Detect disconnection
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log('[VIDEO] Connection lost, notifying parent');
        onOtherUserDisconnected();
      }
    },
    (stream) => {
      console.log('[VIDEO] Remote stream received:', stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        console.log('[VIDEO] Remote video srcObject set');
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

        // Set up data channel for text chat
        const isInitiator = currentUserId < matchedUserId;
        if (isInitiator) {
          dataChannel.current = pc.createDataChannel('chat');
          console.log('Data channel created (initiator)');
          setupDataChannel(dataChannel.current);
        } else {
          pc.ondatachannel = (event) => {
            console.log('Data channel received');
            dataChannel.current = event.channel;
            setupDataChannel(dataChannel.current);
          };
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate');
            sendSignal(matchedUserId, 'ice-candidate', event.candidate);
          }
        };

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
      dataChannel.current?.close();
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
    console.log('[VIDEO] Skipping to next user, cleaning up...');
    soundEffects.playClick();
    haptics.light();
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    cleanup();
    onLeave();
  };

  const handleEndCall = async () => {
    console.log('[VIDEO] Ending call, cleaning up...');
    soundEffects.playDisconnect();
    haptics.medium();
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    cleanup();
    onEndCall();
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = JSON.parse(event.data);
      if (data.type === 'text') {
        setMessages(prev => [...prev, { text: data.text, sender: 'them', timestamp: new Date() }]);
        // Play notification sound and haptic for incoming messages
        soundEffects.playNotification();
        haptics.light();
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !dataChannel.current || dataChannel.current.readyState !== 'open') {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasChannel: !!dataChannel.current, 
        channelState: dataChannel.current?.readyState 
      });
      return;
    }

    soundEffects.playClick();
    haptics.light();

    const message = { type: 'text', text: newMessage };
    dataChannel.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, { text: newMessage, sender: 'me', timestamp: new Date() }]);
    setNewMessage('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Minimal Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-sm text-white font-medium">
            {connectionStatus === 'connected' ? formatDuration(duration) : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Remote Video - Takes main area */}
        <div className="flex-1 relative bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-sm text-white font-medium">
            Stranger
          </div>
        </div>
        
        {/* Local Video - Picture in Picture style */}
        <div className="absolute bottom-24 right-4 w-48 h-36 md:w-64 md:h-48 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
            You
          </div>
        </div>

        {/* Chat Panel - Desktop */}
        {!isMobile && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Chat</h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 px-2">
                        {msg.sender === 'me' ? 'You' : 'Stranger'}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.sender === 'me'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Video Toggle */}
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          {/* Next Button - Prominent */}
          <Button
            variant="default"
            size="lg"
            onClick={handleSkip}
            className="px-8 h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Next
          </Button>

          {/* Stop Button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="px-8 h-14 text-lg font-semibold"
          >
            Stop
          </Button>

          {/* Chat Button - Mobile Only */}
          {isMobile && (
            <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-14 h-14 relative"
                >
                  <MessageCircle className="w-6 h-6" />
                  {messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      {messages.length}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh] bg-gray-900">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-semibold text-white">Chat</h3>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 px-2">
                              {msg.sender === 'me' ? 'You' : 'Stranger'}
                            </span>
                            <div
                              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                msg.sender === 'me'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-800 text-gray-200'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-gray-800">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
