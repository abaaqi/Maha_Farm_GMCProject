# MahaFarm Serial Bridge (Path A)

Reads sensor data from an Arduino over USB and posts it to the MahaFarm API,
and relays app commands back to the board. No WiFi hardware required.

## Setup

```bash
cd hardware/bridge
cp .env.example .env        # set API_BASE_URL, DEVICE_KEY, SERIAL_PORT
npm install
npm run list-ports          # find your Arduino's serial port
npm start
```

On the **API server**, set the matching `DEVICE_KEY` env var (and redeploy), so
`/api/device/*` is enabled and accepts this bridge.

## Data flow
- Arduino prints lines like `{"readings":[{"label":"Tank level","value":63,"unit":"%"}]}`
  → bridge POSTs to `/api/device/ingest` → the dashboard sensor tiles update.
- App queues a command (`POST /api/commands`) → bridge polls `/api/device/commands`
  → writes `CMD,relay,pump,on,30` to the Arduino → acks it.

Keep this running on any always-on computer (your laptop, or a Raspberry Pi)
connected to the Arduino by USB.
