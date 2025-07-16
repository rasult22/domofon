// import PB, {
//   RecordAuthResponse,
//   RecordModel,
//   RecordService,
//   UnsubscribeFunc,
// } from "pocketbase";

// import {
//   MediaStream,
//   RTCIceCandidate,
//   RTCPeerConnection,
//   mediaDevices,
// } from 'react-native-webrtc';


// export class WebRTCNativeClient {
//   pb = new PB("https://rasult22.pockethost.io");
//   user_id: string | null = null;
//   unsubscribe: UnsubscribeFunc | null = null;
//   calls: RecordService<RecordModel> = this.pb.collection("calls");
//   offer_candidates: RecordService<RecordModel> =
//     this.pb.collection("offer_candidates");
//   answer_candidates: RecordService<RecordModel> =
//     this.pb.collection("answer_candidates");
//   auth: RecordAuthResponse<RecordModel> | null = null;
//   ice_servers: RecordModel[] | null = null;
//   servers: {
//     iceServers: {
//       urls: string[];
//     }[];
//     iceCandidatePoolSize: number;
//   } | null = null;
//   pc: (RTCPeerConnection) | null = null;

//   localMediaStream: MediaStream | null = null;
//   remoteMediaStream: MediaStream | null = null;

//   constructor() {
//     // this.setup();
//   }

//   async setup() {
//     console.log('setup begin')
//     try {

//       this.auth = await this.pb
//         .collection("users")
//         .authWithPassword("webrtc_native", "12345678");
//       this.user_id = this.auth.record.id;
//       this.ice_servers = await this.pb.collection("ice_servers").getFullList();
//       this.servers = {
//         iceServers: [{ urls: this.ice_servers.map((e) => e.url as string) }],
//         iceCandidatePoolSize: 10,
//       };
//       this.pc = new RTCPeerConnection(this.servers) as RTCPeerConnection &
//         EventTarget;
      
//       const myCalls = await this.calls.getFullList({
//         filter: `receiver_id = '${this.user_id}' && status = 'pending'`, 
//       })


//       console.log(myCalls, 'myCalls')
  
//       await this.calls.subscribe(
//         "*",
//         async (e) => {
//           console.log("received call", e);
//           if (e.action === "create") {
//             await this.startLocalMediaStream();
//             await this.onCallAccept(e.record);
//           }
//         },
//         {
//           filter: `receiver_id = "${this.user_id}" AND status = "pending"`,
//         }
//       );
//     } catch (e) {
//       console.log('error happened', e)
//     }
//   }

//   clean() {
//     this.calls.unsubscribe();
//     this.offer_candidates.unsubscribe();
//     this.answer_candidates.unsubscribe();
//   }

//   async startLocalMediaStream() {
//     try {
//       const mediaStream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: false,
//       });
//       const videoTrack = await mediaStream.getVideoTracks()[0];
//       videoTrack.enabled = false;

//       this.localMediaStream = mediaStream;

//       this.localMediaStream.getTracks().forEach((track) => {
//         if (this.pc && this.localMediaStream) {
//           this.pc.addTrack(track, this.localMediaStream);
//         }
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   }
//   async onCallAccept(
//     call: {
//       user_id: string;
//       offer: any;
//       answer: any;
//       receiver_id: string;
//       status: string;
//     } & RecordModel
//   ) {
//     if (!this.pc) return;
//     console.log("starting accepting call with callId", call);
//     this.pc.addEventListener("icecandidate", async (event) => {
//       if (event.candidate) {
//         console.log("event candidate", event.candidate);
//         await this.pb.collection("answer_candidates").create({
//           call_id: call.id,
//           candidate: JSON.stringify(event.candidate),
//         });
//       }
//     });

//     await this.pc.setRemoteDescription(
//       new RTCSessionDescription({
//         type: "offer",
//         sdp: call.offer.sdp,
//       })
//     );

//     const answer = await this.pc.createAnswer();
//     await this.pc.setLocalDescription(answer);

//     await this.pb.collection("calls").update(call.id, {
//       answer: {
//         type: answer.type,
//         sdp: answer.sdp,
//       },
//     });
//     this.offer_candidates.subscribe("*", async (e) => {
//       const data = e.record;

//       if (data.call_id === call.id) {
//         const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
//         await this.pc?.addIceCandidate(candidate);
//       }
//     });
//   }
// }
