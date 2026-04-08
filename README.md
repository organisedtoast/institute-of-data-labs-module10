# Socket.IO Chat App — A Beginner's Guide to Real-Time Communication

Welcome! This project is a **real-time chat application** built with Node.js, Express, and Socket.IO. It is designed to teach you the **foundations of socket-based communication** — the same technology behind live notifications, multiplayer games, and collaborative tools.

### What Are "Sockets" In Plain English?

Normally, when you visit a website, your browser sends **one request** and the server sends **one response**. After that, the conversation is over. If the page needs new data, the browser has to ask again (think of refreshing a news feed).

**Sockets change that.** With Socket.IO, your browser and the server open a **persistent, two-way connection**. Once connected, either side can send small packets of data — called **events** — at any time, without the user having to refresh the page. That is what makes chat messages appear instantly.

---

## What This App Does

When you run this app you get a fully functional chat with:

- **Live chat messages** — messages typed in one browser tab appear instantly in every other connected tab.
- **Nickname selection** — a prompt asks for your name when the page loads. If you skip it, you become `Anonymous`.
- **Join / leave / rename notifications** — the server broadcasts system messages like *"Alice joined the chat"* or *"Bob is now known as Charlie"*.
- **Typing indicator** — when someone is typing, other users see a brief status line like *"Alice is typing..."*.
- **Online users sidebar** — a live list of everyone currently connected, updated in real time.

---

## How To Start The App

### Step 1 — Open your terminal

Open a terminal (Command Prompt, PowerShell, or any terminal you prefer).

### Step 2 — Navigate to the project folder

```
cd institute-of-data-labs/module9/exercise5
```

### Step 3 — Install dependencies

```
npm install
```

This downloads the packages the app needs: **Express**, **Socket.IO**, and **nodemon**. They are listed in `package.json` and saved into a `node_modules/` folder.

### Step 4 — Start the server

You have two options:

**Option A — Development mode (recommended while learning):**

```
npm run dev
```

This runs the app with **nodemon**. Nodemon watches your files and **automatically restarts the server** whenever you save a change. This saves you from manually stopping and restarting the server every time you edit a file.

**Option B — Normal run mode:**

```
npm start
```

This runs the app with plain **node**. It works exactly the same, but it will **not** restart automatically if you change a file. You would need to stop it (`Ctrl + C`) and run `npm start` again to pick up changes.

### Step 5 — Open your browser

Visit:

```
http://localhost:3000
```

You will see a prompt asking for your nickname. Enter one (or press OK to stay `Anonymous`), and you are in the chat!

### Step 6 — Test with multiple tabs

To see real-time updates, open **a second browser tab** (or a different browser) and go to `http://localhost:3000` again. Type a message in one tab and watch it appear in the other instantly.

---

## Project Structure

```
exercise5/
├── index.js              ← Server-side code (runs in Node.js)
├── package.json          ← Lists dependencies and available scripts
├── package-lock.json     ← Exact versions of every installed dependency
└── public/               ← All browser files (served to the user)
    ├── index.html        ← The page you see in the browser
    ├── client.js         ← Browser-side JavaScript (handles Socket.IO on the client)
    └── style.css         ← Styling for the chat layout
```

**Important distinction:** `index.js` runs on the **server** (your computer, via Node.js). Everything inside `public/` runs in the **browser** (Chrome, Firefox, etc.). The server's job is to deliver those `public/` files to the browser and manage real-time communication between connected users.

---

## How The App Works — A Step-By-Step Walkthrough

Here is what happens from the moment you start the server to the moment you send a message:

1. **You run `npm run dev`** — Node.js executes `index.js`. Express is created, an HTTP server is set up, Socket.IO is attached, and the server begins listening on port 3000.

2. **You open `http://localhost:3000` in your browser** — The browser makes a normal HTTP request to the server. Express receives it and responds by sending back `public/index.html`.

3. **The browser renders the page** — The HTML references `style.css` and `/socket.io/socket.io.js`. The browser requests those files and the server serves them from the `public/` folder.

4. **The Socket.IO client library loads** — The `/socket.io/socket.io.js` file provides a global function called `io()`.

5. **`io()` is called in `client.js`** — This opens a **socket connection** back to the server. It is a separate channel from the normal page load, designed for real-time events.

6. **The server receives a `connection` event** — In `index.js`, `io.on('connection', ...)` fires. The server logs the connection, assigns the default nickname `'Anonymous'`, and sends a `connection message` event back to this specific browser tab.

7. **The browser prompts for a nickname** — `client.js` uses `prompt()` to ask for a name. Whatever you type (or `Anonymous` if you skip it) is sent to the server via `socket.emit('set nickname', nickname)`.

8. **The server stores the nickname and broadcasts** — The server saves the nickname in its `onlineUsers` object and tells **every** connected browser about the new user with `io.emit('system message', ...)`.

9. **You type a message and press Send** — `client.js` emits `socket.emit('chat message', messageText)` to the server.

10. **The server relays the message to everyone** — The server receives the `chat message` event, packages it as `{ user: nickname, text: messageText }`, and broadcasts it with `io.emit('chat message', ...)`. Every connected browser receives it and appends it to the message list.

**In short:** The server sits in the middle. Every browser sends events to the server, and the server decides which other browsers should receive those events. No browser talks directly to another browser.

---

## Key Features In The Code

### Server Setup (`index.js`)

- **Express** creates the web application.
- **`http.createServer(app)`** wraps Express in a plain HTTP server (required so Socket.IO can attach).
- **`new Server(server)`** attaches Socket.IO to that HTTP server, enabling real-time communication.

### Static File Serving

- `app.use(express.static(...))` tells Express: *"When the browser requests `/`, `/style.css`, `/client.js`, or `/socket.io/socket.io.js`, look inside the `public/` folder and serve those files."*

### Connection Handling

- `io.on('connection', (socket) => { ... })` runs every time a browser connects.
- The `socket` object represents **that one browser's connection**. It has a unique `socket.id`.

### Nickname Management

- Each socket starts with `socket.nickname = 'Anonymous'`.
- When `set nickname` arrives, the server trims the input with `.trim()` and falls back to `'Anonymous'` if the result is empty.
- A flag `socket.hasJoinedAnnounced` prevents the *"joined the chat"* message from showing again if the user just changes their name later.

### Online User Tracking

- The `onlineUsers` object stores `{ socketId: nickname }` pairs.
- Every time someone joins, leaves, or changes their name, the server broadcasts the full updated list with `io.emit('online users', Object.values(onlineUsers))`.

### Broadcasting Chat Messages

- On `chat message`, the server checks that the message is not empty, then re-emits it to **everyone** (including the sender) with `io.emit('chat message', { user, text })`.

### Typing and Stop-Typing Events

- `socket.on('typing', ...)` tells every other user that this person is typing, using `socket.broadcast.emit`.
- `socket.on('stop typing', ...)` tells everyone to clear the typing indicator.

### Disconnect Cleanup

- When a browser tab closes, the `disconnect` event fires.
- The server removes that user from `onlineUsers`, clears any typing indicator, broadcasts a leave message, and sends the updated users list.

---

## Socket 101 — Core Concepts Explained

### What Is a Socket?

A **socket** is a persistent communication channel between a client (your browser) and a server (your Node.js app). Think of it like a phone call instead of a series of text messages:

| Regular HTTP          | Socket (Socket.IO)       |
|-----------------------|--------------------------|
| Request → Response    | Open channel, both sides |
| Page must refresh     | Instant, no refresh      |
| One conversation ends | Connection stays alive   |

### Glossary

| Term | Meaning |
|------|---------|
| **Event** | A named message, like `'chat message'` or `'typing'`. Events carry data (called a *payload*) between client and server. |
| **Emit** | To send an event. You *emit* an event with a name and optional data. |
| **On / Listener** | To wait for and react to an event. You register a listener with `.on(eventName, callback)`. |
| **Client** | The browser running `client.js`. It connects to the server and emits/listens for events. |
| **Server** | The Node.js process running `index.js`. It accepts connections and routes events between clients. |
| **Connection** | The moment a browser opens a socket to the server. Triggers `io.on('connection', ...)`. |
| **Disconnect** | The moment a browser closes or loses the socket. Triggers `socket.on('disconnect', ...)`. |
| **Broadcast** | Sending an event to **other** connected clients (not yourself). |
| **Payload / Data** | The actual information attached to an event — a string, an object, an array, etc. |

### Three Ways To Emit on the Server

| Method | Who Receives It? | Example From This App |
|--------|-----------------|----------------------|
| `socket.emit(...)` | Only the **one** browser that owns this socket. | `socket.emit('connection message', 'Connected to the chat server')` — only the newly connected tab sees this. |
| `io.emit(...)` | **Every** connected browser, including the sender. | `io.emit('chat message', { user, text })` — everyone sees the message. |
| `socket.broadcast.emit(...)` | Every connected browser **except** the sender. | `socket.broadcast.emit('typing', ...)` — others see you typing, but you don't see it yourself. |

### Why Is the Server the Central Hub?

Browsers never talk to each other directly. Every event goes **client → server → other clients**. This gives the server full control to validate data, track state (like who is online), and decide who should receive what.

### What Is `socket.id`?

Every connection gets a unique ID string like `"abc123xyz"`. The server uses `socket.id` as a key in the `onlineUsers` object so it knows exactly which nickname belongs to which connection. When that connection drops, the server uses the same `socket.id` to remove the right user.

---

## Socket Events Used In This App

Here is a quick reference of every event name used, where it is emitted, and where it is listened for:

| Event | Emitted By | Listened For By | Payload |
|-------|-----------|----------------|---------|
| `connection` | Socket.IO (automatic) | Server (`index.js`) | — |
| `connection message` | Server | Client (`client.js`) | String — `"Connected to the chat server"` |
| `set nickname` | Client | Server | String — the chosen nickname |
| `chat message` | Client **and** Server | Client **and** Server | Object — `{ user, text }` |
| `typing` | Client | Server (then rebroadcast) | — |
| `stop typing` | Client | Server (then rebroadcast) | — |
| `system message` | Server | Client | String — e.g. `"Alice joined the chat"` |
| `online users` | Server | Client | Array of strings — `["Alice", "Bob"]` |
| `disconnect` | Socket.IO (automatic) | Server | — |

---

## Code Concepts Beginners Should Notice

- **Why `.trim()` is used** — Users might accidentally type spaces only. `.trim()` removes leading and trailing whitespace so `"  "` becomes `""`, which the app then treats as empty and ignores.

- **Why empty messages are ignored** — `if (messageText === '') return;` prevents blank messages from cluttering the chat. There is no point in broadcasting nothing.

- **Why `preventDefault()` is used on the form** — By default, submitting an HTML form causes the browser to reload the page. `e.preventDefault()` stops that so the chat stays live.

- **Why the typing timeout exists** — The `input` event fires on **every keystroke**. Without a timeout, the server would receive dozens of `typing` events per second. The 1-second debounce means the *"is typing..."* message only shows while typing is active, and clears automatically when the user pauses.

- **Why the app rebuilds the online users list from scratch** — `usersList.innerHTML = ''` clears the entire sidebar list before re-adding every user. This keeps the code simple and guarantees the list is never out of sync with the server's data.

- **Why the server stores nicknames in an object keyed by `socket.id`** — Using `socket.id` as the key ensures each connection has exactly one entry. It also makes cleanup trivial: `delete onlineUsers[socket.id]` removes the right user on disconnect.

---

## Troubleshooting

| Problem | What To Check |
|---------|--------------|
| **`npm install` was not run** | If you see `Cannot find module 'express'`, you need to run `npm install` first to download the dependencies. |
| **Port 3000 already in use** | If you get `EADDRINUSE`, another program is using port 3000. Close that program, or change `3000` to another number in `index.js` and in your browser URL. |
| **Browser page loads but no live updates** | Make sure the server is still running in your terminal. If you stopped it, restart with `npm run dev` or `npm start`. |
| **Chat only works with one tab** | You need **at least two browser tabs** open to test real-time messaging. The app works with one tab, but you will not see messages appear "live" because there is no other tab to receive them. |
| **Typing indicator not showing** | The typing indicator only appears for **other** users. You need a second tab connected with a different nickname to see it. |
| **Nickname falls back to `Anonymous`** | If you press Enter on the prompt without typing anything (or type only spaces), the app defaults to `Anonymous`. This is intentional. Reload the page to try again. |

---

## Current Limitations

This app is a **learning tool**, not a production chat product. It intentionally skips many features:

- **No database or saved message history** — messages exist only in the browser's memory. Refresh the page and they are gone.
- **No authentication** — anyone who knows the URL can join.
- **No private rooms** — everyone is in one global chat.
- **No duplicate-name protection** — two people can both be called `"Alice"`.
- **No timestamps** — messages do not show when they were sent.
- **Data resets on server restart** — the `onlineUsers` object is stored in memory, so restarting the server clears all nicknames and forces everyone to reconnect.

---

## Next Learning Steps

Once you understand how this app works, try extending it on your own:

- **Add timestamps** — include `new Date().toLocaleTimeString()` in the chat message object and display it on the client.
- **Add message history** — store messages in an array on the server and send them to newly connected users.
- **Add chat rooms** — use Socket.IO's `socket.join(roomName)` to let users pick separate channels.
- **Add duplicate nickname checks** — reject or warn when someone picks a name already in use.
- **Show user counts in join/leave messages** — include the total number of connected users in system messages.
- **Add simple validation or a profanity filter** — screen messages before broadcasting them.


