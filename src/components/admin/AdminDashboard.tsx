import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Flag, 
  FileText, 
  Settings, 
  Mail, 
  TrendingUp,
  UserPlus,
  MessageSquare,
  Activity,
  Crown
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  pendingReports: number;
  totalReports: number;
  blogPosts: number;
  publishedPosts: number;
  communities: number;
  emailsSent: number;
  newUsersToday: number;
  activeUsersWeek: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export function AdminDashboard({ stats, onNavigate }: AdminDashboardProps) {
  const quickActions = [
    { label: "View Users", tab: "users", icon: Users, count: stats.totalUsers },
    { label: "Pending Reports", tab: "reports", icon: Flag, count: stats.pendingReports, urgent: stats.pendingReports > 0 },
    { label: "Manage Leads", tab: "leads", icon: MessageSquare },
    { label: "Send Email", tab: "email", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your platform.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("users")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                {stats.premiumUsers} premium
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("reports")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <Flag className={stats.pendingReports > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">pending review</p>
            {stats.pendingReports > 0 && (
              <Badge variant="destructive" className="mt-2 text-xs">Needs Attention</Badge>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("blogs")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogPosts}</div>
            <p className="text-xs text-muted-foreground">{stats.publishedPosts} published</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("communities")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.communities}</div>
            <p className="text-xs text-muted-foreground">active communities</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+{stats.newUsersToday}</div>
            <p className="text-xs text-muted-foreground">registered today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.activeUsersWeek}</div>
            <p className="text-xs text-muted-foreground">users active</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("email")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">total emails</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all hover:border-primary hover:bg-primary/5 ${
                  action.urgent ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
              >
                <action.icon className={`h-5 w-5 ${action.urgent ? 'text-destructive' : 'text-primary'}`} />
                <div className="text-left">
                  <p className="font-medium text-sm">{action.label}</p>
                  {action.count !== undefined && (
                    <p className="text-xs text-muted-foreground">{action.count} items</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
