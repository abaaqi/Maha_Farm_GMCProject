# 🔌 MahaFarm Hardware Integration (Arduino → Web App)

This turns MahaFarm from a software demo into a real IoT system: your Arduino
reads sensors and the live dashboard tiles update; the app can switch the
irrigation relay. **Path A** is used here — the UNO talks over **USB** to a small
Node "bridge" that relays data to/from the API (no WiFi hardware needed).

```
Sensors ─► Arduino UNO ─USB─► bridge (Node) ─HTTP─► MahaFarm API ─► MongoDB ─► Dashboard
Relay   ◄─ Arduino UNO ◄USB─ bridge (Node) ◄HTTP─ "Irrigate" command (app/user)
```

---

## 1. What each kit part can do

### Sensors → existing dashboard tiles
| Kit component | Measures | Feeds tile | In your kit? |
|---|---|---|---|
| HC-SR04 ultrasonic | distance to water surface | **Tank level** | ✅ |
| Thermistor (10k NTC) | temperature | **Air temp** | usually ✅ |
| Photoresistor (LDR) | light level | **Light** | usually ✅ |
| Water sensor | water/rain presence | **Water sensor** (new tile) | ✅ |
| **Capacitive soil moisture** | soil water content | **Soil moisture** (flagship tile) | ❌ buy (~₦1,500) |
| Soil pH probe | acidity | **Soil pH** | ❌ optional |
| DHT11 (if present) | temp **+** humidity | **Air temp** + **Humidity** | sometimes |

### Actuators → make the app's automation real (app → hardware)
| Component | Real-world action | App feature |
|---|---|---|
| Relay module | switch a **pump / solenoid valve / grow light** | **Autonomous irrigation** |
| Servo ×2 | open/close **vent, shade net, small valve** | greenhouse control |
| Stepper + ULN2003 | drive a **valve / feed dispenser** | fertigation / feeder |
| Buzzer | audible **alarm** | Alerts |
| LEDs | status lights (green/healthy, red/alert) | indicators |
| LCD1602 | show readings at the field | local display |

### New features the kit unlocks (not yet in the app)
| Component | Feature idea |
|---|---|
| RFID-RC522 + card/fob | tag **produce crates** (scan to update inventory), **worker clock-in**, asset tracking |
| Water sensor | **rain / leak / overflow** detector (new sensor type) |
| IR remote + receiver | **manual override** for irrigation / lights |
| 4×4 keypad | local **PIN access** or manual data entry |
| Joystick | local menu navigation |
| 8×8 LED matrix / 7-segment | local status / numeric display |

### Worth buying later
Capacitive **soil-moisture** probe (flagship tile), **water-flow** sensor (litres used → water-savings chart), **PIR motion** (animal/intruder), **DS18B20** soil temp, **reed/tilt** switch (gate/door open).

> You purchase any of these yourself — I can't buy or ship hardware. I can point
> you to what to search for (e.g. "capacitive soil moisture sensor v1.2"). In
> Nigeria, try Jumia or electronics shops (Computer Village, Lagos).

---

## 2. Wiring (farm_node.ino default pins)

| Signal | UNO pin | Notes |
|---|---|---|
| HC-SR04 Trig / Echo | 9 / 10 | 5V, GND |
| Water sensor (analog) | A0 | S→A0, +→5V, −→GND |
| Thermistor divider | A1 | 10k NTC + 10k resistor divider to A1 |
| LDR divider | A2 | LDR + 10k resistor divider to A2 |
| Soil moisture (analog) | A3 | only if you add the probe |
| Relay IN | 7 | most modules are **active-LOW** (handled in code) |
| Buzzer + | 8 | |
| Status LED | 13 | on-board LED |
| **RFID-RC522** (separate sketch) | SS 10, RST 9, SCK 13, MOSI 11, MISO 12 | **3.3V only** |

A divider = sensor and a 10k resistor in series between 5V and GND, with the
midpoint going to the analog pin.

---

## 3. Run it (step by step)

**A. Enable the device API**
On the server, set `DEVICE_KEY` (any strong string) in the environment and
redeploy. This unlocks `/api/device/*`.

**B. Flash the Arduino**
1. Open `hardware/arduino/farm_node/farm_node.ino` in the Arduino IDE.
2. In the `ENABLE_*` flags at the top, turn on only the sensors you have
   (Tank + Water are on; enable Thermistor/LDR if present; Soil stays off until
   you buy the probe).
3. Select board **Arduino UNO** + your port, then **Upload**.
4. Open Serial Monitor (9600 baud) — you should see JSON lines every 5s.

**C. Start the bridge**
```bash
cd hardware/bridge
cp .env.example .env     # set API_BASE_URL, DEVICE_KEY (same as server), SERIAL_PORT
npm install
npm run list-ports       # find the Arduino port → put it in .env
npm start
```
Close the Arduino Serial Monitor first (only one program can hold the port).
Watch the dashboard — the **Tank level**, **Air temp**, etc. tiles now update from
your hardware.

**D. Control hardware from the app (irrigation)**
Queue a command as a logged-in user — the bridge forwards it to the relay:
```bash
# get a token by logging in, then:
curl -X POST https://YOUR-API/api/commands \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"type":"relay","target":"pump","state":"on","durationSec":30}'
```
The relay switches on for 30s. (Want a button in the dashboard UI for this
instead of curl? Ask and I'll add an "Irrigate now" control.)

---

## 4. Data endpoints (also useful without hardware)

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/device/ingest` | device key | push sensor readings (bridge uses this) |
| `GET /api/device/commands` | device key | bridge polls pending commands |
| `POST /api/device/commands/:id/ack` | device key | bridge acks a command |
| `POST /api/commands` | user | queue a hardware command |
| `GET /api/commands` | user | command history |
| `GET /api/export/:resource.csv` | user | download data as CSV (sensors, fields, products, alerts, tasks, scans, commands) |

---

## 5. When you get WiFi (Path B, later)
Swap the USB bridge for an **ESP8266/ESP32** that POSTs to `/api/device/ingest`
directly over WiFi and polls `/api/device/commands` — same endpoints, no computer
in the middle. Tell me when you have the board and I'll provide that sketch.
