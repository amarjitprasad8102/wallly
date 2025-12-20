import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Crown, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
});

interface PremiumLeadFormProps {
  planName: string;
  planPrice: string;
  popular?: boolean;
}

const PremiumLeadForm = ({ planName, planPrice, popular = false }: PremiumLeadFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in the ${planName} plan (${planPrice}). Please contact me with more details.`,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = leadSchema.parse(formData);

      const { error } = await supabase.from('leads').insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        lead_type: 'premium',
        plan_interest: planName.toLowerCase(),
        subject: `Premium Inquiry - ${planName} Plan`,
        status: 'new',
      });

      if (error) {
        console.error('Error submitting lead:', error);
        toast.error('Failed to submit. Please try again.');
        return;
      }

      setSubmitted(true);
      toast.success('Thank you! We\'ll contact you shortly.');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<string, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: `I'm interested in the ${planName} plan (${planPrice}). Please contact me with more details.`,
    });
    setSubmitted(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setTimeout(resetForm, 200);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          className={`w-full ${popular ? 'bg-gradient-primary hover:opacity-90' : ''}`}
          variant={popular ? 'default' : 'outline'}
        >
          <Crown className="w-4 h-4 mr-2" />
          Get {planName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <DialogTitle className="text-2xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              We've received your inquiry for the {planName} plan. Our team will contact you within 24 hours.
            </DialogDescription>
            <Button onClick={resetForm}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Get {planName} Plan - {planPrice}
              </DialogTitle>
              <DialogDescription>
                Fill in your details and our team will contact you to complete your premium subscription.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Any questions or specific requirements..."
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Inquiry
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We'll contact you within 24 hours to complete your subscription.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumLeadForm;