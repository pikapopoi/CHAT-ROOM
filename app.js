const socket = io();

const messageInput = document.getElementById('message');
const output = document.getElementById('output');
const nicknameInput = document.getElementById('nickname');
const sendButton = document.getElementById('send');

sendButton.addEventListener('click', () => {
    const nickname = nicknameInput.value;
    const message = messageInput.value;
    if (nickname && message) {
        socket.emit('chatMessage', { nickname, message });
        messageInput.value = '';
    }
});

socket.on('chatMessage', (data) => {
    output.innerHTML += `<p><strong>${data.nickname}: </strong>${data.message}</p>`;
    output.scrollTop = output.scrollHeight;
});
