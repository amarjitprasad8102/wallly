import { Crown, Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PrioritySupportBadgeProps {
  isPremium: boolean;
  variant?: 'badge' | 'card';
}

const PrioritySupportBadge = ({ isPremium, variant = 'badge' }: PrioritySupportBadgeProps) => {
  if (!isPremium) return null;

  if (variant === 'card') {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Priority Support</span>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] h-4 px-1.5">
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                PREMIUM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Your message will be prioritized (Response within 4-8 hours)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
      <Zap className="w-3 h-3" />
      Priority Support
    </Badge>
  );
};

export default PrioritySupportBadge;
