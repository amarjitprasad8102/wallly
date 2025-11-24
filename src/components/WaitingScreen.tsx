import { Loader2, Users } from 'lucide-react';

interface WaitingScreenProps {
  searchingUsersCount?: number;
}

const WaitingScreen = ({ searchingUsersCount = 0 }: WaitingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-subtle px-4">
      <div className="animate-pulse-glow rounded-full p-8 mb-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 animate-fade-in text-center">
        Finding someone for you...
      </h2>
      <p className="text-muted-foreground animate-fade-in mb-6 text-center" style={{ animationDelay: '0.2s' }}>
        This usually takes just a few seconds
      </p>
      
      {/* User count display */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Users className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">
          {searchingUsersCount === 0 && "Searching for users..."}
          {searchingUsersCount === 1 && "1 other user searching"}
          {searchingUsersCount > 1 && `${searchingUsersCount} other users searching`}
        </span>
      </div>
    </div>
  );
};

export default WaitingScreen;
