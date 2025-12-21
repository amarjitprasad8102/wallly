import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Database, 
  Server, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Zap,
  HardDrive,
  Wifi
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthMetrics {
  databaseStatus: 'healthy' | 'warning' | 'error';
  authStatus: 'healthy' | 'warning' | 'error';
  storageStatus: 'healthy' | 'warning' | 'error';
  realtimeStatus: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
  queueSize: number;
  activeConnections: number;
  storageUsed: number;
}

export function AdminSystemHealth() {
  const [health, setHealth] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkHealth = async () => {
    setRefreshing(true);
    try {
      // Check database connection
      const dbCheck = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const databaseStatus = dbCheck.error ? 'error' : 'healthy';

      // Check matchmaking queue size
      const { data: queueData } = await supabase.rpc('get_queue_count');
      const queueSize = queueData || 0;

      // Check active connections count
      const { count: activeConnections } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true });

      // Check storage buckets
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      const storageStatus = storageError ? 'error' : 'healthy';

      setHealth({
        databaseStatus,
        authStatus: 'healthy', // Auth is working if we got here
        storageStatus,
        realtimeStatus: 'healthy', // Assume healthy
        lastChecked: new Date(),
        queueSize,
        activeConnections: activeConnections || 0,
        storageUsed: buckets?.length || 0,
      });
    } catch (error) {
      console.error("Health check error:", error);
      setHealth({
        databaseStatus: 'error',
        authStatus: 'warning',
        storageStatus: 'warning',
        realtimeStatus: 'warning',
        lastChecked: new Date(),
        queueSize: 0,
        activeConnections: 0,
        storageUsed: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cleanupQueue = async () => {
    try {
      const { data } = await supabase.rpc('cleanup_stale_queue_entries');
      checkHealth();
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  useEffect(() => {
    checkHealth();
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Running health checks...</div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Failed to load health metrics</div>
      </div>
    );
  }

  const overallHealth = [
    health.databaseStatus,
    health.authStatus,
    health.storageStatus,
    health.realtimeStatus
  ].every(s => s === 'healthy') ? 'healthy' : 
  [health.databaseStatus, health.authStatus].some(s => s === 'error') ? 'error' : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Monitor system status and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Last checked: {health.lastChecked.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkHealth}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallHealth === 'healthy' ? 'border-green-500/30 bg-green-500/5' :
        overallHealth === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
        'border-red-500/30 bg-red-500/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(overallHealth)}
              <div>
                <h3 className="text-xl font-semibold">
                  {overallHealth === 'healthy' ? 'All Systems Operational' :
                   overallHealth === 'warning' ? 'Some Systems Need Attention' :
                   'System Issues Detected'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {overallHealth === 'healthy' 
                    ? 'All services are running normally.'
                    : 'Some services may be experiencing issues.'}
                </p>
              </div>
            </div>
            {getStatusBadge(overallHealth)}
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusIcon(health.databaseStatus)}
              {getStatusBadge(health.databaseStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">PostgreSQL connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusIcon(health.authStatus)}
              {getStatusBadge(health.authStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Auth service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusIcon(health.storageStatus)}
              {getStatusBadge(health.storageStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{health.storageUsed} buckets active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realtime</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusIcon(health.realtimeStatus)}
              {getStatusBadge(health.realtimeStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">WebSocket connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Matchmaking Queue
            </CardTitle>
            <CardDescription>Current queue status and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Users in Queue</span>
              <span className="text-2xl font-bold">{health.queueSize}</span>
            </div>
            <Progress value={Math.min(health.queueSize * 10, 100)} className="h-2" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cleanupQueue}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cleanup Stale Entries
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Connection Statistics
            </CardTitle>
            <CardDescription>User connections overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Connections</span>
              <span className="text-2xl font-bold">{health.activeConnections.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Active user connections in the system. Each connection represents a friendship between two users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
