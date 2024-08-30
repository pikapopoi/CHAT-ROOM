const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const muteBtn = document.getElementById('muteBtn');
const status = document.getElementById('status');

let localStream;
let peerConnection;
let isMuted = false;

const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Public STUN server
    ]
};

joinBtn.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setupPeerConnection();
        joinBtn.disabled = true;
        leaveBtn.disabled = false;
        muteBtn.disabled = false;
        status.textContent = "You are connected to the chat.";
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
});

leaveBtn.addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
    }
    localStream.getTracks().forEach(track => track.stop());
    resetUI();
});

muteBtn.addEventListener('click', () => {
    if (localStream) {
        isMuted = !isMuted;
        localStream.getTracks()[0].enabled = !isMuted;
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    }
});

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.addStream(localStream);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send ICE candidate to the server
            signalingServer.send(JSON.stringify({ ice: event.candidate }));
        }
    };

    // Handle incoming tracks
    peerConnection.onaddstream = event => {
        // Here you could handle the incoming audio stream
    };

    // Handle signaling messages
    signalingServer.onmessage = async message => {
        const data = JSON.parse(message.data);
        if (data.offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            signalingServer.send(JSON.stringify({ answer }));
        } else if (data.answer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.ice) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
            } catch (err) {
                console.error('Error adding received ICE candidate', err);
            }
        }
    };
}

function resetUI() {
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
    muteBtn.disabled = true;
    status.textContent = "You are not connected to the chat.";
}
