import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StrangerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (gender: string, age: number, email: string, tempId: string) => void;
}

const StrangerDialog = ({ open, onOpenChange, onStart }: StrangerDialogProps) => {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [tempId, setTempId] = useState("");

  const handleStart = async () => {
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16) {
      setError("You must be at least 16 years old");
      return;
    }

    setLoading(true);

    try {
      // Generate temp ID
      const generatedTempId = 'STR-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      setTempId(generatedTempId);

      // Store stranger session in database
      const { error: insertError } = await supabase
        .from('stranger_sessions')
        .insert({
          email: email.trim(),
          temp_id: generatedTempId,
          gender,
          age: ageNum,
          is_verified: false,
        });

      if (insertError) {
        console.error('Error storing stranger session:', insertError);
        throw new Error('Failed to register. Please try again.');
      }

      // Also store in leads table for admin panel
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          name: `Stranger User`,
          email: email.trim(),
          message: `Stranger session started. Gender: ${gender}, Age: ${ageNum}, Temp ID: ${generatedTempId}`,
          lead_type: 'stranger',
          status: 'new',
        });

      if (leadError) {
        console.error('Error storing lead:', leadError);
        // Don't throw, just log - lead storage is not critical
      }

      // Start the chat without email verification for now
      // Show success and start
      toast.success('Registration successful!');
      onStart(gender, ageNum, email.trim(), generatedTempId);
      onOpenChange(false);
      
      // Reset form
      setGender("");
      setAge("");
      setEmail("");
      setShowVerification(false);
      setTempId("");

    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGender("");
    setAge("");
    setEmail("");
    setError("");
    setShowVerification(false);
    setTempId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat as Stranger</DialogTitle>
          <DialogDescription>
            Enter your details to start chatting anonymously
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stranger-email">Email</Label>
            <Input
              id="stranger-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Your email will be stored for admin purposes</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stranger-gender">Gender</Label>
            <Select value={gender} onValueChange={setGender} disabled={loading}>
              <SelectTrigger id="stranger-gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stranger-age">Age</Label>
            <Input
              id="stranger-age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="16"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">You must be at least 16 years old</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Chatting'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StrangerDialog;