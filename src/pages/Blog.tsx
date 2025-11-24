import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, User, Home, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { blogPosts } from '@/data/blogPosts';

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlogs = blogPosts.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Kindred Blog - From India to World | Connection, Culture & Community</title>
        <meta name="description" content="Explore 100+ articles about online connections, cultural exchange, and community building. From India to World - insights on digital friendship and meaningful conversations." />
        <meta name="keywords" content="online chat, random chat, Kindred blog, cultural exchange, Indian communities, Bharatiya Samudaay, online friendship, anonymous chat" />
        <link rel="canonical" href="https://kindred.corevia.in/blog" />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Main navigation">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                aria-label="Return to homepage"
              >
                <div className="bg-gradient-primary p-2 rounded-lg" aria-hidden="true">
                  <MessageCircle className="w-6 h-6 text-white" aria-label="Kindred logo" />
                </div>
                <h2 className="text-xl font-bold">Kindred</h2>
              </button>
              <div className="space-x-4">
                <Button variant="ghost" onClick={() => navigate('/auth')} aria-label="Sign in to your account">
                  Sign In
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')} aria-label="Get started with Kindred">
                  Get Started
                </Button>
              </div>
            </div>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Kindred Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              From India to World - Explore insights on connection, culture, community, and meaningful conversations
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles by title, category, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.slug}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/b/${blog.slug}`)}
              >
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {blog.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {blog.metaDescription}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={blog.date}>
                        {new Date(blog.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{blog.author}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No articles found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search query</p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          )}

          <section className="mt-16 bg-card rounded-xl border border-border p-8">
            <h2 className="text-3xl font-bold mb-6">Explore by Category</h2>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(blogPosts.map(blog => blog.category))).map(category => (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-16 bg-gradient-primary rounded-xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Connection Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands connecting from India to the world on Kindred
            </p>
            <Button 
              variant="secondary"
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90"
            >
              Get Started Now
            </Button>
          </section>
        </main>

        <footer className="border-t border-border mt-24 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-muted-foreground">
              <p>&copy; 2025 Kindred. From India to World - Connecting Hearts and Minds.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Blog;
