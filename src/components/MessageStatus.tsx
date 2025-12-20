import { Check, CheckCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isPremium?: boolean;
}

const MessageStatus = ({ status, isPremium = false }: MessageStatusProps) => {
  if (!isPremium) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-50" />
        );
      case 'sent':
        return <Check className="w-3 h-3 opacity-60" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-60" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center ml-1">
          {getStatusIcon()}
        </span>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-xs">{getStatusText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default MessageStatus;