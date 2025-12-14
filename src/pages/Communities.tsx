import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageCircle, Plus, Users, TrendingUp, Home, Search, Flag } from 'lucide-react';
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

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  tagline: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
}

const Communities = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    display_name: '',
    description: '',
    tagline: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Error fetching communities:', error);
    } else {
      setCommunities(data || []);
    }
  };

  const handleCreateCommunity = async () => {
    if (!user) {
      toast.error('Please login to create a community');
      navigate('/auth');
      return;
    }

    if (!newCommunity.name || !newCommunity.display_name) {
      toast.error('Community name and display name are required');
      return;
    }

    // Format community name (lowercase, no spaces, only alphanumeric)
    const formattedName = newCommunity.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const { error } = await supabase
      .from('communities')
      .insert([
        {
          name: formattedName,
          display_name: newCommunity.display_name,
          description: newCommunity.description,
          tagline: newCommunity.tagline,
          creator_id: user.id,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        toast.error('A community with this name already exists');
      } else {
        toast.error('Failed to create community');
      }
      return;
    }

    // Auto-join the creator as a member
    await supabase.from('community_members').insert([
      {
        community_id: formattedName,
        user_id: user.id,
        role: 'admin',
      },
    ]);

    toast.success('Community created successfully!');
    setCreateDialogOpen(false);
    setNewCommunity({ name: '', display_name: '', description: '', tagline: '' });
    fetchCommunities();
  };

  const filteredCommunities = communities.filter((c) =>
    c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Bharatiya Samudaay - Indian Communities on Wallly</title>
        <meta name="description" content="Join Bharatiya Samudaay on Wallly. Discover vibrant Indian communities connecting India to the world. Create, join, and engage with interest-based communities." />
        <meta name="keywords" content="indian communities, bharatiya samudaay, online communities, india groups, community chat, interest groups" />
        <link rel="canonical" href="https://wallly.corevia.in/c" />
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
              <h2 className="text-xl font-bold">Wallly</h2>
            </button>
            <div className="flex items-center gap-4">
              {user ? (
                <Button onClick={() => navigate('/app')}>Go to App</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
                  <Button onClick={() => navigate('/auth')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
              <BreadcrumbPage>Communities</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flag className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Bharatiya Samudaay
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-2">Communities from India to World</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join vibrant communities connecting people from Bharat to the world. Share ideas, build connections, and grow together.
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Community</DialogTitle>
                <DialogDescription>
                  Build a community connecting India to the world. Login required to create.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Community Name (URL)</Label>
                  <Input
                    id="name"
                    placeholder="mysancommunity"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Only lowercase letters and numbers, no spaces</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="My Awesome Community"
                    value={newCommunity.display_name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, display_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="From India to World"
                    value={newCommunity.tagline}
                    onChange={(e) => setNewCommunity({ ...newCommunity, tagline: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is your community about?"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCommunity}>Create Community</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
              onClick={() => navigate(`/c/${community.name}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{community.display_name}</h3>
                  {community.tagline && (
                    <p className="text-sm text-primary mb-2">{community.tagline}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description || 'No description available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.member_count.toLocaleString()} members
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {community.post_count} posts
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No communities found. Create the first one!</p>
          </div>
        )}
      </main>
      </div>
    </>
  );
};

export default Communities;