import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send, MessageCircle, Image as ImageIcon, X, Crown } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { soundEffects } from '@/utils/sounds';
import { haptics } from '@/utils/haptics';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

import SecureImage from './SecureImage';
import TypingIndicator from './TypingIndicator';
import MessageStatus from './MessageStatus';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import VirtualBackgrounds, { BackgroundOption } from './VirtualBackgrounds';

interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: 'me' | 'them';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface VideoChatProps {
  currentUserId: string;
  matchedUserId: string;
  onSignal: (callback: (message: any) => void) => void;
  sendSignal: (to: string, type: string, data: any) => void;
  onLeave: () => void;
  onEndCall: () => void;
  onOtherUserDisconnected: () => void;
  isPremium?: boolean;
}

const VideoChat = ({
  currentUserId,
  matchedUserId,
  onSignal,
  sendSignal,
  onLeave,
  onEndCall,
  onOtherUserDisconnected,
  isPremium = false,
}: VideoChatProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const hasInitiatedOffer = useRef(false);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState<BackgroundOption | null>(null);

  // Get background style for local video overlay
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!virtualBackground) return {};
    
    if (virtualBackground.type === 'blur') {
      return {
        backdropFilter: `blur(${virtualBackground.value}px)`,
        WebkitBackdropFilter: `blur(${virtualBackground.value}px)`,
      };
    }
    
    if (virtualBackground.type === 'color') {
      return {
        background: virtualBackground.value,
        opacity: 0.85,
        mixBlendMode: 'multiply' as const,
      };
    }
    
    if (virtualBackground.type === 'image') {
      return {
        backgroundImage: `url(${virtualBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.9,
        mixBlendMode: 'multiply' as const,
      };
    }
    
    return {};
  };

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
      deleteUploadedImages();
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
    await deleteUploadedImages();
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
    await deleteUploadedImages();
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
      setIsChannelReady(true);
    };

    channel.onmessage = (event) => {
      console.log('Data channel message received');
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setMessages(prev => [...prev, { id: msgId, text: data.text, sender: 'them', timestamp: new Date(), status: 'delivered' }]);
          soundEffects.playNotification();
          haptics.light();
          if (isPremium && dataChannel.current?.readyState === 'open') {
            dataChannel.current.send(JSON.stringify({ type: 'read_receipt', msgId }));
          }
        } else if (data.type === 'image') {
          const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setMessages(prev => [...prev, { id: msgId, imageUrl: data.imageUrl, sender: 'them', timestamp: new Date(), status: 'delivered' }]);
          soundEffects.playNotification();
          haptics.light();
          if (isPremium && dataChannel.current?.readyState === 'open') {
            dataChannel.current.send(JSON.stringify({ type: 'read_receipt', msgId }));
          }
        } else if (data.type === 'typing') {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        } else if (data.type === 'stop_typing') {
          setIsTyping(false);
        } else if (data.type === 'read_receipt') {
          setMessages(prev => prev.map(m => 
            m.id === data.msgId ? { ...m, status: 'read' } : m
          ));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      setIsChannelReady(false);
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  };

  const uploadedImagesRef = useRef<string[]>([]);

  const deleteUploadedImages = async () => {
    if (uploadedImagesRef.current.length === 0) return;
    try {
      await supabase.storage.from('chat-images').remove(uploadedImagesRef.current);
    } catch (error) {
      console.error('[VIDEO] Error deleting images:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const timestamp = Date.now();
    const fileName = `${currentUserId}/${timestamp}_${file.name}`;
    const { data, error } = await supabase.storage.from('chat-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) return null;
    uploadedImagesRef.current.push(data.path);
    const { data: signedData } = await supabase.storage.from('chat-images').createSignedUrl(data.path, 3600);
    return signedData?.signedUrl || null;
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !dataChannel.current || dataChannel.current.readyState !== 'open' || !isChannelReady) {
      return;
    }

    try {
      soundEffects.playClick();
      haptics.light();

      if (isPremium && dataChannel.current?.readyState === 'open') {
        dataChannel.current.send(JSON.stringify({ type: 'stop_typing' }));
      }

      if (selectedImage) {
        setIsUploading(true);
        const imageUrl = await uploadImage(selectedImage);
        if (imageUrl) {
          const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          dataChannel.current.send(JSON.stringify({ type: 'image', imageUrl, msgId }));
          setMessages(prev => [...prev, { id: msgId, imageUrl, sender: 'me', timestamp: new Date(), status: 'sent' }]);
        } else {
          toast.error('Failed to upload image');
        }
        setSelectedImage(null);
        setImagePreview(null);
        setIsUploading(false);
      }

      if (newMessage.trim()) {
        const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        dataChannel.current.send(JSON.stringify({ type: 'message', text: newMessage, msgId }));
        setMessages(prev => [...prev, { id: msgId, text: newMessage, sender: 'me', timestamp: new Date(), status: 'sent' }]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploading(false);
    }
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

      {/* Main Content Area - Mobile: stacked, Desktop: resizable panels */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile ? (
          <>
            {/* Videos Section - Mobile */}
            <div className="flex-1 flex flex-col gap-2 p-2">
              {/* Remote Video */}
              <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'translateZ(0) scaleX(-1)' }}
                />
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  User 2
                </div>
              </div>
              
              {/* Local Video */}
              <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'translateZ(0) scaleX(-1)' }}
                />
                {/* Virtual Background Overlay */}
                {virtualBackground && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={getBackgroundStyle()}
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                  You
                  {isPremium && virtualBackground && (
                    <span className="text-amber-400">✨</span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <ResizablePanelGroup direction="vertical" className="flex-1">
            {/* Videos Section - Desktop */}
            <ResizablePanel defaultSize={65} minSize={40}>
              <div className="h-full flex gap-2 p-2">
                {/* Remote Video */}
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'translateZ(0) scaleX(-1)' }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    User 2
                  </div>
                </div>
                
                {/* Local Video */}
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'translateZ(0) scaleX(-1)' }}
                  />
                  {/* Virtual Background Overlay */}
                  {virtualBackground && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={getBackgroundStyle()}
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    You
                    {isPremium && virtualBackground && (
                      <span className="text-amber-400">✨</span>
                    )}
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Chat Section - Desktop */}
            <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
              <div className="h-full bg-card flex flex-col">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm">Chat</h3>
                </div>
                
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg overflow-hidden ${
                            msg.sender === 'me'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.imageUrl && (
                            <div className="p-1">
                              <SecureImage src={msg.imageUrl} alt="Shared image" className="max-w-[200px] max-h-[200px] rounded-lg" />
                            </div>
                          )}
                          {msg.text && <p className="px-3 py-2 text-sm">{msg.text}</p>}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {imagePreview && (
                  <div className="px-3 py-2 border-t bg-muted/50">
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover" />
                      <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 w-5 h-5" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={!isChannelReady || isUploading}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!isChannelReady || (!newMessage.trim() && !selectedImage) || isUploading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
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

        {/* Virtual Backgrounds - Premium Only */}
        <VirtualBackgrounds 
          isPremium={isPremium}
          currentBackground={virtualBackground}
          onBackgroundChange={setVirtualBackground}
        />
        
        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation"
          aria-label="End call"
        >
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        {/* Chat Button - Mobile Only */}
        {isMobile && (
          <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation relative"
                aria-label="Open chat"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {messages.length}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Chat</h3>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg overflow-hidden ${
                            msg.sender === 'me'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.imageUrl && (
                            <div className="p-1">
                              <SecureImage src={msg.imageUrl} alt="Shared image" className="max-w-[200px] max-h-[200px] rounded-lg" />
                            </div>
                          )}
                          {msg.text && <p className="px-3 py-2 text-sm">{msg.text}</p>}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {imagePreview && (
                  <div className="px-4 py-2 border-t bg-muted/50">
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover" />
                      <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 w-5 h-5" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={!isChannelReady || isUploading}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!isChannelReady || (!newMessage.trim() && !selectedImage) || isUploading}
                    >
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
  );
};

export default VideoChat;
