import PocketBase from 'pocketbase';
import InCallManager from 'react-native-incall-manager';
import {
  mediaDevices,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription
} from 'react-native-webrtc';
const pb = new PocketBase('https://rasult22.pockethost.io');
pb.autoCancellation(false);

const calls = pb.collection('calls');
const offerCandidates = pb.collection('offer_candidates');
const answerCandidates = pb.collection('answer_candidates');

export const acceptCall = async (callId: string) => {
  // Authenticate
  const auth = await pb
  .collection('users')
  .authWithPassword('webrtc_native', '12345678');
  
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

  // Setup local stream (mic only)
  const localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  // Add local audio tracks
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // Setup remote stream
  // const remoteStream = new MediaStream();
  InCallManager.start();
  
  pc.addEventListener('track', (event) => {
    // event.streams[0]?.getTracks().forEach(track => {
    //   console.log(track, 'track')
    //   remoteStream.addTrack(track);
    // });
    if (event.streams && event.streams[0]) {
      InCallManager.setForceSpeakerphoneOn(false);
    }

    // TODO: pass remoteStream to your app’s audio playback logic
    // e.g., setRemoteStream(remoteStream) in your state
  });
  pc.addEventListener('iceconnectionstatechange',(event) => {
    console.log(event, 'connection state changed', pc.connectionState)
  });

  // Handle answer ICE candidates
  pc.addEventListener('icecandidate', async (event) => {
    console.log('we got ice candidate', event)
    if (event.candidate) {
      console.log('creating answer Candidates')
      await answerCandidates.create({
        call_id: callId,
        data: event.candidate.toJSON(),
      });
    }
  })

  // Get call record with offer
  const call = await calls.getOne(callId);
  const offerDescription = new RTCSessionDescription(call.offer);
  await pc.setRemoteDescription(offerDescription);

  // Create and send answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await calls.update(callId, {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  });

  // Subscribe to caller's ICE candidates
  offerCandidates.subscribe('*', (e) => {
    if (e.action === 'create' && e.record.call_id === callId) {
      const candidate = new RTCIceCandidate(e.record.data);
      pc.addIceCandidate(candidate);
    }
  });

  return {
    peerConnection: pc,
    localStream,
    // remoteStream,
  };
};
