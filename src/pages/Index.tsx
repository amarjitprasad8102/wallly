import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap, LogOut, UserCheck, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import VideoChat from '@/components/VideoChat';
import WaitingScreen from '@/components/WaitingScreen';
import { useMatch } from '@/hooks/useMatch';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ unique_id: string } | null>(null);
  const [appState, setAppState] = useState<'home' | 'waiting' | 'chatting'>('home');
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectId, setConnectId] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { isSearching, matchedUserId, joinMatchmaking, connectDirectly, leaveMatchmaking, sendSignal, onSignal } = useMatch(user?.id || '');
  const {
    pendingRequests,
    acceptedRequest,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    clearAcceptedRequest,
  } = useConnectionRequests(user?.id);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      navigate('/');
    } else {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    if (isSearching && !matchedUserId) {
      setAppState('waiting');
    } else if (matchedUserId) {
      setAppState('chatting');
    }
  }, [isSearching, matchedUserId]);

  const handleStartChat = () => {
    joinMatchmaking();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out');
        setIsSigningOut(false);
        return;
      }

      // Clear local state
      setUser(null);
      setUserProfile(null);
      setAppState('home');
      
      // Navigate to auth page
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast.error('An error occurred during sign out');
      setIsSigningOut(false);
    }
  };

  const handleEndChat = () => {
    leaveMatchmaking();
    setAppState('home');
  };

  const handleConnectById = async () => {
    if (!connectId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    if (connectId.trim() === userProfile?.unique_id) {
      toast.error('You cannot connect to yourself');
      return;
    }

    // Fetch user by unique_id
    const { data: targetUser, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('unique_id', connectId.trim())
      .maybeSingle();

    if (error || !targetUser) {
      toast.error('No user found with that ID');
      return;
    }

    // Send connection request
    const { error: requestError } = await sendConnectionRequest(targetUser.id);
    
    if (requestError) {
      toast.error(requestError);
      return;
    }

    toast.success('Connection request sent!');
    setConnectDialogOpen(false);
    setConnectId('');
  };

  const handleConnectDialogOpen = () => {
    setConnectDialogOpen(true);
  };

  // Handle accepted connection request (when OUR sent request is accepted)
  useEffect(() => {
    if (acceptedRequest) {
      console.log('Our request was accepted by:', acceptedRequest.to_user_id);
      // When our request is accepted, we are from_user_id, they are to_user_id
      // We should connect to them (to_user_id)
      connectDirectly(acceptedRequest.to_user_id);
      setAppState('chatting');
      clearAcceptedRequest();
    }
  }, [acceptedRequest, connectDirectly, clearAcceptedRequest]);

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    const { error, fromUserId: connectedUserId } = await acceptConnectionRequest(requestId, fromUserId);
    if (!error && connectedUserId) {
      console.log('We accepted request from:', connectedUserId);
      // Connect directly to the user who sent the request
      connectDirectly(connectedUserId);
      setAppState('chatting');
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (appState === 'chatting' && matchedUserId) {
    return (
      <VideoChat
        currentUserId={user.id}
        matchedUserId={matchedUserId}
        sendSignal={sendSignal}
        onSignal={onSignal}
        onLeave={handleEndChat}
        onEndCall={handleEndChat}
      />
    );
  }

  if (appState === 'waiting') {
    return <WaitingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header with User Info - Mobile Optimized */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-border">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Breadcrumbs - Hidden on mobile */}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm">
              <p className="text-muted-foreground text-xs">Your ID</p>
              <p className="font-mono font-bold text-primary text-sm sm:text-lg">{userProfile.unique_id}</p>
            </div>
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => navigate('/connections')} className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Connections
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              disabled={isSigningOut}
              className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
            >
              <LogOut className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isSigningOut ? 'animate-spin' : ''}`} />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Connection Requests - Mobile Optimized */}
      {pendingRequests.length > 0 && (
        <div className="px-3 sm:px-4 py-3 sm:py-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Connection Requests</h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <p className="font-medium text-sm sm:text-base">
                      User <span className="font-mono text-primary">{request.from_profile?.unique_id}</span> wants
                      to connect
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id, request.from_user_id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectConnectionRequest(request.id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Mobile Optimized */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Logo/Icon */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse-glow"></div>
              <div className="relative bg-gradient-primary p-4 sm:p-6 rounded-full shadow-glow">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" aria-label="Chat icon" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 gradient-text">
            Random Video Chat
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            Connect face-to-face with strangers worldwide through instant video chat. Start conversations, make
            friends, and explore new perspectives.
          </p>

          {/* CTA Buttons - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-glow w-full sm:w-auto touch-manipulation"
              aria-label="Start video chat"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
              Start Video Chat
            </Button>

            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:scale-105 transition-all w-full sm:w-auto touch-manipulation"
                  aria-label="Connect by ID"
                  onClick={handleConnectDialogOpen}
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  Connect by ID
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect by User ID</DialogTitle>
                  <DialogDescription>
                    Enter the unique ID of the user you want to connect with. They will receive a notification.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user-id">User ID</Label>
                    <Input
                      id="user-id"
                      placeholder="Enter 10-digit user ID"
                      value={connectId}
                      onChange={(e) => setConnectId(e.target.value)}
                      maxLength={10}
                      className="text-base touch-manipulation"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your ID: <span className="font-mono font-semibold">{userProfile?.unique_id}</span>
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleConnectById} className="w-full sm:w-auto">Send Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Features - Responsive Grid */}
          <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 text-left">
            <div
              className="bg-card rounded-xl p-4 sm:p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-label="Users icon" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Random Matching</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Instantly connect with random people from around the world
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-4 sm:p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="bg-accent/10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" aria-label="Lightning icon" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Instant peer-to-peer video with minimal latency for smooth conversations
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-4 sm:p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up sm:col-span-2 md:col-span-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="bg-destructive/10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" aria-label="Shield icon" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Safe & Private</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Secure connections. No data stored. Your privacy is our priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Mobile Optimized */}
      <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border">
        <p className="px-4">
          By using this service, you agree to be respectful and follow community guidelines.
        </p>
        <Button
          variant="link"
          onClick={() => navigate('/privacy')}
          className="text-xs text-muted-foreground hover:text-foreground h-auto py-1"
        >
          Privacy Policy
        </Button>
      </footer>
    </div>
  );
};

export default Index;
