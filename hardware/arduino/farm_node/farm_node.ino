/* ============================================================================
 * MahaFarm Field Node — Arduino UNO sketch (Path A: USB serial)
 *
 * Reads sensors, streams them to the serial bridge as JSON, and obeys commands
 * sent back from the app (e.g. switch the irrigation relay).
 *
 * Enable only the parts you actually have by toggling the ENABLE_* flags below.
 * Soil-moisture and pH are OFF by default (not in the basic RC522 kit).
 *
 * Output (every SAMPLE_MS, one line):
 *   {"readings":[{"label":"Tank level","value":63,"unit":"%"}, ...]}
 *
 * Commands in (one line, from the bridge):
 *   CMD,relay,pump,on,30      -> relay ON for 30s (0 = until told off)
 *   CMD,relay,pump,off,0      -> relay OFF
 *   CMD,buzzer,alarm,on,1     -> beep
 * ============================================================================ */

// ----------------------------- Feature flags -----------------------------
#define ENABLE_TANK      1   // HC-SR04 ultrasonic -> "Tank level"   (in kit)
#define ENABLE_WATER     1   // Water sensor       -> "Water sensor" (in kit)
#define ENABLE_THERMISTOR 1  // Thermistor         -> "Air temp"     (usually in kit)
#define ENABLE_LDR       1   // Photoresistor      -> "Light"        (usually in kit)
#define ENABLE_SOIL      0   // Capacitive probe   -> "Soil moisture"(buy separately)
#define ENABLE_RELAY     1   // Relay module       -> irrigation pump (in kit)
#define ENABLE_BUZZER    1   // Buzzer             -> audible alerts (in kit)
#define ENABLE_STATUS_LED 1  // LED                -> status light   (in kit)

// ------------------------------- Pin map ---------------------------------
const uint8_t PIN_TRIG     = 9;   // HC-SR04 Trig
const uint8_t PIN_ECHO     = 10;  // HC-SR04 Echo
const uint8_t PIN_WATER    = A0;  // Water sensor analog out
const uint8_t PIN_THERM    = A1;  // Thermistor divider midpoint
const uint8_t PIN_LDR      = A2;  // LDR divider midpoint
const uint8_t PIN_SOIL     = A3;  // Soil moisture analog out
const uint8_t PIN_RELAY    = 7;   // Relay IN
const uint8_t PIN_BUZZER   = 8;   // Buzzer +
const uint8_t PIN_LED      = 13;  // On-board LED as status

// --------------------------- Calibration ---------------------------------
// Tank: distance (cm) from sensor to water surface when full vs empty.
const float TANK_FULL_CM  = 5.0;    // water near the sensor
const float TANK_EMPTY_CM = 40.0;   // empty tank
// Thermistor (10k NTC, Beta model). Adjust if readings look off.
const float THERM_SERIES_R = 10000.0;
const float THERM_NOMINAL_R = 10000.0;
const float THERM_NOMINAL_T = 25.0;     // deg C
const float THERM_BETA = 3950.0;
// Soil moisture raw analog at dry vs wet (calibrate with your probe).
const int SOIL_DRY = 620;
const int SOIL_WET = 310;
// Relay polarity: most cheap modules are ACTIVE-LOW (LOW = on).
const bool RELAY_ACTIVE_LOW = true;

// --------------------------- Timing --------------------------------------
const unsigned long SAMPLE_MS = 5000;   // how often to send readings
unsigned long lastSample = 0;

// Relay auto-off timer
bool relayOn = false;
unsigned long relayOffAt = 0;           // millis() deadline, 0 = no auto-off

// ------------------------------ Setup ------------------------------------
void setup() {
  Serial.begin(9600);
#if ENABLE_TANK
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
#endif
#if ENABLE_RELAY
  pinMode(PIN_RELAY, OUTPUT);
  setRelay(false);
#endif
#if ENABLE_BUZZER
  pinMode(PIN_BUZZER, OUTPUT);
#endif
#if ENABLE_STATUS_LED
  pinMode(PIN_LED, OUTPUT);
#endif
}

// ------------------------------- Loop ------------------------------------
void loop() {
  readCommands();

  // Auto-off the relay when its timer expires.
  if (relayOn && relayOffAt != 0 && millis() >= relayOffAt) {
    setRelay(false);
  }

  if (millis() - lastSample >= SAMPLE_MS) {
    lastSample = millis();
    sendReadings();
  }
}

// ------------------------- Sensor reads ----------------------------------
#if ENABLE_TANK
float readTankPercent() {
  digitalWrite(PIN_TRIG, LOW); delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long dur = pulseIn(PIN_ECHO, HIGH, 30000UL); // timeout 30ms (~5m)
  if (dur == 0) return -1;                      // no echo
  float cm = dur * 0.0343 / 2.0;
  float pct = 100.0 * (TANK_EMPTY_CM - cm) / (TANK_EMPTY_CM - TANK_FULL_CM);
  return constrain(pct, 0, 100);
}
#endif

#if ENABLE_THERMISTOR
float readTempC() {
  int adc = analogRead(PIN_THERM);
  if (adc <= 0) return NAN;
  float r = THERM_SERIES_R / (1023.0 / adc - 1.0);
  float steinhart = r / THERM_NOMINAL_R;
  steinhart = log(steinhart);
  steinhart /= THERM_BETA;
  steinhart += 1.0 / (THERM_NOMINAL_T + 273.15);
  steinhart = 1.0 / steinhart;
  return steinhart - 273.15;
}
#endif

// --------------------------- Build + send JSON ---------------------------
void sendReadings() {
  String json = F("{\"readings\":[");
  bool first = true;

#if ENABLE_TANK
  { float v = readTankPercent();
    if (v >= 0) { addReading(json, first, "Tank level", String((int)v), "%"); } }
#endif
#if ENABLE_WATER
  { int raw = analogRead(PIN_WATER);
    int pct = map(raw, 0, 1023, 0, 100);
    addReading(json, first, "Water sensor", String(pct), "%"); }
#endif
#if ENABLE_THERMISTOR
  { float t = readTempC();
    if (!isnan(t)) addReading(json, first, "Air temp", String(t, 1), "\xC2\xB0""C"); }
#endif
#if ENABLE_LDR
  { int raw = analogRead(PIN_LDR);
    addReading(json, first, "Light", String(raw), ""); }
#endif
#if ENABLE_SOIL
  { int raw = analogRead(PIN_SOIL);
    int pct = map(raw, SOIL_DRY, SOIL_WET, 0, 100);
    addReading(json, first, "Soil moisture", String(constrain(pct, 0, 100)), "%"); }
#endif

  json += F("]}");
  Serial.println(json);
}

void addReading(String &json, bool &first, const char *label, String value, const char *unit) {
  if (!first) json += ',';
  first = false;
  json += F("{\"label\":\"");
  json += label;
  json += F("\",\"value\":");
  json += value;
  json += F(",\"unit\":\"");
  json += unit;
  json += F("\"}");
}

// --------------------------- Command parser ------------------------------
// Expects: CMD,<type>,<target>,<state>,<durationSec>
void readCommands() {
  static String buf;
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      handleCommand(buf);
      buf = "";
    } else if (c != '\r') {
      buf += c;
    }
  }
}

void handleCommand(String line) {
  line.trim();
  if (!line.startsWith("CMD,")) return;

  // Split into up to 5 fields.
  String f[5];
  int idx = 0;
  int start = 0;
  for (int i = 0; i <= line.length() && idx < 5; i++) {
    if (i == line.length() || line[i] == ',') {
      f[idx++] = line.substring(start, i);
      start = i + 1;
    }
  }
  String type = f[1], target = f[2], state = f[3];
  long dur = f[4].toInt();

#if ENABLE_RELAY
  if (type == "relay") {
    bool on = (state == "on");
    setRelay(on);
    relayOffAt = (on && dur > 0) ? millis() + (unsigned long)dur * 1000UL : 0;
  }
#endif
#if ENABLE_BUZZER
  if (type == "buzzer") {
    beep(state == "on" ? 2 : 1);
  }
#endif
}

// ------------------------------ Actuators --------------------------------
#if ENABLE_RELAY
void setRelay(bool on) {
  relayOn = on;
  digitalWrite(PIN_RELAY, (on != RELAY_ACTIVE_LOW) ? HIGH : LOW);
#if ENABLE_STATUS_LED
  digitalWrite(PIN_LED, on ? HIGH : LOW);
#endif
}
#endif

#if ENABLE_BUZZER
void beep(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_BUZZER, HIGH); delay(120);
    digitalWrite(PIN_BUZZER, LOW); delay(100);
  }
}
#endif
