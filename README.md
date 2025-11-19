# ScrumSense - Agile Poker Estimation

A real-time Scrum Poker application built with React, Node.js, and Socket.io.

## 🚀 Features

*   **Real-time Estimation**: Instant voting and revealing.
*   **Multi-Session**: Create and manage multiple rooms.
*   **Auto-Reveal**: Automatic card reveal timer.
*   **Presenter Mode**: Mask your votes while screen sharing.
*   **Responsive Design**: Dark/Light mode support.

---

## 🛠️ Getting Started

### 1. Install Dependencies

Run this command in the root directory to install required packages:

```bash
npm install
```

### 2. Start the Backend Server (Node.js)

The backend manages sessions and real-time web sockets. It runs on port **4000**.

```bash
# using tsx (recommended for TypeScript)
npx tsx server/index.ts

# OR using ts-node
npx ts-node server/index.ts
```

_You should see: `Server running on port 4000`_

### 3. Start the Frontend (React)

The frontend serves the UI. By default, it runs on port **5173** (Vite).

```bash
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## ⚙️ Configuration: Mock vs. Real Backend

The application supports two modes:

### 1. Mock Mode (Default)
**Status: ACTIVE**

The app runs entirely in the browser using dummy data and simulated bots. No backend server is required.
*   **Good for:** Testing UI, Demos, Offline development.
*   **Service File:** `services/firebaseService.ts`

### 2. Real Backend Mode
**Status: INACTIVE**

The app connects to the Node.js server running on `localhost:4000`.
*   **Good for:** Real multiplayer usage on local network/production.
*   **Service File:** `services/api.ts`

#### 🔄 How to Switch to Real Backend Mode

To connect the frontend to your running Node.js server, you need to update the imports in two files:

1.  **`components/Lobby.tsx`**
    *   *Change:* `import ... from '../services/firebaseService';`
    *   *To:* `import ... from '../services/api';`

2.  **`hooks/usePokerGame.ts`**
    *   *Change:* `import ... from '../services/firebaseService';`
    *   *To:* `import ... from '../services/api';`

3.  **`index.html`**
    *   Ensure `socket.io-client` is present in the import map (it is currently removed for Mock Mode).

```json
"socket.io-client": "https://aistudiocdn.com/socket.io-client@^4.8.1"
```
