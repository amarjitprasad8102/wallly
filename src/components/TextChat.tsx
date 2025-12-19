import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneOff, SkipForward, Send, Image as ImageIcon, X } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { ScrollArea } from '@/components/ui/scroll-area';
import { soundEffects } from '@/utils/sounds';
import { haptics } from '@/utils/haptics';
import EncryptionBadge from './EncryptionBadge';
import SecureImage from './SecureImage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TextChatProps {
  currentUserId: string;
  matchedUserId: string;
  onSignal: (callback: (message: any) => void) => void;
  sendSignal: (to: string, type: string, data: any) => void;
  onLeave: () => void;
  onEndCall: () => void;
  onOtherUserDisconnected: () => void;
}

interface ChatMessage {
  text?: string;
  imageUrl?: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

const TextChat = ({
  currentUserId,
  matchedUserId,
  onSignal,
  sendSignal,
  onLeave,
  onEndCall,
  onOtherUserDisconnected,
}: TextChatProps) => {
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const hasInitiatedOffer = useRef(false);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const uploadedImagesRef = useRef<string[]>([]);

  const {
    peerConnection,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup
  } = useWebRTC(
    (state) => {
      console.log('[TEXT] Connection state changed:', state);
      setConnectionStatus(state);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log('[TEXT] Connection lost, notifying parent');
        onOtherUserDisconnected();
      }
    }
  );

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('[TEXT] Initializing text chat...');
        const pc = createPeerConnection();
        
        // Set up data channel for text chat
        const isInitiator = currentUserId < matchedUserId;
        if (isInitiator) {
          dataChannel.current = pc.createDataChannel('textchat');
          console.log('[TEXT] Data channel created (initiator)');
          setupDataChannel(dataChannel.current);
        } else {
          pc.ondatachannel = (event) => {
            console.log('[TEXT] Data channel received');
            dataChannel.current = event.channel;
            setupDataChannel(dataChannel.current);
          };
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('[TEXT] Sending ICE candidate');
            sendSignal(matchedUserId, 'ice-candidate', event.candidate);
          }
        };

        if (isInitiator && !hasInitiatedOffer.current) {
          hasInitiatedOffer.current = true;
          sendSignal(matchedUserId, 'ready', {});
          setTimeout(async () => {
            console.log('[TEXT] Creating and sending offer');
            const offer = await createOffer();
            sendSignal(matchedUserId, 'offer', offer);
          }, 1000);
        } else {
          sendSignal(matchedUserId, 'ready', {});
        }
      } catch (error) {
        console.error('[TEXT] Error initializing chat:', error);
      }
    };

    initializeChat();

    return () => {
      console.log('[TEXT] Cleaning up text chat');
      deleteUploadedImages();
      dataChannel.current?.close();
      cleanup();
    };
  }, [currentUserId, matchedUserId]);

  useEffect(() => {
    onSignal(async (message) => {
      if (message.from !== matchedUserId) return;

      try {
        switch (message.type) {
          case 'ready':
            console.log('[TEXT] Peer is ready');
            break;
          case 'offer':
            console.log('[TEXT] Received offer, creating answer');
            await setRemoteDescription(message.data);
            const answer = await createAnswer();
            sendSignal(matchedUserId, 'answer', answer);
            break;
          case 'answer':
            console.log('[TEXT] Received answer');
            await setRemoteDescription(message.data);
            break;
          case 'ice-candidate':
            await addIceCandidate(message.data);
            break;
        }
      } catch (error) {
        console.error('[TEXT] Error handling signal:', error);
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

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => {
      console.log('[TEXT] Data channel opened');
      setIsChannelReady(true);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, { text: data.text, sender: 'them', timestamp: new Date() }]);
          soundEffects.playNotification();
          haptics.light();
        } else if (data.type === 'image') {
          setMessages(prev => [...prev, { imageUrl: data.imageUrl, sender: 'them', timestamp: new Date() }]);
          soundEffects.playNotification();
          haptics.light();
        }
      } catch (error) {
        console.error('[TEXT] Error processing message:', error);
      }
    };

    channel.onclose = () => {
      console.log('[TEXT] Data channel closed');
      setIsChannelReady(false);
    };

    channel.onerror = (error) => {
      console.error('[TEXT] Data channel error:', error);
    };
  };

  const deleteUploadedImages = async () => {
    if (uploadedImagesRef.current.length === 0) return;
    
    try {
      const { error } = await supabase.storage
        .from('chat-images')
        .remove(uploadedImagesRef.current);
      
      if (error) console.error('[TEXT] Error deleting images:', error);
      else console.log('[TEXT] Deleted session images');
    } catch (error) {
      console.error('[TEXT] Error deleting images:', error);
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
    
    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[TEXT] Upload error:', error);
      return null;
    }

    uploadedImagesRef.current.push(data.path);

    // Get signed URL that expires in 1 hour
    const { data: signedData } = await supabase.storage
      .from('chat-images')
      .createSignedUrl(data.path, 3600);

    return signedData?.signedUrl || null;
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !dataChannel.current || dataChannel.current.readyState !== 'open' || !isChannelReady) {
      return;
    }

    try {
      soundEffects.playClick();
      haptics.light();

      if (selectedImage) {
        setIsUploading(true);
        const imageUrl = await uploadImage(selectedImage);
        
        if (imageUrl) {
          dataChannel.current.send(JSON.stringify({ 
            type: 'image', 
            imageUrl: imageUrl 
          }));
          setMessages(prev => [...prev, { imageUrl, sender: 'me', timestamp: new Date() }]);
        } else {
          toast.error('Failed to upload image');
        }
        
        setSelectedImage(null);
        setImagePreview(null);
        setIsUploading(false);
      }

      if (newMessage.trim()) {
        dataChannel.current.send(JSON.stringify({ 
          type: 'message', 
          text: newMessage 
        }));
        setMessages(prev => [...prev, { text: newMessage, sender: 'me', timestamp: new Date() }]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('[TEXT] Error sending message:', error);
      setIsUploading(false);
    }
  };

  const handleSkip = async () => {
    soundEffects.playClick();
    haptics.light();
    await deleteUploadedImages();
    dataChannel.current?.close();
    cleanup();
    onLeave();
  };

  const handleEndCall = async () => {
    soundEffects.playDisconnect();
    haptics.medium();
    await deleteUploadedImages();
    dataChannel.current?.close();
    cleanup();
    onEndCall();
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
            {connectionStatus === 'connected' ? `Text Chat • ${formatDuration(duration)}` : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
          <EncryptionBadge encrypted={isChannelReady} variant="chat" />
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleSkip} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            <SkipForward className="w-4 h-4 mr-1" />
            Next
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEndCall} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            <PhoneOff className="w-4 h-4 mr-1" />
            End
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 max-w-2xl mx-auto">
          {connectionStatus !== 'connected' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-pulse-glow w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Establishing secure connection...</p>
              </div>
            </div>
          )}
          
          {messages.length === 0 && connectionStatus === 'connected' && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground text-center">
                🔒 End-to-end encrypted chat<br/>
                Say hi to start the conversation! 👋
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl overflow-hidden ${
                  msg.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.imageUrl && (
                  <div className="p-1">
                    <SecureImage 
                      src={msg.imageUrl} 
                      alt="Shared image"
                      className="max-w-[300px] max-h-[300px] rounded-xl"
                    />
                  </div>
                )}
                {msg.text && (
                  <p className="px-4 py-2">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 rounded-lg object-cover"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 max-w-2xl mx-auto"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isChannelReady || isUploading}
            className={!isChannelReady ? 'opacity-50' : ''}
            title={!isChannelReady ? 'Waiting for connection...' : 'Send image'}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isChannelReady}
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
  );
};

export default TextChat;
