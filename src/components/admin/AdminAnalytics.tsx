import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  UserPlus,
  Activity,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserGrowthData {
  date: string;
  count: number;
}

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  usersThisWeek: number;
  usersLastWeek: number;
  usersThisMonth: number;
  usersLastMonth: number;
  growthRate: number;
  premiumRate: number;
  communityMembers: number;
  totalConnections: number;
  totalMessages: number;
  recentSignups: { email: string; created_at: string }[];
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - 7);
      
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all data in parallel
      const [
        { count: totalUsers },
        { data: premiumData },
        { count: usersThisWeek },
        { count: usersLastWeek },
        { count: usersThisMonth },
        { count: usersLastMonth },
        { count: communityMembers },
        { count: totalConnections },
        { count: totalMessages },
        { data: recentSignups }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("id").eq("is_premium", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thisWeekStart.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", lastWeekStart.toISOString()).lt("created_at", thisWeekStart.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart.toISOString()).lt("created_at", lastMonthEnd.toISOString()),
        supabase.from("community_members").select("*", { count: "exact", head: true }),
        supabase.from("connections").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("email, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const premiumUsers = premiumData?.length || 0;
      const growthRate = usersLastWeek && usersLastWeek > 0 
        ? ((usersThisWeek || 0) - usersLastWeek) / usersLastWeek * 100 
        : 0;
      const premiumRate = totalUsers && totalUsers > 0 
        ? (premiumUsers / totalUsers) * 100 
        : 0;

      setAnalytics({
        totalUsers: totalUsers || 0,
        premiumUsers,
        usersThisWeek: usersThisWeek || 0,
        usersLastWeek: usersLastWeek || 0,
        usersThisMonth: usersThisMonth || 0,
        usersLastMonth: usersLastMonth || 0,
        growthRate,
        premiumRate,
        communityMembers: communityMembers || 0,
        totalConnections: totalConnections || 0,
        totalMessages: totalMessages || 0,
        recentSignups: recentSignups || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your platform's growth and engagement metrics.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="h-3 w-3 mr-1" />
          Real-time data
        </Badge>
      </div>

      {/* Growth Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
            {analytics.growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.usersThisWeek} new users this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Rate</CardTitle>
            <PieChart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {analytics.premiumRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.premiumUsers} of {analytics.totalUsers} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Users</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {analytics.usersThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {analytics.usersLastMonth} last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {analytics.totalConnections.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              user connections made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>Platform engagement overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Community Members</p>
                  <p className="text-xs text-muted-foreground">Total community memberships</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{analytics.communityMembers.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Total Messages</p>
                  <p className="text-xs text-muted-foreground">Messages exchanged</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{analytics.totalMessages.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Avg. Connections/User</p>
                  <p className="text-xs text-muted-foreground">Average connections per user</p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {analytics.totalUsers > 0 
                  ? (analytics.totalConnections / analytics.totalUsers).toFixed(1) 
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Signups
            </CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentSignups.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent signups</p>
              ) : (
                analytics.recentSignups.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                    <span className="text-sm truncate max-w-[200px]">{user.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
