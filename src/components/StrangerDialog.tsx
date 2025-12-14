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

interface StrangerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (gender: string, age: number) => void;
}

const StrangerDialog = ({ open, onOpenChange, onStart }: StrangerDialogProps) => {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    setError("");
    
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16) {
      setError("You must be at least 16 years old");
      return;
    }

    onStart(gender, ageNum);
    onOpenChange(false);
    setGender("");
    setAge("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat as Stranger</DialogTitle>
          <DialogDescription>
            Enter your details to start chatting anonymously
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stranger-gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
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
            />
            <p className="text-xs text-muted-foreground">You must be at least 16 years old</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Chatting</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StrangerDialog;
