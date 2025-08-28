import { pb } from '@/queries/client';
import InCallManager from 'react-native-incall-manager';
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription
} from 'react-native-webrtc';
pb.autoCancellation(false);

const calls = pb.collection('calls');
const offerCandidates = pb.collection('offer_candidates');
const answerCandidates = pb.collection('answer_candidates');

export const acceptCall = async (callId: string, onNewTrack?: (event: any) => void) => {

  // Get ICE servers
  const config = {
    iceServers: [{
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302"
      ]
    }],
    iceCandidatePoolSize: 10,
  };

  // Create PeerConnection
  const pc = new RTCPeerConnection(config);
  console.log('created peer connection')

  // Setup local stream (mic only)
  const localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: { min: 640, ideal: 1280 },
      height: { min: 480, ideal: 720 },
      frameRate: { min: 16, ideal: 60 }
    },
  });
  console.log('created localStream')
  // Add local audio tracks
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });
  console.log('created remoteStream')
  const remoteStream = new MediaStream()

  // Setup remote stream
  InCallManager.start({ media: 'video' });
  console.log('started incallmanager video');

  pc.addEventListener('track', (event) => {
    if (onNewTrack) {
      onNewTrack(event)
    }
    event.streams[0]?.getTracks().forEach(track => {
      console.log(track, 'track')
      remoteStream.addTrack(track);
    });
    if (event.streams && event.streams[0]) {
      InCallManager.setForceSpeakerphoneOn(true);
    }

    // TODO: pass remoteStream to your app’s audio playback logic
    // e.g., setRemoteStream(remoteStream) in your state
  });
  pc.addEventListener('iceconnectionstatechange',(event) => {
    console.log(event, 'connection state changed', pc.connectionState)
  });

  // Handle answer ICE candidates
  pc.addEventListener('icecandidate', async (event) => {
    if (event.candidate) {
      console.log('creating answer Candidates')
      await answerCandidates.create({
        call_id: callId,
        data: event.candidate.toJSON(),
      });
    }
  })

  console.log('get call record')
  // Get call record with offer
  let call;
  try {
    call = await calls.getOne(callId);
  } catch (error){
    console.log(error)
  }
  console.log('set offer description')
  if (call) {
    const offerDescription = new RTCSessionDescription(call.offer);
    await pc.setRemoteDescription(offerDescription);
  }
  
  // Create and send answer
  console.log('create answer ')
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  console.log('update call record');
  await calls.update(callId, {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
    status: 'CONNECTED'
  });

  console.log('subscribe to offerCandidates');
  const addedCandidates = new Set<string>();
  const addIceCandidate = async (candidateData: any, source: string) => {
    const candidateKey = JSON.stringify(candidateData);
    
    if (addedCandidates.has(candidateKey)) {
      console.log(`🔄 Skipping duplicate candidate from ${source}`);
      return;
    }
    try {
      const candidate = new RTCIceCandidate(candidateData);
      await pc.addIceCandidate(candidate);
      addedCandidates.add(candidateKey);
      console.log(`✅ Added ICE candidate from ${source}`);
    } catch (error) {
      console.error(`❌ Error adding candidate from ${source}:`, error);
    }
  };
  // Subscribe to caller's ICE candidates
  pb.collection('offer_candidates').subscribe('*', (e) => {
    console.log('any offer candidates', e.action, e.record.call_id, callId)
    if (e.action === 'create' && e.record.call_id === callId) {
      console.log('got new offer candidates')
      const candidate = new RTCIceCandidate(e.record.data);
      addIceCandidate(candidate, 'subscription');
    }
  });
  pb.collection('offer_candidates').getFullList({
    filter: `call_id = '${callId}'`
  }).then(data => {
    console.log('offer_candidates', data.length)
    if (data.length) {
      data.forEach(item => {
        const candidate = new RTCIceCandidate(item.data);
        addIceCandidate(candidate, 'existing');
      })
    }
  })

  return {
    peerConnection: pc,
    localStream,
    remoteStream,
  };
};
