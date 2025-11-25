import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, User, Home, ArrowLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { blogPosts } from '@/data/blogPosts';
import { Helmet } from 'react-helmet';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const blog = blogPosts.find(post => post.slug === slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>Back to Blog List</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} | Kindred Blog</title>
        <meta name="description" content={blog.metaDescription} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={blog.date} />
        <meta property="article:author" content={blog.author} />
        <link rel="canonical" href={`https://kindred.corevia.in/b/${blog.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
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

        <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          {/* Breadcrumbs */}
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
                <BreadcrumbLink onClick={() => navigate('/blog')} className="cursor-pointer">
                  Blog
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{blog.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6"
            aria-label="Back to blog list"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Blogs
          </Button>

          {/* Blog Article */}
          <article className="bg-card rounded-xl border border-border p-8 md:p-12 shadow-card">
            {/* Featured Image */}
            <img 
              src={blog.imageUrl} 
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              loading="eager"
            />

            {/* Blog Header */}
            <header className="mb-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {blog.category}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <time dateTime={blog.date}>
                    {new Date(blog.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>{blog.author}</span>
                </div>
              </div>
            </header>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-foreground [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Call to Action */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="bg-gradient-primary/10 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Connecting?</h2>
                <p className="text-muted-foreground mb-6">
                  Join Kindred today and experience meaningful connections from India to the world.
                </p>
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Now
                </Button>
              </div>
            </div>
          </article>

          {/* Related Blogs */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More from Kindred Blog</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {blogPosts
                .filter(post => post.slug !== slug && post.category === blog.category)
                .slice(0, 2)
                .map(relatedBlog => (
                  <article 
                    key={relatedBlog.slug}
                    className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/b/${relatedBlog.slug}`)}
                  >
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                      {relatedBlog.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2">{relatedBlog.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {relatedBlog.metaDescription}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={relatedBlog.date}>
                        {new Date(relatedBlog.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>
                  </article>
                ))}
            </div>
          </section>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-24 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-muted-foreground">
              <p>&copy; 2025 Kindred. From India to World - Connecting Hearts and Minds.</p>
              <div className="mt-4 space-x-6">
                <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => navigate('/c')} className="hover:text-primary transition-colors">
                  Communities
                </button>
                <button onClick={() => navigate('/how-to-use')} className="hover:text-primary transition-colors">
                  How to Use
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogDetail;
