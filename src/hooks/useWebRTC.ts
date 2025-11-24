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

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      onRemoteStream?.(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  }, [onConnectionStateChange, onRemoteStream]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current) return null;
    const offer = await peerConnection.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.current.setLocalDescription(offer);
    return offer;
  }, []);

  const createAnswer = useCallback(async () => {
    if (!peerConnection.current) return null;
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    return answer;
  }, []);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    const pc = peerConnection.current;
    await pc.setRemoteDescription(new RTCSessionDescription(description));
    // Flush any queued ICE candidates now that remote description is set
    if (pendingIceCandidates.current.length) {
      for (const c of pendingIceCandidates.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (err) {
          console.error('Error flushing ICE candidate:', err);
        }
      }
      pendingIceCandidates.current = [];
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    try {
      if (!candidate || !candidate.candidate) return;
      const pc = peerConnection.current;
      
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        console.log('Queueing ICE candidate (no remote description yet)');
        pendingIceCandidates.current.push(candidate);
        return;
      }
      
      console.log('Adding ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
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
      console.log('Media devices accessed successfully:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
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
            params.encodings[0].maxBitrate = isMobile ? 300000 : 600000; // 300 kbps for mobile, 600 kbps for desktop
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
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
  };
};
