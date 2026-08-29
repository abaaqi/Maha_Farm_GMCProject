/* ============================================================================
 * MahaFarm RFID reader — Arduino UNO + RFID-RC522 (bonus / future feature)
 *
 * Reads an RFID card/keyfob UID and prints it over serial. This is the
 * starting point for a NEW feature not yet in the web app, e.g.:
 *   - tag produce crates -> scan to add/remove marketplace inventory
 *   - worker clock-in / field access logging
 *   - livestock or asset tracking
 *
 * Wiring (RC522 -> UNO, SPI):
 *   SDA/SS -> 10    SCK -> 13    MOSI -> 11    MISO -> 12
 *   RST    -> 9     3.3V -> 3.3V (NOT 5V!)     GND -> GND
 *
 * Library: install "MFRC522" by GithubCommunity via the Arduino Library Manager.
 *
 * Output per scan:  {"rfid":"A1B2C3D4"}
 * (To turn this into a live feature, add a small /api/device/scan endpoint and
 *  forward these lines from the bridge — ask and we can wire it up.)
 * ============================================================================ */
#include <SPI.h>
#include <MFRC522.h>

const uint8_t RST_PIN = 9;
const uint8_t SS_PIN  = 10;
const uint8_t BUZZER  = 8;   // optional feedback

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  Serial.print("{\"rfid\":\"");
  Serial.print(uid);
  Serial.println("\"}");

  // short beep for feedback
  digitalWrite(BUZZER, HIGH); delay(80); digitalWrite(BUZZER, LOW);

  rfid.PICC_HaltA();
  delay(1200); // debounce repeated reads
}
