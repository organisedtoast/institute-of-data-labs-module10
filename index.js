// This is the server-side code for a simple chat application using Express and Socket.IO.
// It sets up an Express server, serves static files from the 'public' directory, 
// and listens for new socket connections to broadcast a message when a user connects.

// Import the required modules
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');
 
// 1. Create the Express app
const app = express();
 
// 2. Wrap it in a plain HTTP server
const server = http.createServer(app);
 
// 3. Attach Socket.IO to that HTTP server
const io = new Server(server);

// This object stores the users who are currently connected.
// The key is the unique socket id, and the value is that user's nickname.
// Example: { "abc123": "Alice", "def456": "Bob" }
const onlineUsers = {};
 
// 4. Serve your public/ folder automatically
app.use(express.static(path.join(__dirname, 'public')));
 
// 5. Listen for new socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.nickname = 'Anonymous';

  socket.emit('connection message', 'Connected to the chat server');
  socket.emit('online users', Object.values(onlineUsers));

  socket.on('set nickname', (name) => {
    const nextNickname = typeof name === 'string' ? name.trim() : '';
    const previousNickname = socket.nickname;
    socket.nickname = nextNickname || 'Anonymous';

    // Store or update this user in the online users list.
    // We use socket.id as the key because every connection has its own unique id.
    onlineUsers[socket.id] = socket.nickname;

    // Only show the "joined" message the first time this socket chooses a name.
    // If they change from one nickname to another later, show a rename message instead.
    if (previousNickname === 'Anonymous' && !(socket.hasJoinedAnnounced)) {
      socket.hasJoinedAnnounced = true;
      io.emit('system message', `${socket.nickname} joined the chat`);
    } else if (previousNickname !== socket.nickname) {
      io.emit('system message', `${previousNickname} is now known as ${socket.nickname}`);
    }

    // Send the refreshed list of online users to every connected browser.
    io.emit('online users', Object.values(onlineUsers));
  });

  socket.on('chat message', (text) => {
    const messageText = typeof text === 'string' ? text.trim() : '';
    if (messageText === '') return;

    // If the user sends a message, they have finished typing.
    // Tell everyone else to remove the typing indicator.
    socket.broadcast.emit('stop typing');

    io.emit('chat message', {
      user: socket.nickname,
      text: messageText
    });
  });

  // When this user starts typing, tell every other connected user.
  // We use socket.broadcast.emit so the sender does not see their own typing message.
  socket.on('typing', () => {
    socket.broadcast.emit('typing', `${socket.nickname} is typing...`);
  });

  // When this user stops typing, tell every other connected user
  // to clear the typing message from the screen.
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });

  socket.on('disconnect', () => {
    const departingUser = onlineUsers[socket.id] || socket.nickname;

    // Remove this user from the online users list because they are leaving.
    delete onlineUsers[socket.id];

    // If the user leaves while typing, remove the typing indicator first.
    socket.broadcast.emit('stop typing');

    // Tell everyone that the user left, then send the updated sidebar list.
    io.emit('system message', `${departingUser} left the chat`);
    io.emit('online users', Object.values(onlineUsers));
  });
});
 
// 6. Start the server
server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});

