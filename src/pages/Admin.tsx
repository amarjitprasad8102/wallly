import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Home, Plus, Pencil, Trash2, Eye, EyeOff, Users, FileText, Flag, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface User {
  id: string;
  email: string;
  unique_id: string;
  is_premium: boolean;
  age: number | null;
}

interface UserRole {
  role: string;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_email?: string;
  reported_email?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  author: string;
  published_at: string;
  image_url: string;
  category: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
}

const defaultBlogPost = {
  slug: "",
  title: "",
  meta_description: "",
  author: "Kindred Team",
  image_url: "/placeholder.svg",
  category: "General",
  content: "",
  is_published: false,
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState(defaultBlogPost);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some((r: UserRole) => r.role === "admin");
    
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchReports(),
      fetchBlogPosts(),
      fetchCommunities(),
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      setUsers(profiles);
      
      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, string> = {};
      allRoles?.forEach((r: { user_id: string; role: string }) => {
        rolesMap[r.user_id] = r.role;
      });
      setUserRoles(rolesMap);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as "admin" | "premium_user" | "user" }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
      return;
    }

    const isPremium = newRole === "premium_user";
    await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", userId);

    toast({
      title: "Success",
      description: "User role updated successfully",
    });

    fetchUsers();
  };

  const fetchReports = async () => {
    const { data: reportsData, error } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:reporter_id(email),
        reported:reported_user_id(email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    const formattedReports = reportsData?.map((report: any) => ({
      ...report,
      reporter_email: report.reporter?.email || "Unknown",
      reported_email: report.reported?.email || "Unknown",
    })) || [];

    setReports(formattedReports);
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Report status updated",
    });

    fetchReports();
  };

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return;
    }

    setBlogPosts(data || []);
  };

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
      return;
    }

    setCommunities(data || []);
  };

  const openBlogDialog = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        slug: blog.slug,
        title: blog.title,
        meta_description: blog.meta_description,
        author: blog.author,
        image_url: blog.image_url,
        category: blog.category,
        content: blog.content,
        is_published: blog.is_published,
      });
    } else {
      setEditingBlog(null);
      setBlogForm(defaultBlogPost);
    }
    setBlogDialogOpen(true);
  };

  const saveBlogPost = async () => {
    if (!blogForm.slug || !blogForm.title || !blogForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const blogData = {
      ...blogForm,
      published_at: blogForm.is_published ? new Date().toISOString() : null,
    };

    if (editingBlog) {
      const { error } = await supabase
        .from("blog_posts")
        .update(blogData)
        .eq("id", editingBlog.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update blog post",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "Blog post updated" });
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .insert([blogData]);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to create blog post",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "Blog post created" });
    }

    setBlogDialogOpen(false);
    fetchBlogPosts();
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Blog post deleted" });
    fetchBlogPosts();
  };

  const toggleBlogPublished = async (blog: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ 
        is_published: !blog.is_published,
        published_at: !blog.is_published ? new Date().toISOString() : blog.published_at
      })
      .eq("id", blog.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: `Blog post ${!blog.is_published ? 'published' : 'unpublished'}` 
    });
    fetchBlogPosts();
  };

  const deleteCommunity = async (id: string) => {
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Community deleted" });
    fetchCommunities();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Kindred</title>
        <meta name="description" content="Kindred admin panel for managing users, reports, blogs, and communities." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin Panel</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Full control over users, reports, blogs, and communities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Flag className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{blogPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Blog Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Settings className="h-8 w-8 text-secondary-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{communities.length}</p>
                    <p className="text-sm text-muted-foreground">Communities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Reports
                {reports.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {reports.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="blogs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Blogs
              </TabsTrigger>
              <TabsTrigger value="communities" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Communities
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Update user roles and subscription status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="font-mono text-sm">{user.unique_id}</TableCell>
                          <TableCell>{user.age || "N/A"}</TableCell>
                          <TableCell>
                            <span className={user.is_premium ? "text-accent font-semibold" : "text-muted-foreground"}>
                              {user.is_premium ? "Yes" : "No"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{userRoles[user.id] || "user"}</span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userRoles[user.id] || "user"}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="premium_user">Premium User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    User Reports
                  </CardTitle>
                  <CardDescription>Review and manage user reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-mono text-sm">{report.reporter_email}</TableCell>
                            <TableCell className="font-mono text-sm">{report.reported_email}</TableCell>
                            <TableCell>
                              <span className="capitalize">{report.reason.replace(/_/g, ' ')}</span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.details || "No additional details"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  report.status === 'pending' ? 'destructive' : 
                                  report.status === 'resolved' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={report.status}
                                onValueChange={(value) => updateReportStatus(report.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewing">Reviewing</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blogs Tab */}
            <TabsContent value="blogs">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Blog Management</CardTitle>
                      <CardDescription>Create, edit, and manage blog posts</CardDescription>
                    </div>
                    <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => openBlogDialog()}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                          <DialogDescription>
                            Fill in the details for your blog post
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title *</Label>
                              <Input
                                id="title"
                                value={blogForm.title}
                                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                placeholder="Blog post title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="slug">Slug *</Label>
                              <Input
                                id="slug"
                                value={blogForm.slug}
                                onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="url-friendly-slug"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta_description">Meta Description *</Label>
                            <Textarea
                              id="meta_description"
                              value={blogForm.meta_description}
                              onChange={(e) => setBlogForm({ ...blogForm, meta_description: e.target.value })}
                              placeholder="SEO description (max 160 characters)"
                              maxLength={160}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="author">Author</Label>
                              <Input
                                id="author"
                                value={blogForm.author}
                                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Input
                                id="category"
                                value={blogForm.category}
                                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="image_url">Image URL</Label>
                              <Input
                                id="image_url"
                                value={blogForm.image_url}
                                onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">Content * (HTML supported)</Label>
                            <Textarea
                              id="content"
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              placeholder="<h2>Introduction</h2><p>Your content here...</p>"
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_published"
                              checked={blogForm.is_published}
                              onCheckedChange={(checked) => setBlogForm({ ...blogForm, is_published: checked })}
                            />
                            <Label htmlFor="is_published">Publish immediately</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={saveBlogPost}>
                            {editingBlog ? "Update" : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No blog posts found. Create your first post!
                          </TableCell>
                        </TableRow>
                      ) : (
                        blogPosts.map((blog) => (
                          <TableRow key={blog.id}>
                            <TableCell className="max-w-xs truncate font-medium">
                              {blog.title}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {blog.slug}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{blog.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={blog.is_published ? "default" : "outline"}>
                                {blog.is_published ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(blog.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBlogPublished(blog)}
                                  title={blog.is_published ? "Unpublish" : "Publish"}
                                >
                                  {blog.is_published ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openBlogDialog(blog)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteBlogPost(blog.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communities Tab */}
            <TabsContent value="communities">
              <Card>
                <CardHeader>
                  <CardTitle>Community Management</CardTitle>
                  <CardDescription>Manage and moderate communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {communities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No communities found
                          </TableCell>
                        </TableRow>
                      ) : (
                        communities.map((community) => (
                          <TableRow key={community.id}>
                            <TableCell className="font-mono text-sm">
                              c/{community.name}
                            </TableCell>
                            <TableCell className="font-medium">
                              {community.display_name}
                            </TableCell>
                            <TableCell>{community.member_count}</TableCell>
                            <TableCell>{community.post_count}</TableCell>
                            <TableCell>
                              {new Date(community.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/c/${community.name}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCommunity(community.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}