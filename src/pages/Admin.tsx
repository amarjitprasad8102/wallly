import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  email: string;
  unique_id: string;
  is_premium: boolean;
  age: number | null;
}

interface UserRole {
  role: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some((r: UserRole) => r.role === "admin");
    
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      setUsers(profiles);
      
      // Fetch roles for all users
      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, string> = {};
      allRoles?.forEach((r: { user_id: string; role: string }) => {
        rolesMap[r.user_id] = r.role;
      });
      setUserRoles(rolesMap);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    // Delete existing role
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // Insert new role with proper type
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as "admin" | "premium_user" | "user" }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
      return;
    }

    // Update premium status based on role
    const isPremium = newRole === "premium_user";
    await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", userId);

    toast({
      title: "Success",
      description: "User role updated successfully",
    });

    fetchUsers();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage user subscriptions and roles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Update user roles and subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono text-sm">{user.unique_id}</TableCell>
                    <TableCell>{user.age || "N/A"}</TableCell>
                    <TableCell>
                      <span className={user.is_premium ? "text-accent font-semibold" : "text-muted-foreground"}>
                        {user.is_premium ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{userRoles[user.id] || "user"}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userRoles[user.id] || "user"}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="premium_user">Premium User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
