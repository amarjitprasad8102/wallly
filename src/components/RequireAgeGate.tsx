import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenderSelect from "@/components/GenderSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const RequireAgeGate = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [needsGender, setNeedsGender] = useState(false);
  const [saving, setSaving] = useState(false);

  const checkProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("age, gender")
      .eq("id", uid)
      .maybeSingle();
    if (!data) return;
    if (!data.age) {
      setUserId(uid);
      setNeedsGender(!data.gender);
      setOpen(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        checkProfile(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        setOpen(false);
        setUserId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16) {
      toast.error("You must be at least 16 years old");
      return;
    }
    if (needsGender && !gender) {
      toast.error("Please select your gender");
      return;
    }
    if (!userId) return;

    setSaving(true);
    const update: { age: number; gender?: string } = { age: ageNum };
    if (needsGender) update.gender = gender;

    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId);

    setSaving(false);
    if (error) {
      toast.error(error.message || "Failed to save");
      return;
    }
    toast.success("Profile updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* non-dismissible */ }}>
      <DialogContent
        className="max-w-[90vw] sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Your age is required to continue using Wallly. You must be at least 16.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="gate-age">Age</Label>
            <Input
              id="gate-age"
              type="number"
              min={16}
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={saving}
            />
          </div>
          {needsGender && (
            <div className="grid gap-2">
              <Label htmlFor="gate-gender">Gender / Identity</Label>
              <GenderSelect
                id="gate-gender"
                value={gender}
                onValueChange={setGender}
                disabled={saving}
                placeholder="Select your gender or identity"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequireAgeGate;
