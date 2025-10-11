import { Loader2 } from 'lucide-react';

const WaitingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-subtle">
      <div className="animate-pulse-glow rounded-full p-8 mb-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
        Finding someone for you...
      </h2>
      <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
        This usually takes just a few seconds
      </p>
    </div>
  );
};

export default WaitingScreen;
