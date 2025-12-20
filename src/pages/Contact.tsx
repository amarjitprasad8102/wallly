import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, MessageCircle, Send, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import PrioritySupportBadge from '@/components/PrioritySupportBadge';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { isPremium } = usePremiumStatus(userId);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Pre-fill email if logged in
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);
      
      // Save to database
      const { error } = await supabase.from('leads').insert({
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        lead_type: isPremium ? 'priority_contact' : 'contact',
        status: isPremium ? 'priority' : 'new',
        user_id: userId || null,
      });

      if (error) {
        console.error('Error submitting contact form:', error);
        toast.error('Failed to submit. Please try again.');
        return;
      }

      setSubmitted(true);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof ContactForm] = error.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Message Sent - Wallly</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                {isPremium 
                  ? "As a Premium member, your message has been prioritized. We'll respond within 4-8 hours."
                  : "Thank you for reaching out. Our team will get back to you within 24-48 hours."
                }
              </p>
              {isPremium && (
                <div className="mb-6">
                  <PrioritySupportBadge isPremium={isPremium} variant="badge" />
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another
                </Button>
                <Button onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - Wallly | Get Help & Support</title>
        <meta name="description" content="Contact Wallly support team. Get help with your account, report issues, or send us feedback. We're here to help you connect better." />
        <meta name="keywords" content="contact wallly, wallly support, help wallly, wallly customer service, report issue wallly" />
        <link rel="canonical" href="https://wallly.in/contact" />
        
        <meta property="og:title" content="Contact Us - Wallly" />
        <meta property="og:description" content="Get in touch with Wallly support team. We're here to help!" />
        <meta property="og:url" content="https://wallly.in/contact" />
        
        <meta name="twitter:title" content="Contact Us - Wallly" />
        <meta name="twitter:description" content="Get in touch with Wallly support team." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="Wallly Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                <h2 className="text-lg sm:text-xl font-bold">Wallly</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/howtouse')}>
                  How to Use
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/blog')}>
                  Blog
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </div>
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Contact Us</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Our team is here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Us
                  </CardTitle>
                  <CardDescription>
                    Send us an email anytime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:help@corevia.in" 
                    className="text-lg font-medium text-primary hover:underline"
                  >
                    help@corevia.in
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    We typically respond within 24-48 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Support Hours
                  </CardTitle>
                  <CardDescription>
                    When we're available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">Monday - Saturday</p>
                  <p className="text-muted-foreground">9:00 AM - 6:00 PM IST</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Closed on Sundays and public holidays
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Quick Help
                  </CardTitle>
                  <CardDescription>
                    Common questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/howtouse')}
                  >
                    📖 How to Use Wallly
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/privacy')}
                  >
                    🔒 Privacy Policy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/blog')}
                  >
                    📝 Read Our Blog
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible
                    </CardDescription>
                  </div>
                  <PrioritySupportBadge isPremium={isPremium} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Priority Support Banner for Premium Users */}
                {isPremium && (
                  <div className="mb-6">
                    <PrioritySupportBadge isPremium={isPremium} variant="card" />
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? 'border-destructive' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to our{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/privacy')} 
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-4 bg-muted/20 mt-12">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p className="mb-4">
              Need immediate assistance? Email us at{' '}
              <a href="mailto:help@corevia.in" className="text-primary hover:underline font-medium">
                help@corevia.in
              </a>
            </p>
            <p>&copy; 2025 Wallly. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Contact;
