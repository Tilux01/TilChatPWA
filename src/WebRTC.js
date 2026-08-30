let peerConnection = null;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all'
};

export async function createOffer(localStream, onTrack, onIceCandidate) {
  // Close existing connection
  if (peerConnection) {
    peerConnection.close();
  }
  
  peerConnection = new RTCPeerConnection(config);
  
  console.log("Creating offer with stream tracks:", localStream.getTracks().length);
  
  // CRITICAL: Add tracks FIRST (just like vanilla)
  localStream.getTracks().forEach(track => {
    console.log(`Adding ${track.kind} track to peer connection`);
    peerConnection.addTrack(track, localStream);
  });
  
  // Handle incoming remote stream - SIMPLIFIED like vanilla
  peerConnection.ontrack = (event) => {
    console.log("Remote track received:", event.track.kind);
    
    if (event.streams && event.streams.length > 0) {
      // Pass the FIRST stream directly (like vanilla does)
      onTrack(event.streams[0]);
    }
  };
  
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };
  
  // Create offer AFTER adding tracks
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  
  return offer;
}


export async function createAnswer(
  offer,
  localStream,
  onTrack,
  onIceCandidate
) {
  peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track =>{
    peerConnection.addTrack(track, localStream)
  });

  peerConnection.ontrack = (e) => {
    onTrack(e.streams[0]);
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) onIceCandidate(e.candidate);
  };

  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  return answer; // SEND BACK TO CALLER
}

/**
 * 3. Close call
 */
export function closeConnection() {
  if (!peerConnection) return;

  peerConnection.getSenders().forEach(sender => sender.track?.stop());
  peerConnection.close();
  peerConnection = null;
}

/**
 * Extra: needed on BOTH sides
 */
export async function addIceCandidate(candidate) {
  if (peerConnection) {
    await peerConnection.addIceCandidate(candidate);
  }
}
export async function setRemoteAnswer(answer) {
  if (!peerConnection) {
    throw new Error("PeerConnection not initialized");
  }
  await peerConnection.setRemoteDescription(answer);
}
