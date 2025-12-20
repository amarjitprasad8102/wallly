import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Filter, Users, Zap, Lock, Heart, Palette, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFiltersProps {
  isPremium: boolean;
  onFiltersChange: (filters: PremiumFilterSettings) => void;
  className?: string;
}

export interface PremiumFilterSettings {
  genderFilter: 'any' | 'male' | 'female';
  ageRange: [number, number];
  priorityMatching: boolean;
  interestPriority: boolean;
}

const PremiumFilters = ({ isPremium, onFiltersChange, className = '' }: PremiumFiltersProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PremiumFilterSettings>({
    genderFilter: 'any',
    ageRange: [18, 50],
    priorityMatching: false,
    interestPriority: false,
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = <K extends keyof PremiumFilterSettings>(
    key: K,
    value: PremiumFilterSettings[K]
  ) => {
    if (!isPremium) return;
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!isPremium) {
    return (
      <Card className={`border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Premium Filters
            </CardTitle>
            <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          </div>
          <CardDescription className="text-sm">
            Upgrade to Premium to unlock gender filters, age preferences, priority matching, virtual backgrounds, and priority support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary/50" />
              <span>Gender Filters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary/50" />
              <span>Priority Matching</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary/50" />
              <span>Interest Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary/50" />
              <span>Virtual Backgrounds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-primary/50" />
              <span>Premium Badge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-primary/50" />
              <span>Priority Support</span>
            </div>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white"
            onClick={() => navigate('/premium')}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Premium Filters
          </CardTitle>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Gender Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gender Preference
          </Label>
          <Select 
            value={filters.genderFilter} 
            onValueChange={(value: 'any' | 'male' | 'female') => updateFilter('genderFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Gender</SelectItem>
              <SelectItem value="male">Male Only</SelectItem>
              <SelectItem value="female">Female Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
          </Label>
          <div className="px-2">
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
              min={16}
              max={65}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>16</span>
            <span>65+</span>
          </div>
        </div>

        {/* Priority Matching */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Priority Matching
            </Label>
            <p className="text-xs text-muted-foreground">Get matched faster</p>
          </div>
          <Switch
            checked={filters.priorityMatching}
            onCheckedChange={(checked) => updateFilter('priorityMatching', checked)}
          />
        </div>

        {/* Interest Priority */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Interest Priority</Label>
            <p className="text-xs text-muted-foreground">Match with similar interests first</p>
          </div>
          <Switch
            checked={filters.interestPriority}
            onCheckedChange={(checked) => updateFilter('interestPriority', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumFilters;
