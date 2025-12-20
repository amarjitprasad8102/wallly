import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Image, Sparkles, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualBackgroundsProps {
  isPremium: boolean;
  onBackgroundChange: (background: BackgroundOption | null) => void;
  currentBackground: BackgroundOption | null;
}

export interface BackgroundOption {
  id: string;
  type: 'blur' | 'color' | 'image';
  value: string;
  label: string;
}

const backgrounds: BackgroundOption[] = [
  { id: 'blur-light', type: 'blur', value: '10', label: 'Light Blur' },
  { id: 'blur-medium', type: 'blur', value: '20', label: 'Medium Blur' },
  { id: 'blur-strong', type: 'blur', value: '40', label: 'Strong Blur' },
  { id: 'color-gradient-1', type: 'color', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple Gradient' },
  { id: 'color-gradient-2', type: 'color', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink Gradient' },
  { id: 'color-gradient-3', type: 'color', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue Gradient' },
  { id: 'color-gradient-4', type: 'color', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green Gradient' },
  { id: 'color-gradient-5', type: 'color', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset' },
  { id: 'color-solid-1', type: 'color', value: '#1a1a2e', label: 'Dark Blue' },
  { id: 'color-solid-2', type: 'color', value: '#16213e', label: 'Navy' },
  { id: 'color-solid-3', type: 'color', value: '#0f3460', label: 'Royal Blue' },
  { id: 'color-solid-4', type: 'color', value: '#1f4037', label: 'Forest' },
  { id: 'image-office', type: 'image', value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', label: 'Office' },
  { id: 'image-nature', type: 'image', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', label: 'Mountains' },
  { id: 'image-beach', type: 'image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', label: 'Beach' },
  { id: 'image-city', type: 'image', value: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', label: 'City' },
];

const VirtualBackgrounds = ({ isPremium, onBackgroundChange, currentBackground }: VirtualBackgroundsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isPremium) {
    return null;
  }

  const blurOptions = backgrounds.filter(b => b.type === 'blur');
  const colorOptions = backgrounds.filter(b => b.type === 'color');
  const imageOptions = backgrounds.filter(b => b.type === 'image');

  const handleSelect = (bg: BackgroundOption) => {
    if (currentBackground?.id === bg.id) {
      onBackgroundChange(null);
    } else {
      onBackgroundChange(bg);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={currentBackground ? "default" : "outline"}
          size="lg"
          className={cn(
            "rounded-full w-12 h-12 sm:w-14 sm:h-14 touch-manipulation relative",
            currentBackground && "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
          )}
          aria-label="Virtual backgrounds"
        >
          <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
          {currentBackground && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="center" 
        className="w-80 p-4"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-sm">Virtual Backgrounds</h4>
            </div>
            {currentBackground && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBackgroundChange(null)}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Blur Options */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Blur</p>
            <div className="grid grid-cols-3 gap-2">
              {blurOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleSelect(bg)}
                  className={cn(
                    "relative h-12 rounded-lg border-2 transition-all flex items-center justify-center",
                    "bg-gradient-to-br from-muted/50 to-muted backdrop-blur",
                    currentBackground?.id === bg.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground">{bg.label}</span>
                  {currentBackground?.id === bg.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color/Gradient Options */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Colors & Gradients</p>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleSelect(bg)}
                  className={cn(
                    "relative h-10 rounded-lg border-2 transition-all",
                    currentBackground?.id === bg.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent hover:border-primary/50"
                  )}
                  style={{ background: bg.value }}
                  title={bg.label}
                >
                  {currentBackground?.id === bg.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Image Options */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Image className="w-3 h-3" />
              Scenes
            </p>
            <div className="grid grid-cols-4 gap-2">
              {imageOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleSelect(bg)}
                  className={cn(
                    "relative h-12 rounded-lg border-2 transition-all overflow-hidden",
                    currentBackground?.id === bg.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent hover:border-primary/50"
                  )}
                  title={bg.label}
                >
                  <img 
                    src={bg.value} 
                    alt={bg.label} 
                    className="w-full h-full object-cover"
                  />
                  {currentBackground?.id === bg.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Premium feature • Background effects are visible to you only
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VirtualBackgrounds;
