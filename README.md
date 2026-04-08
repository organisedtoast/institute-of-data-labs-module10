# Socket.IO Chat App: Beginner Guide from Local Development to Docker and GitHub Actions

Welcome! This project is a real-time chat application built with Node.js, Express, and Socket.IO. It started as a beginner exercise for learning socket-based communication, and it now also includes Docker support and a GitHub Actions workflow that can automatically push an updated Docker image to Docker Hub whenever new commits are pushed to the `main` branch.

This README is written for a pure beginner. It starts with the app itself, then shows you how to run it locally, then explains how Docker packages it, and finally explains how GitHub Actions automates the Docker publishing process.

## Current Deployment Setup

- App port inside the project: `3000`
- Docker image name: `organisedtoast/socket-chat-app:latest`
- Docker workflow file: `.github/workflows/cicd.yml`
- Workflow trigger: push to `main`
- GitHub repository secrets used by the workflow: `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN`

**What this means:** this repository is no longer just a local Node.js app. It now has a documented Docker setup and a basic CI/CD pipeline.

**Why this matters:** a beginner can learn three layers in one project:

1. How a real-time chat app works
2. How to package that app into a Docker image
3. How to automate image publishing with GitHub Actions

## Project Overview

This app lets multiple browser tabs connect to the same server and exchange messages in real time. Unlike a traditional web page, where the browser asks for data and then waits for another refresh, this app keeps a live connection open between the browser and the server so events can flow instantly in both directions.

The project now supports four different ways to think about running it:

1. Local Node.js development with `npm`
2. Local Docker development with `docker build` and `docker run`
3. Sharing the app through Docker Hub as a public image
4. Automatically updating that Docker Hub image through GitHub Actions

## What the Chat App Does

When you run this app you get a fully functional chat with:

- Live chat messages that appear instantly in every connected tab
- Nickname selection when the page loads
- Join, leave, and rename notifications
- A typing indicator for other connected users
- A live online users sidebar

**Beginner tip:** open at least two browser tabs to the app so you can actually see the real-time behavior. With only one tab open, the app is running, but many of the "live" features are harder to notice.

## How to Run This Project

Here is the learning ladder for this repository, from simplest to most advanced:

1. Run it locally with Node.js
2. Build and run it locally with Docker
3. Pull and run the Docker Hub image
4. Push code to GitHub and let GitHub Actions update Docker Hub automatically

If you are brand new, start with the local Node.js method first. Once that works, move to Docker. Once Docker makes sense, GitHub Actions will feel much easier.

## Run Locally with Node.js

### Before You Start

Make sure you have Node.js installed on your computer. This project uses Node.js to run the server, and `npm` comes with Node.js.

### Step 1: Open the project root in a terminal

Open PowerShell, Command Prompt, or your preferred terminal, and navigate into the project folder. The correct folder is the one that contains:

- `package.json`
- `index.js`
- `public/`
- `Dockerfile`
- `README.md`

If your terminal is already opened inside this folder, you are ready for the next step.

### Step 2: Install dependencies

Run:

```powershell
npm install
```

This downloads the packages listed in `package.json`, including:

- `express`
- `socket.io`
- `nodemon`

**What this means:** your source code uses these packages, but the packages are not stored directly in the repository. `npm install` downloads them into `node_modules/`.

**Common mistake:** if you skip this step, the app will fail with errors such as "Cannot find module 'express'".

### Step 3: Start the server

For beginner-friendly development, run:

```powershell
npm run dev
```

This uses `nodemon`, which automatically restarts the server when you save a file.

You can also run the normal start script:

```powershell
npm start
```

That starts the app without automatic restarts.

### Step 4: Open the app in your browser

Visit:

```text
http://localhost:3000
```

The browser will prompt you for a nickname. Enter one, or leave it blank to become `Anonymous`.

### Step 5: Test the real-time features

Open a second tab to the same address:

```text
http://localhost:3000
```

Now send a message in one tab and watch it appear in the other.

**Why this matters:** this is the simplest proof that Socket.IO is working. The app is not waiting for a page refresh. The message is pushed to connected clients immediately.

## Project Structure

Here is the current structure of the project:

```text
institute-of-data-labs-module10/
|-- .github/
|   |-- workflows/
|       |-- cicd.yml
|-- public/
|   |-- client.js
|   |-- index.html
|   |-- style.css
|-- .dockerignore
|-- .gitignore
|-- Dockerfile
|-- README.md
|-- index.js
|-- package-lock.json
|-- package.json
```

What each important file does:

- `index.js` runs the Node.js server
- `public/client.js` runs in the browser
- `public/index.html` is the page structure
- `public/style.css` styles the chat UI
- `Dockerfile` explains how Docker should build the app image
- `.dockerignore` tells Docker what not to copy into the image
- `.github/workflows/cicd.yml` defines the GitHub Actions workflow
- `package.json` defines scripts and dependencies

## How the App Works

### What Are "Sockets" in Plain English?

Normally, a browser sends one request and the server sends one response. After that, the conversation is finished. If the page needs new data, the browser has to ask again.

Sockets change that model. Instead of opening and closing the conversation every time, the browser and server keep one live connection open. Either side can send named events whenever it needs to.

**Big idea:** a socket is more like a phone call than a letter. Once the connection is open, both sides can talk at any time.

### Client and Server Roles

- The server is the Node.js process running `index.js`
- The client is the browser running `public/client.js`
- Socket.IO provides the live channel between them

The browser never talks directly to another browser. Every event flows through the server first.

### Step-by-Step Walkthrough

Here is what happens when the app runs:

1. You start the server with `npm run dev` or `npm start`
2. Node.js runs `index.js`
3. Express serves the files in `public/`
4. The browser loads `index.html`, `style.css`, and `client.js`
5. The browser also loads the Socket.IO client library from `/socket.io/socket.io.js`
6. `io()` is called in `client.js`, creating a live connection to the server
7. The server detects the connection in `io.on('connection', ...)`
8. The browser sends the chosen nickname to the server
9. The server stores the nickname and updates the online users list
10. When a user sends a message, the server broadcasts it to all connected clients

**What this means:** the server is the central traffic controller. It receives events, updates state, and decides what every connected browser should receive.

### Key Features in the Code

#### Server setup in `index.js`

- `express()` creates the web app
- `http.createServer(app)` creates the HTTP server
- `new Server(server)` attaches Socket.IO to that HTTP server

This detail matters because Socket.IO needs the raw HTTP server object, not just the Express app.

#### Static file serving

This line:

```js
app.use(express.static(path.join(__dirname, 'public')));
```

tells Express to serve the files in the `public/` folder automatically.

#### Online user tracking

The server stores connected users in an `onlineUsers` object keyed by `socket.id`.

**Why this matters:** every connection gets a unique ID, so the server can always tell which nickname belongs to which browser connection.

#### Typing indicator behavior

The client sends `typing` and `stop typing` events while the user types. A small timeout prevents those events from being spammed constantly.

**Beginner tip:** this is a simple example of "debouncing" behavior. The app waits briefly before deciding that typing has stopped.

### Socket.IO Glossary

| Term | Meaning |
|------|---------|
| `event` | A named message such as `chat message` or `typing` |
| `emit` | To send an event |
| `on` | To listen for an event |
| `client` | The browser |
| `server` | The Node.js process |
| `socket.id` | The unique ID for one client connection |
| `broadcast` | Send to everyone except the sender |
| `payload` | The data attached to an event |

### Three Useful Server Emit Patterns

| Method | Who receives it? | Example |
|--------|------------------|---------|
| `socket.emit(...)` | Only one client | Send the connection message to the newly connected browser |
| `io.emit(...)` | Every connected client | Broadcast chat messages and user list updates |
| `socket.broadcast.emit(...)` | Everyone except the sender | Show typing indicators to other users only |

## Dockerise the App

### What Docker Is

Docker lets you package your app together with the environment it needs to run. Instead of saying, "Please install Node.js and then run these commands," you can package the app into a Docker image and run that image anywhere Docker is installed.

### Important Docker Vocabulary

| Term | Meaning |
|------|---------|
| `Dockerfile` | The recipe Docker reads to build an image |
| `image` | A built, reusable package of your app and its environment |
| `container` | A running instance of an image |
| `Docker Hub` | A cloud registry that stores Docker images |
| `port mapping` | A bridge from a port on your machine to a port inside the container |

**What this means:** source code, image, and container are not the same thing.

- Source code is the files in this repository
- An image is a packaged snapshot built from that code
- A container is a running process created from the image

### Why This App Is a Good First Docker Example

This app is a single Node.js service with no database. That keeps the Docker setup simple because we only need one container.

### The Current Dockerfile

This repository already contains the following `Dockerfile`:

```dockerfile
FROM node:19-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
RUN npm install
CMD ["npm", "start"]
```

### Dockerfile Explained Line by Line

#### `FROM node:19-alpine`

This chooses the base image. In plain English, it means: "Start from a small Linux image that already has Node.js 19 installed."

#### `WORKDIR /app`

This sets the working folder inside the container to `/app`.

**What this means:** all following Docker instructions run from inside that folder.

#### `COPY . .`

This copies the current project into the container's working directory.

**Common mistake:** beginners often think Docker reads files directly from the host machine after the container starts. It does not. The files are copied into the image at build time.

#### `EXPOSE 3000`

This documents that the app inside the container listens on port `3000`.

**Why this matters:** the app code still runs on port `3000` inside the container, even if you choose a different port on your own machine.

#### `RUN npm install`

This installs project dependencies inside the image while the image is being built.

#### `CMD ["npm", "start"]`

This is the default command that runs when the container starts.

### Why `.dockerignore` Exists

The repository also includes `.dockerignore`. This tells Docker which files and folders to skip when building the image.

The most important entry is `node_modules`.

**Why this matters:** you do not want to copy your local `node_modules` into the image. Docker should install a fresh set of dependencies inside the container so the image stays clean and consistent.

## Build, Run, and Share the Docker Image

### Step 1: Build the image

Run this from the project root:

```powershell
docker build -t organisedtoast/socket-chat-app .
```

**What this means:**

- `docker build` tells Docker to build an image
- `-t organisedtoast/socket-chat-app` gives the image a name
- `.` tells Docker to use the current folder as the build context

**Common mistake:** do not type a leading `$` in PowerShell. In tutorials, `$` usually means "this is a terminal prompt", not "type this character".

### Step 2: Check that the image exists

Run:

```powershell
docker images
```

You should see `organisedtoast/socket-chat-app` listed.

### Step 3: Run the image as a container

Run:

```powershell
docker run -d -p 7000:3000 organisedtoast/socket-chat-app
```

This starts a container in the background.

**What this means:**

- `-d` means detached mode, so the container runs in the background
- `-p 7000:3000` maps port `7000` on your computer to port `3000` inside the container

### Host Port vs Container Port

This is one of the most important beginner concepts in Docker:

- The app listens on `3000` inside the container
- You choose what port to expose on your own machine
- In this command, your browser uses `7000`, and Docker forwards that traffic to `3000` inside the container

So after running the container, open:

```text
http://localhost:7000
```

### Step 4: Check the running container

Run:

```powershell
docker ps
```

This shows running containers, including:

- the container ID
- the image name
- the port mapping
- the generated container name

### Step 5: Push the image to Docker Hub

If you want other people to run your image from Docker Hub, log in and push it:

```powershell
docker login
docker push organisedtoast/socket-chat-app:latest
```

**Why this matters:** once the image is on Docker Hub, another person does not need your source code, Node.js, or `npm install`. They only need Docker.

### Step 6: Pull and run the public image elsewhere

Someone else can run your app with:

```powershell
docker pull organisedtoast/socket-chat-app:latest
docker run -d -p 7000:3000 organisedtoast/socket-chat-app:latest
```

Then they open:

```text
http://localhost:7000
```

**Big idea:** Docker turns "here is my code, please set everything up" into "here is my image, just run it".

## Automate Docker Hub Updates with GitHub Actions

### What GitHub Actions Is

GitHub Actions is GitHub's built-in automation system. It lets a repository react automatically to events such as pushes, pull requests, or releases.

In this project, GitHub Actions is used to automate the Docker workflow you already learned manually.

### What CI/CD Means in Beginner Language

CI/CD stands for Continuous Integration and Continuous Deployment or Continuous Delivery.

For this repository, the simplest beginner-friendly meaning is:

- CI: GitHub automatically checks and builds your project after code changes
- CD: GitHub automatically publishes the updated Docker image to Docker Hub

**Why this matters:** instead of manually running `docker build` and `docker push` every time you change the app, GitHub can do that for you after a push to `main`.

### The Workflow File

This repository uses:

```text
.github/workflows/cicd.yml
```

Current contents:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [19.x]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        env:
          PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true'
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm install

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@v2

      - name: Build and push
        id: docker_build
        uses: docker/build-push-action@v4
        with:
          context: ./
          file: ./Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_HUB_USERNAME }}/socket-chat-app:latest

      - name: Image digest
        run: echo ${{ steps.docker_build.outputs.digest }}
```

### Step-by-Step Workflow Explanation

#### `name: CI/CD`

This is just the display name of the workflow in GitHub.

#### `on: push: branches: [ main ]`

This tells GitHub when to run the workflow.

**What this means:** every time code is pushed to the `main` branch, GitHub starts this workflow automatically.

#### `jobs: build`

A workflow is made of jobs. This project currently has one job called `build`.

#### `runs-on: ubuntu-latest`

GitHub creates a temporary Linux machine to run the workflow.

**Beginner tip:** this machine is called a runner. It exists only for the workflow run, then disappears.

#### `strategy` and `matrix`

This tells the workflow which Node.js version to use. Here, it uses `19.x`.

#### `actions/checkout@v3`

This downloads your repository code into the GitHub runner.

**Why this matters:** the runner cannot build your project until it actually has the project files.

#### `actions/setup-node@v3`

This installs the required Node.js version on the runner.

#### `run: npm install`

This installs project dependencies during the workflow.

**Important note:** this workflow does not run a real test suite yet. The project's current `test` script is just the default placeholder, so this pipeline is mainly a build-and-publish pipeline rather than a full automated test pipeline.

#### `docker/login-action@v2`

This logs in to Docker Hub using GitHub repository secrets.

**Why this matters:** secrets keep your credentials out of the workflow file. Hardcoding usernames or tokens in YAML would be unsafe.

#### `docker/setup-buildx-action@v2`

This prepares Docker's advanced build tool inside the runner.

#### `docker/build-push-action@v4`

This is the most important deployment step. It:

- reads the `Dockerfile`
- builds the Docker image
- pushes the image to Docker Hub

The pushed tag is:

```text
organisedtoast/socket-chat-app:latest
```

because the workflow uses the Docker Hub username stored in `DOCKER_HUB_USERNAME`.

#### `Image digest`

This prints the resulting image digest to the workflow logs.

**What this means:** GitHub shows a unique identifier for the built image, which is helpful proof that the build completed successfully.

### Repository Secrets You Need

To make this workflow work in GitHub, the repository needs these secrets:

- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_ACCESS_TOKEN`

### How to Add the Secrets in GitHub

1. Open the repository on GitHub
2. Go to `Settings`
3. Open `Secrets and variables`
4. Open `Actions`
5. Click `New repository secret`
6. Add `DOCKER_HUB_USERNAME` with your Docker Hub username as the value
7. Add `DOCKER_HUB_ACCESS_TOKEN` with a Docker Hub access token as the value

### How to Create the Docker Hub Access Token

1. Log in to Docker Hub
2. Open `Account Settings`
3. Open `Security`
4. Create a new access token
5. Give it the permissions needed to push images

### What Happens After a Push to `main`

Once the secrets are in place, the workflow becomes automatic:

1. You make a change to the app
2. You commit the change
3. You push the commit to `main`
4. GitHub Actions starts the workflow
5. GitHub builds the Docker image from the repository
6. GitHub pushes the updated image to Docker Hub
7. Anyone who pulls `organisedtoast/socket-chat-app:latest` gets the updated version

### How to Check the Workflow Run

1. Open the repository on GitHub
2. Click the `Actions` tab
3. Open the latest `CI/CD` run
4. Click through each step to see the logs

**Common mistake:** if nothing happens after a push, check whether the push actually went to `main`. This workflow only triggers on pushes to that branch.

## Troubleshooting

### Local Node.js issues

| Problem | What to check |
|---------|---------------|
| `Cannot find module 'express'` | Run `npm install` in the project root |
| `EADDRINUSE` on port `3000` | Another app is already using port `3000` |
| The browser loads but live updates do not work | Make sure the Node.js server is still running |
| The typing indicator does not appear | Open a second tab; typing indicators are shown to other users, not to yourself |

### Docker issues

| Problem | What to check |
|---------|---------------|
| `The term '$' is not recognized` in PowerShell | Remove the leading `$` from copied commands |
| `The '<' operator is reserved for future use` | Replace placeholder text like `<your-dockerhub-username>` with your real username |
| `ENOENT: no such file or directory, open '/app/package.json'` during build | Make sure you ran `docker build` from the project root where `package.json` exists |
| Docker commands fail to connect | Make sure Docker Desktop is installed and running |
| Port `7000` does not open the app | Confirm the container is running with `docker ps` |

### GitHub Actions issues

| Problem | What to check |
|---------|---------------|
| Workflow does not start | Make sure you pushed to `main` |
| Docker login fails in GitHub Actions | Check that `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN` exist and are spelled correctly |
| YAML errors appear in GitHub Actions | YAML indentation must be exact |
| Docker Hub image does not update | Check the `Build and push` step in the Actions logs |

## Next Learning Steps

Once you are comfortable with the current setup, here are some strong next steps:

- Add a real automated test suite so GitHub Actions can test before publishing
- Add version tags such as `v1`, `v1.1`, or commit-based tags instead of relying only on `latest`
- Learn Docker Compose for multi-container apps that also need a database
- Add timestamps to chat messages
- Add chat rooms
- Add duplicate nickname protection
- Add saved message history with a database

## Final Summary

This repository now teaches three connected ideas in one place:

1. How real-time communication works with Socket.IO
2. How Docker packages a Node.js app into a portable image
3. How GitHub Actions automates Docker image publishing

If you can run the app locally, build the Docker image, run the container on `http://localhost:7000`, and understand why a push to `main` updates `organisedtoast/socket-chat-app:latest`, then you have covered the core beginner workflow from development to basic CI/CD.
