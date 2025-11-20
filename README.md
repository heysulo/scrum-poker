# ScrumSense - Agile Poker Estimation

A professional, real-time Scrum Poker application built with React, Node.js, and Socket.io. Designed for agile teams to estimate user stories efficiently and collaboratively.

## 🚀 Ports & Configuration

*   **Frontend**: Runs on `http://localhost:5173` (default) or `http://localhost:3000`. Check your terminal output after running `npm run dev`.
*   **Backend**: Runs on `http://localhost:4000`.

---

## 📖 User Manual

### 1. Starting a Session
1.  Enter your **Name** in the lobby.
2.  Go to the **Create Room** tab.
3.  Enter a **Session Name** (e.g., "Sprint 42 Planning").
4.  (Optional) Set a password for private rooms.
5.  Click **Create Room**. As the creator, you are assigned the **Admin** role.

### 2. Inviting Team Members
1.  In the top-right corner, click the **Share** button (Link icon).
2.  The link is copied to your clipboard. Share it with your team.
3.  Users clicking the link will be prompted to join directly.

### 3. Estimation Process
1.  **Vote**: Select a card from the deck at the bottom of the screen. Your card will appear face-down to others.
2.  **Change Vote**: You can change your vote anytime before the reveal.
3.  **Coffee / Break**: Select the ☕ card if you need a break.
4.  **Presenter Mode**: If you are sharing your screen, enable **Presenter Mode** (Eye icon in header) to mask your selection in the UI.

### 4. Revealing & Consensus
1.  **Reveal**: Once everyone has voted (cards turn green), the Admin clicks **Reveal Cards**. (If Auto-Reveal is on, this happens automatically).
2.  **Analyze**:
    *   **Most Voted**: The consensus number.
    *   **Range**: Shows the spread between the lowest and highest estimates.
    *   **Distribution**: See how the votes are split.
3.  **Discuss**: If there is high variance (visualized in the Consensus Range), ask the outliers to explain their reasoning.

### 5. Next Round
1.  Click **Start New Round** (Reset button) to clear votes and hide cards.
2.  Repeat for the next story!

---

## ✨ Feature Guide

### 👑 Facilitator / Admin Rights
The creator of the room is the **Admin**.
*   **Crown Icon**: Identifies the Admin in the participant list.
*   **Controls**: Only Admins can Reveal/Reset (unless they toggle "Allow everyone to manage round" via the Lock icon).
*   **Kick Users**: Admins can remove disruptive users by hovering over their card and clicking the **Ban (X)** icon.
*   **Temporary Admin**: If the Admin disconnects, admin rights are temporarily shared with all online users until the Admin returns.

### 🕶️ Spectator Mode
Join as an observer without affecting the voting statistics.
*   Select "Join as Spectator" in the lobby.
*   Spectators do not have a voting deck.
*   Great for Product Owners or Stakeholders who are observing the process.

### 🎭 Presenter Mode
Designed for users sharing their screen via Zoom/Teams.
*   **Masking**: Hides your specific vote from your own screen so you don't bias the team before the reveal.
*   **Keyboard Voting**: Vote discretely using number keys (`1`, `2`, `3`, `5`, `8`...) or `C` (Coffee), `?` (Unsure).

### ⏱️ Auto-Reveal
Automatically reveals cards when all participants have voted.
*   **Timer**: Defaults to 6 seconds.
*   **Reset**: Timer resets if someone changes their vote.
*   **Toggle**: Can be disabled/enabled in the controls bar.

### 📊 Consensus Visualization
*   **Consensus Range**: Visualizes the spread. A wide bar indicates disagreement (High Variance).
*   **Vote Distribution**: A bar chart showing the frequency of each vote.
*   **Interactive Filter**: Click a bar in the distribution chart to highlight only the people who voted for that number.

---

## 🔧 Troubleshooting

### 🔴 "Disconnected: Cannot reach backend server"
*   **Cause**: The Node.js backend is not running.
*   **Fix**: Open a new terminal window and run `npx tsx server/index.ts`. Ensure it says "Server running on port 4000".

### ❌ "Connection Refused" / Fetch Errors
*   **Cause**: Port mismatch or firewall.
*   **Fix**: Ensure the frontend `services/api.ts` is pointing to `http://localhost:4000`.

### 👻 "Stuck Bots" / "Bots not voting"
*   **Context**: Only happens in **Mock Mode** (offline mode).
*   **Fix**: Refresh the page. Mock data is stored in browser memory and resets on reload.

### 🔄 Duplicate Users in Lobby
*   **Cause**: Rejoining quickly after a refresh before the server detected the socket disconnect.
*   **Fix**: The system automatically handles this by reusing IDs for same-named users. If you see a duplicate, simply leave the room or refresh again.

---

## 💻 Developer Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend
```bash
npx tsx server/index.ts
```

### 3. Start Frontend
```bash
npm run dev
```
