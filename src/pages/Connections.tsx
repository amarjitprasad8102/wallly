import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserMinus, Loader2, X, Clock, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
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
  const { connections, pendingRequests, loading, disconnectUser, cancelRequest } = useConnections(user?.id);

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

  const handleCancelRequest = async (requestId: string) => {
    await cancelRequest(requestId);
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
    <>
      <Helmet>
        <title>My Connections - Wallly</title>
        <meta name="description" content="Manage your Wallly connections. View chat history and reconnect with friends." />
        <link rel="canonical" href="https://wallly.in/connections" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/app')} className="cursor-pointer">
                  Chat
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Connections</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
          ) : connections.length === 0 && pendingRequests.length === 0 ? (
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
            <div className="space-y-6">
              {/* Pending Requests Section */}
              {pendingRequests.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Requests
                  </h2>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono font-bold text-primary text-lg">
                                {request.to_profile?.unique_id || 'Unknown User'}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Sent {formatDate(request.created_at)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Established Connections Section */}
              {connections.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Chat History</h2>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Connections;
