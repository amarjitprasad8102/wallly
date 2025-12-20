import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const PremiumBadge = ({ size = 'md', showTooltip = true, className = '' }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: 'h-4 px-1.5 text-[10px]',
    md: 'h-5 px-2 text-xs',
    lg: 'h-6 px-3 text-sm',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const badge = (
    <Badge 
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 font-semibold gap-1 ${sizeClasses[size]} ${className}`}
    >
      <Crown className={iconSizes[size]} />
      Premium
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent>
        <p>Premium Member</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default PremiumBadge;
