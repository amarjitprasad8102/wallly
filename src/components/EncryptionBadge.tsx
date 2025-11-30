import { Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EncryptionBadgeProps {
  encrypted: boolean;
  variant?: 'chat' | 'video';
}

const EncryptionBadge = ({ encrypted, variant = 'chat' }: EncryptionBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={encrypted ? "default" : "secondary"}
            className="flex items-center gap-1 cursor-help"
          >
            {encrypted ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            <span className="text-xs">
              {encrypted ? 'Encrypted' : 'Encrypting...'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            {variant === 'chat' && encrypted && (
              "Messages are end-to-end encrypted using RSA-2048. Only you and your chat partner can read them."
            )}
            {variant === 'video' && encrypted && (
              "Video and audio streams are encrypted using DTLS-SRTP protocol. Your conversation is private and secure."
            )}
            {!encrypted && (
              "Setting up secure encryption..."
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EncryptionBadge;
