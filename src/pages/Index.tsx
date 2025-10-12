import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Users, Shield, Zap } from 'lucide-react';
import VideoChat from '@/components/VideoChat';
import WaitingScreen from '@/components/WaitingScreen';
import { useVideoMatch } from '@/hooks/useVideoMatch';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [appState, setAppState] = useState<'home' | 'waiting' | 'chatting'>('home');
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const { isSearching, matchedUserId, joinMatchmaking, leaveMatchmaking } = useVideoMatch(userId);

  useEffect(() => {
    if (isSearching && !matchedUserId) {
      setAppState('waiting');
    } else if (matchedUserId) {
      setAppState('chatting');
    }
  }, [isSearching, matchedUserId]);

  const handleStartChat = async () => {
    // Request camera/microphone permissions before starting
    try {
      console.log('Requesting media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      console.log('Media permissions granted');
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setHasMediaAccess(true);
      joinMatchmaking();
    } catch (error) {
      console.error('Media access denied:', error);
      toast({
        title: "Camera/Microphone Required",
        description: "Please allow access to your camera and microphone to use video chat.",
        variant: "destructive",
      });
    }
  };

  const handleEndChat = () => {
    leaveMatchmaking();
    setHasMediaAccess(false);
    setAppState('home');
  };

  if (appState === 'chatting' && matchedUserId && hasMediaAccess) {
    return <VideoChat userId={userId} onEnd={handleEndChat} />;
  }

  if (appState === 'waiting') {
    return <WaitingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse-glow"></div>
              <div className="relative bg-gradient-primary p-6 rounded-full shadow-glow">
                <Video className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Random Video Chat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with strangers worldwide through instant video calls. Start conversations, make
            friends, and explore new perspectives.
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleStartChat}
            size="lg"
            className="text-lg px-8 py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-glow"
          >
            <Video className="w-6 h-6 mr-2" />
            Start Video Chat
          </Button>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Random Matching</h3>
              <p className="text-muted-foreground">
                Instantly connect with random people from around the world
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                HD video quality with minimal latency for smooth conversations
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="bg-destructive/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Anonymous</h3>
              <p className="text-muted-foreground">
                No registration required. Skip or end calls anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>
          By using this service, you agree to be respectful and follow community guidelines.
        </p>
      </footer>
    </div>
  );
};

export default Index;
