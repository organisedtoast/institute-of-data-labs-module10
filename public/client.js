// This file is for the client side of the application.

// It will be served to the browser and will run in the browser environment.

// We will use Socket.IO to connect to the server and listen for messages.
// We need to include the Socket.IO client library in our HTML file, which will provide the `io()` function to connect to the server.
// The server will emit a 'connection message' event when a client connects, 
// and we will listen for that event and display the message in the browser.


// Connect to the server (io() is provided by socket.io.js above)
const socket = io();
 
const messages = document.getElementById('messages');
const status = document.getElementById('status');
const usersList = document.getElementById('users');
 
// Listen for the connection message from the server
socket.on('connection message', (msg) => {
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
});

// Send and receive chat messages
const form     = document.getElementById('chat-form');
const input    = document.getElementById('message-input');
let typingTimeout;
 
// When user submits the form...
form.addEventListener('submit', (e) => {
  e.preventDefault();  // stops the page from refreshing
 
  const message = input.value.trim();
  if (message === '') return;  // don't send empty messages
 
  // Send the message text to the server.
  // The server will attach the sender's nickname before sharing it with everyone.
  socket.emit('chat message', message);

  // Once the message has been sent, this user is no longer "typing".
  // We tell the server to remove the typing indicator for other users.
  socket.emit('stop typing');
  clearTimeout(typingTimeout);
  
  input.value = '';
});

// Every time the user types in the input box, tell the server.
// This lets other people in the chat know that someone is currently typing.
input.addEventListener('input', () => {
  // If the input is empty, stop showing the typing message.
  if (input.value.trim() === '') {
    socket.emit('stop typing');
    clearTimeout(typingTimeout);
    return;
  }

  // Tell the server which user is currently typing.
  socket.emit('typing');

  // If the user presses another key before 1 second passes,
  // this clears the old timer so we can start a fresh 1-second wait.
  clearTimeout(typingTimeout);

  // If the user stops typing for 1 second, tell the server to hide the message.
  typingTimeout = setTimeout(() => {
    socket.emit('stop typing');
  }, 1000);
});
 
// When a chat message arrives from the server...
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.textContent = `${data.user}: ${data.text}`;
  messages.appendChild(li);
});

// Listen for system messages (like another user joined/ left)
socket.on('system message', (msg) => {
  const li = document.createElement('li');
  li.textContent = msg;
  li.style.fontStyle = 'italic';
  li.style.color = '#888';
  messages.appendChild(li);
});

// Replace the sidebar list with the latest set of online users.
// The server sends us an array such as ["Alice", "Bob"].
socket.on('online users', (users) => {
  // Remove the old list items first so we can rebuild the list from scratch.
  usersList.innerHTML = '';

  // Create one <li> element for each connected user's name.
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
});

// Show a short status message such as "Alice is typing..."
// when the server tells us another user is typing.
socket.on('typing', (msg) => {
  status.textContent = msg;
});

// Clear the status message when typing has stopped.
socket.on('stop typing', () => {
  status.textContent = '';
});

// Ask for name on load and send it to the server

// Ask for nickname when page loads
let nickname = prompt('Enter your nickname:');
 
if (!nickname || nickname.trim() === '') {
  nickname = 'Anonymous';
}
nickname = nickname.trim();
 
// Send it to the server straight away
socket.emit('set nickname', nickname);

