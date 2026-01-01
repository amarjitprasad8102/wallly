import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionStats {
  latency: number;
  packetLoss: number;
  bitrate: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

interface ConnectionQualityIndicatorProps {
  peerConnection: RTCPeerConnection | null;
  isConnected: boolean;
}

const ConnectionQualityIndicator = ({ peerConnection, isConnected }: ConnectionQualityIndicatorProps) => {
  const [stats, setStats] = useState<ConnectionStats>({
    latency: 0,
    packetLoss: 0,
    bitrate: 0,
    connectionQuality: 'disconnected'
  });

  useEffect(() => {
    if (!peerConnection || !isConnected) {
      setStats(prev => ({ ...prev, connectionQuality: 'disconnected' }));
      return;
    }

    let lastBytesReceived = 0;
    let lastTimestamp = Date.now();
    let lastPacketsLost = 0;
    let lastPacketsReceived = 0;

    const pollStats = async () => {
      try {
        const statsReport = await peerConnection.getStats();
        let currentLatency = 0;
        let currentPacketLoss = 0;
        let bytesReceived = 0;
        let packetsLost = 0;
        let packetsReceived = 0;

        statsReport.forEach((report) => {
          // Get RTT from candidate-pair
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            currentLatency = report.currentRoundTripTime 
              ? Math.round(report.currentRoundTripTime * 1000) 
              : 0;
          }

          // Get packet stats from inbound-rtp
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            bytesReceived += report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
            packetsReceived += report.packetsReceived || 0;
          }
        });

        // Calculate bitrate
        const now = Date.now();
        const timeDiff = (now - lastTimestamp) / 1000;
        const bytesDiff = bytesReceived - lastBytesReceived;
        const bitrate = timeDiff > 0 ? Math.round((bytesDiff * 8) / timeDiff / 1000) : 0; // kbps

        // Calculate packet loss percentage
        const packetsDiff = packetsReceived - lastPacketsReceived;
        const lostDiff = packetsLost - lastPacketsLost;
        if (packetsDiff > 0 || lostDiff > 0) {
          currentPacketLoss = Math.round((lostDiff / (packetsDiff + lostDiff)) * 100) || 0;
        }

        // Update last values
        lastBytesReceived = bytesReceived;
        lastTimestamp = now;
        lastPacketsLost = packetsLost;
        lastPacketsReceived = packetsReceived;

        // Determine quality
        let quality: ConnectionStats['connectionQuality'] = 'excellent';
        if (currentLatency > 300 || currentPacketLoss > 10) {
          quality = 'poor';
        } else if (currentLatency > 150 || currentPacketLoss > 5) {
          quality = 'fair';
        } else if (currentLatency > 50 || currentPacketLoss > 1) {
          quality = 'good';
        }

        setStats({
          latency: currentLatency,
          packetLoss: Math.max(0, currentPacketLoss),
          bitrate,
          connectionQuality: quality
        });
      } catch (error) {
        console.error('[ConnectionQuality] Error getting stats:', error);
      }
    };

    // Poll every 2 seconds
    pollStats();
    const interval = setInterval(pollStats, 2000);

    return () => clearInterval(interval);
  }, [peerConnection, isConnected]);

  const getQualityIcon = () => {
    if (!isConnected || stats.connectionQuality === 'disconnected') {
      return <WifiOff className="w-4 h-4 text-destructive" />;
    }

    switch (stats.connectionQuality) {
      case 'excellent':
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'good':
        return <SignalMedium className="w-4 h-4 text-green-400" />;
      case 'fair':
        return <SignalLow className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <Signal className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getQualityColor = () => {
    switch (stats.connectionQuality) {
      case 'excellent': return 'bg-green-500/10 border-green-500/30 text-green-600';
      case 'good': return 'bg-green-400/10 border-green-400/30 text-green-500';
      case 'fair': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600';
      case 'poor': return 'bg-red-500/10 border-red-500/30 text-red-600';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${getQualityColor()}`}>
            {getQualityIcon()}
            <span className="hidden sm:inline capitalize">
              {isConnected ? stats.connectionQuality : 'Offline'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-1">
            <p className="font-medium capitalize">{stats.connectionQuality} Connection</p>
            <div className="flex gap-4 text-muted-foreground">
              <span>Latency: {stats.latency}ms</span>
              <span>Loss: {stats.packetLoss}%</span>
              {stats.bitrate > 0 && <span>Bitrate: {stats.bitrate} kbps</span>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionQualityIndicator;
