import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window { Razorpay: any }
}

interface Props {
  planName: 'Weekly' | 'Monthly' | 'Yearly' | string;
  planPrice: string;
  popular?: boolean;
}

const loadScript = (src: string) =>
  new Promise<boolean>((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function RazorpayCheckoutButton({ planName, planPrice, popular }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to subscribe');
        navigate('/auth');
        return;
      }

      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) { toast.error('Failed to load payment gateway'); return; }

      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: { plan: planName },
      });
      if (error || !data?.orderId) {
        toast.error(data?.error || 'Could not start payment');
        return;
      }

      const userEmail = session.user.email || '';

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Wallly',
        description: `${planName} Premium`,
        order_id: data.orderId,
        prefill: { email: userEmail },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          try {
            const { data: v, error: vErr } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: response,
            });
            if (vErr || !v?.ok) {
              toast.error(v?.error || 'Payment verification failed. Contact support.');
              return;
            }
            toast.success(`Welcome to ${planName} Premium!`);
            setTimeout(() => window.location.reload(), 1200);
          } catch (e) {
            toast.error('Verification error. Contact support if amount was deducted.');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (e) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full" variant={popular ? 'default' : 'outline'}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      {loading ? 'Processing...' : `Get ${planName} - ${planPrice}`}
    </Button>
  );
}
