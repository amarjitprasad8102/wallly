import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageCircle, ArrowUp, ArrowDown, MessageSquare, Plus, Users, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CommunityDetail = () => {
  const navigate = useNavigate();
  const { communityName } = useParams();
  const [user, setUser] = useState<any>(null);
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    if (communityName) {
      fetchCommunity();
      fetchPosts();
    }
  }, [communityName]);

  useEffect(() => {
    if (user && community) {
      checkMembership();
    }
  }, [user, community]);

  const fetchCommunity = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('name', communityName)
      .single();

    if (error) {
      console.error('Error fetching community:', error);
      toast.error('Community not found');
      navigate('/c');
    } else {
      setCommunity(data);
    }
  };

  const fetchPosts = async () => {
    const { data: communityData } = await supabase
      .from('communities')
      .select('id')
      .eq('name', communityName)
      .single();

    if (communityData) {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles!community_posts_author_id_fkey(unique_id)
        `)
        .eq('community_id', communityData.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setPosts(data || []);
      }
    }
  };

  const checkMembership = async () => {
    const { data } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single();

    setIsMember(!!data);
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Please login to join this community');
      navigate('/auth');
      return;
    }

    const { error } = await supabase
      .from('community_members')
      .insert([{ community_id: community.id, user_id: user.id }]);

    if (error) {
      toast.error('Failed to join community');
    } else {
      toast.success('Joined community successfully!');
      setIsMember(true);
      fetchCommunity();
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Please login to create a post');
      navigate('/auth');
      return;
    }

    if (!newPost.title) {
      toast.error('Post title is required');
      return;
    }

    const { error } = await supabase
      .from('community_posts')
      .insert([
        {
          community_id: community.id,
          author_id: user.id,
          title: newPost.title,
          content: newPost.content,
        },
      ]);

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post created successfully!');
      setCreatePostOpen(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    }
  };

  if (!community) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{community.display_name} - Bharatiya Samudaay on Kindred</title>
        <meta name="description" content={community.description || `Join ${community.display_name} community on Kindred. ${community.tagline || 'Connect, share, and grow together.'}`} />
        <meta name="keywords" content={`${community.display_name}, community, bharatiya samudaay, indian community, online forum`} />
        <link rel="canonical" href={`https://kindred.corevia.in/c/${community.name}`} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-primary p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Kindred</h2>
            </button>
            {user && <Button onClick={() => navigate('/app')}>Go to App</Button>}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/c')} className="cursor-pointer">
                Communities
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{community.display_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Community Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{community.display_name}</h1>
              {community.tagline && <p className="text-primary mb-2">{community.tagline}</p>}
              <p className="text-muted-foreground mb-4">{community.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.member_count.toLocaleString()} members
                </div>
                <div>•</div>
                <div>{community.post_count} posts</div>
              </div>
            </div>
            <div className="flex gap-2">
              {isMember ? (
                <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Post</DialogTitle>
                      <DialogDescription>Share your thoughts with the community</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Post title..."
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="What's on your mind?"
                          rows={6}
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreatePost}>Post</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={handleJoinCommunity}>Join Community</Button>
              )}
            </div>
          </div>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold">{post.upvotes - post.downvotes}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by u/{post.author?.unique_id}</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.comment_count} comments
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </main>
      </div>
    </>
  );
};

export default CommunityDetail;