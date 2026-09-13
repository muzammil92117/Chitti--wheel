# Real-time Chitti Wheel

This is a real-time multiplayer version of the Chitti Wheel.

## Run locally
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open the displayed address on phones connected to the same network.
6. Everyone enters the same room code.

## Put it online
Deploy this Node.js app to a service that supports WebSockets and a long-running Node process. Set the start command to `npm start`. Use the public HTTPS URL on every phone and enter the same room code.

The server is authoritative for room state broadcasts, while the browser performs the wheel animation locally.
