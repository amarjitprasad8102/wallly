import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  icon: string | null;
}

interface InterestsSelectorProps {
  userId: string;
  onClose?: () => void;
}

export const InterestsSelector = ({ userId, onClose }: InterestsSelectorProps) => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInterests();
    fetchUserInterests();
  }, [userId]);

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('name');

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      console.error('Error fetching interests:', error);
      toast.error('Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', userId);

      if (error) throw error;
      setSelectedInterests(data?.map(i => i.interest_id) || []);
    } catch (error) {
      console.error('Error fetching user interests:', error);
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const saveInterests = async () => {
    setSaving(true);
    try {
      // Delete all existing interests for this user
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      // Insert new interests
      if (selectedInterests.length > 0) {
        const { error } = await supabase
          .from('user_interests')
          .insert(
            selectedInterests.map(interestId => ({
              user_id: userId,
              interest_id: interestId,
            }))
          );

        if (error) throw error;
      }

      toast.success('Interests saved successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error saving interests:', error);
      toast.error('Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your Interests</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose at least 3 interests to help us match you with like-minded people
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {interests.map(interest => (
          <Badge
            key={interest.id}
            variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            onClick={() => toggleInterest(interest.id)}
          >
            {interest.icon && <span className="mr-1">{interest.icon}</span>}
            {interest.name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {selectedInterests.length} selected
        </p>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button
            onClick={saveInterests}
            disabled={saving || selectedInterests.length < 3}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Interests'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
