import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWebRTC = (
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
) => {
  const { toast } = useToast();
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // If a peer connection already exists, add/replace tracks and trigger renegotiation
      if (peerConnection.current) {
        const pc = peerConnection.current;
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          const existing = senders.find((s) => s.track?.kind === track.kind);
          if (existing) {
            existing.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Camera/Microphone Error',
        description: 'Please allow access to your camera and microphone',
        variant: 'destructive',
      });
      throw error;
    }
  }, [localVideoRef, toast]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });
    }

    peerConnection.current = pc;
    return pc;
  }, [remoteVideoRef, onConnectionStateChange]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current) return null;
    const offer = await peerConnection.current.createOffer();
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

  const toggleAudio = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localVideoRef, remoteVideoRef]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    peerConnection: peerConnection.current,
    initializeLocalStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};
