import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOff, SkipForward, Send, ImagePlus, X, Shield } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface ChatProps {
  userId: string;
  matchedUserId: string;
  sendSignal: (to: string, type: 'offer' | 'answer' | 'ice-candidate' | 'ready', data: any) => void;
  onSignal: (callback: (message: { from: string; to: string; type: string; data: any }) => void) => void;
  leaveMatchmaking: () => void;
  onEnd: () => void;
}

interface UserPremiumStatus {
  is_premium: boolean;
}

const ChatWithImageSupport = ({ userId, matchedUserId, sendSignal, onSignal, leaveMatchmaking, onEnd }: ChatProps) => {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [chatDuration, setChatDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text?: string; imageUrl?: string }>>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [partnerPremiumStatus, setPartnerPremiumStatus] = useState<boolean>(false);
  const [canChat, setCanChat] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSetupConnection = useRef(false);
  const hasReceivedReady = useRef(false);
  const hasSentReady = useRef(false);
  const isInitiator = userId < matchedUserId;
  const { isPremium, loading: premiumLoading } = usePremiumStatus(userId);

  // Check partner's premium status
  useEffect(() => {
    const checkPartnerPremium = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', matchedUserId)
        .single();
      
      const partnerIsPremium = data?.is_premium || false;
      setPartnerPremiumStatus(partnerIsPremium);
      
      // At least one user must be premium to chat
      const chatAllowed = isPremium || partnerIsPremium;
      setCanChat(chatAllowed);
      
      if (!chatAllowed) {
        toast({
          title: "Premium Required",
          description: "At least one user must have premium to send messages",
          variant: "destructive",
        });
      }
    };

    if (matchedUserId && !premiumLoading) {
      checkPartnerPremium();
    }
  }, [matchedUserId, isPremium, premiumLoading, toast]);

  const {
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
            setChatMessages((prev) => [...prev, { from: 'them', ...message }]);
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
              setChatMessages((prev) => [...prev, { from: 'them', ...message }]);
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
      if (message.from !== matchedUserId) {
        console.warn('Ignoring signal from unauthorized sender:', message.from);
        return;
      }

      console.log('Handling signal:', message.type);

      if (message.type === 'ready') {
        hasReceivedReady.current = true;
        console.log('Received ready signal');
        
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
        setChatDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Image sharing is only available for premium users",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Track uploaded image for later deletion
    setUploadedImages(prev => [...prev, fileName]);

    // Generate a signed URL that expires in 24 hours
    const { data: urlData, error: urlError } = await supabase.storage
      .from('chat-images')
      .createSignedUrl(fileName, 86400);

    if (urlError) throw urlError;

    return urlData.signedUrl;
  };

  const deleteUploadedImages = async () => {
    if (uploadedImages.length === 0) return;

    console.log('Deleting uploaded images:', uploadedImages);
    
    const { error } = await supabase.storage
      .from('chat-images')
      .remove(uploadedImages);

    if (error) {
      console.error('Error deleting images:', error);
    } else {
      console.log('Successfully deleted all chat images');
      setUploadedImages([]);
    }
  };

  const handleSkip = async () => {
    toast({ title: 'Searching for next person...' });
    await deleteUploadedImages();
    cleanup();
    leaveMatchmaking();
    onEnd();
  };

  const handleEndCall = async () => {
    await deleteUploadedImages();
    cleanup();
    leaveMatchmaking();
    dataChannelRef.current?.close();
    onEnd();
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || dataChannelRef.current?.readyState !== 'open') return;

    // Check if at least one user is premium
    if (!canChat) {
      toast({
        title: "Premium Required",
        description: "At least one user must have premium to send messages",
        variant: "destructive",
      });
      return;
    }

    // Check if trying to send image and current user is not premium
    if (selectedImage && !isPremium) {
      toast({
        title: "Premium Required",
        description: "Only premium users can send images",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const message: { text?: string; imageUrl?: string } = {};
      if (messageText.trim()) message.text = messageText;
      if (imageUrl) message.imageUrl = imageUrl;

      dataChannelRef.current.send(JSON.stringify(message));
      setChatMessages((prev) => [...prev, { from: 'you', ...message }]);
      
      setMessageText('');
      setSelectedImage(null);
      setImagePreview(null);
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
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
            <div className="flex gap-2">
              <Button onClick={handleSkip} variant="outline" size="sm">
                <SkipForward className="w-4 h-4 mr-2" />
                Next
              </Button>
              <Button onClick={handleEndCall} variant="destructive" size="sm">
                <PhoneOff className="w-4 h-4 mr-2" />
                End Chat
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>End-to-end encrypted • No chat data stored • Images auto-deleted after chat</span>
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
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Shared" className="max-w-full rounded-lg mb-2" />
                )}
                {msg.text && <p>{msg.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          {imagePreview && (
            <div className="relative inline-block mb-2">
              <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (!isPremium) {
                  toast({
                    title: "Premium Feature",
                    description: "Image sharing is only available for premium users",
                    variant: "destructive",
                  });
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={premiumLoading || connectionState !== 'connected'}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={canChat ? "Type a message..." : "Premium required to chat"}
              disabled={connectionState !== 'connected' || !canChat}
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <Button 
              onClick={handleSendMessage} 
              size="lg"
              disabled={connectionState !== 'connected' || (!messageText.trim() && !selectedImage) || !canChat}
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

export default ChatWithImageSupport;
