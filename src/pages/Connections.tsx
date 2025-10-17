import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserMinus, Loader2 } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Connections = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { connections, loading, disconnectUser } = useConnections(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDisconnect = async (connectionId: string) => {
    await disconnectUser(connectionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Connections</h1>
        </div>
      </div>

      {/* Connections List */}
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : connections.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">No connections yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start chatting to build your connection list
              </p>
              <Button onClick={() => navigate('/')}>
                Start Chatting
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <Card key={connection.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-primary text-lg">
                          {connection.connected_profile?.unique_id || 'Unknown User'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Connected {formatDate(connection.created_at)}
                      </p>
                      {connection.last_message_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last chat: {formatDate(connection.last_message_at)}
                        </p>
                      )}
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this connection? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDisconnect(connection.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
