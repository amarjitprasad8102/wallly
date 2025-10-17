import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap, LogOut, UserCheck } from 'lucide-react';
import Chat from '@/components/ChatWithImageSupport';
import WaitingScreen from '@/components/WaitingScreen';
import { useMatch } from '@/hooks/useMatch';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
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
  const { isSearching, matchedUserId, joinMatchmaking, connectDirectly, leaveMatchmaking, sendSignal, onSignal } = useMatch(user?.id || '');
  const { isPremium, loading: premiumLoading } = usePremiumStatus(user?.id);
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
    try {
      // Clear local state first
      setUser(null);
      setUserProfile(null);
      setAppState('home');
      
      // Attempt to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always navigate to auth page regardless of errors
      navigate('/auth');
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

  // Handle accepted connection request
  useEffect(() => {
    if (acceptedRequest) {
      // Connect directly to the user who accepted
      connectDirectly(acceptedRequest.to_user_id);
      clearAcceptedRequest();
    }
  }, [acceptedRequest, connectDirectly, clearAcceptedRequest]);

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    const { error, fromUserId: connectedUserId } = await acceptConnectionRequest(requestId, fromUserId);
    if (!error && connectedUserId) {
      // Connect directly to the user who sent the request
      connectDirectly(connectedUserId);
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
      <Chat
        userId={user.id}
        matchedUserId={matchedUserId}
        sendSignal={sendSignal}
        onSignal={onSignal}
        leaveMatchmaking={leaveMatchmaking}
        onEnd={handleEndChat}
      />
    );
  }

  if (appState === 'waiting') {
    return <WaitingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header with User Info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground">Your ID</p>
              <p className="font-mono font-bold text-primary text-lg">{userProfile.unique_id}</p>
            </div>
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingRequests.length} Request{pendingRequests.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Connections
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="px-4 py-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Connection Requests</h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      User <span className="font-mono text-primary">{request.from_profile?.unique_id}</span> wants
                      to connect
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id, request.from_user_id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectConnectionRequest(request.id)}
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

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse-glow"></div>
              <div className="relative bg-gradient-primary p-6 rounded-full shadow-glow">
                <MessageCircle className="w-16 h-16 text-white" aria-label="Chat icon" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Random Chat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with strangers worldwide through instant text chat. Start conversations, make
            friends, and explore new perspectives.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-glow"
              aria-label="Start chatting"
            >
              <MessageCircle className="w-6 h-6 mr-2" aria-hidden="true" />
              Start Chatting
            </Button>

            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-all"
                  aria-label="Connect by ID"
                >
                  Connect by ID
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your ID: <span className="font-mono font-semibold">{userProfile?.unique_id}</span>
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleConnectById}>Send Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Users className="w-6 h-6 text-primary" aria-label="Users icon" />
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
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Zap className="w-6 h-6 text-accent" aria-label="Lightning icon" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Instant peer-to-peer messaging with minimal latency for smooth conversations
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="bg-destructive/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Shield className="w-6 h-6 text-destructive" aria-label="Shield icon" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Private</h3>
              <p className="text-muted-foreground">
                End-to-end encrypted chats. No data stored. Images auto-deleted after conversations
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
