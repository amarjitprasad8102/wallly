import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWebRTC = (
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
  onRemoteStream?: (stream: MediaStream) => void
) => {
  const { toast } = useToast();
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
  const localStream = useRef<MediaStream | null>(null);
  const connectionTimeout = useRef<NodeJS.Timeout | null>(null);

  const createPeerConnection = useCallback(() => {
    // Cleanup existing connection if any
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }
    pendingIceCandidates.current = [];

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Free TURN servers for better connectivity
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all',
    });

    let disconnectedTimeout: NodeJS.Timeout | null = null;

    // Set a connection timeout - if not connected in 15 seconds, fail
    connectionTimeout.current = setTimeout(() => {
      if (pc.connectionState !== 'connected') {
        console.log('[WebRTC] Connection timeout after 15 seconds');
        onConnectionStateChange?.('failed');
      }
    }, 15000);

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      // Handle ICE connection failures - attempt restart for recoverable states
      if (pc.iceConnectionState === 'failed') {
        console.log('[WebRTC] ICE connection failed, attempting ICE restart...');
        pc.restartIce();
      }
      // If checking takes too long, the gathering might be stuck
      if (pc.iceConnectionState === 'checking') {
        setTimeout(() => {
          if (pc.iceConnectionState === 'checking') {
            console.log('[WebRTC] ICE checking timeout, may need TURN server');
          }
        }, 5000);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state:', pc.signalingState);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      
      // Clear any pending timeout
      if (disconnectedTimeout) {
        clearTimeout(disconnectedTimeout);
        disconnectedTimeout = null;
      }

      if (pc.connectionState === 'connected') {
        console.log('[WebRTC] Connection established successfully');
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
        onConnectionStateChange?.(pc.connectionState);
      } else if (pc.connectionState === 'connecting') {
        onConnectionStateChange?.(pc.connectionState);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        console.log('[WebRTC] Connection ended:', pc.connectionState);
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
        onConnectionStateChange?.(pc.connectionState);
      } else if (pc.connectionState === 'disconnected') {
        console.log('[WebRTC] Connection temporarily disconnected, waiting for recovery...');
        // Set a timeout - if not recovered in 8 seconds, notify as failed
        disconnectedTimeout = setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            console.log('[WebRTC] Connection did not recover, notifying as failed');
            onConnectionStateChange?.('failed');
          }
        }, 8000);
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind, event.streams[0]);
      if (event.streams[0]) {
        onRemoteStream?.(event.streams[0]);
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [onConnectionStateChange, onRemoteStream]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current) {
      console.error('[WebRTC] No peer connection for createOffer');
      return null;
    }
    try {
      console.log('[WebRTC] Creating offer...');
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      console.log('[WebRTC] Setting local description (offer)...');
      await peerConnection.current.setLocalDescription(offer);
      console.log('[WebRTC] Offer created and set');
      return offer;
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
      return null;
    }
  }, []);

  const createAnswer = useCallback(async () => {
    if (!peerConnection.current) {
      console.error('[WebRTC] No peer connection for createAnswer');
      return null;
    }
    try {
      console.log('[WebRTC] Creating answer...');
      const answer = await peerConnection.current.createAnswer();
      console.log('[WebRTC] Setting local description (answer)...');
      await peerConnection.current.setLocalDescription(answer);
      console.log('[WebRTC] Answer created and set');
      return answer;
    } catch (error) {
      console.error('[WebRTC] Error creating answer:', error);
      return null;
    }
  }, []);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) {
      console.error('[WebRTC] No peer connection for setRemoteDescription');
      return;
    }
    try {
      const pc = peerConnection.current;
      console.log('[WebRTC] Setting remote description, type:', description.type);
      await pc.setRemoteDescription(new RTCSessionDescription(description));
      console.log('[WebRTC] Remote description set successfully');
      
      // Flush any queued ICE candidates now that remote description is set
      if (pendingIceCandidates.current.length > 0) {
        console.log('[WebRTC] Flushing', pendingIceCandidates.current.length, 'queued ICE candidates');
        for (const c of pendingIceCandidates.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (err) {
            console.error('[WebRTC] Error flushing ICE candidate:', err);
          }
        }
        pendingIceCandidates.current = [];
      }
    } catch (error) {
      console.error('[WebRTC] Error setting remote description:', error);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) {
      console.warn('[WebRTC] No peer connection for addIceCandidate');
      return;
    }
    try {
      if (!candidate || !candidate.candidate) {
        console.log('[WebRTC] Empty ICE candidate received (end of candidates)');
        return;
      }
      const pc = peerConnection.current;
      
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        console.log('[WebRTC] Queueing ICE candidate (no remote description yet)');
        pendingIceCandidates.current.push(candidate);
        return;
      }
      
      console.log('[WebRTC] Adding ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }, []);


  const addLocalStream = useCallback(async () => {
    try {
      console.log('Requesting media devices...');
      
      // Detect mobile device
      const isMobile = window.innerWidth < 768;
      
      // Set video constraints based on device
      const videoConstraints = isMobile 
        ? {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 20, max: 25 }
          }
        : {
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 },
            frameRate: { ideal: 25, max: 30 }
          };
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('[WebRTC] Media devices accessed successfully:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoSettings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      localStream.current = stream;
      
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', track.kind);
          const sender = peerConnection.current?.addTrack(track, stream);
          
          // Optimize video encoding parameters
          if (track.kind === 'video' && sender) {
            const isMobile = window.innerWidth < 768;
            const params = sender.getParameters();
            if (!params.encodings) {
              params.encodings = [{}];
            }
            // Lower bitrate for mobile devices
            params.encodings[0].maxBitrate = isMobile ? 500000 : 800000; // 500 kbps for mobile, 800 kbps for desktop
            params.encodings[0].scaleResolutionDownBy = 1;
            sender.setParameters(params).catch(err => 
              console.error('Error setting encoding params:', err)
            );
          }
        });
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Could not access camera or microphone. Please allow permissions.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const cleanup = useCallback(() => {
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingIceCandidates.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Expose peerConnection for stats access
  const getPeerConnection = useCallback(() => peerConnection.current, []);

  return {
    peerConnection,
    localStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    addLocalStream,
    cleanup,
    getPeerConnection,
  };
};
