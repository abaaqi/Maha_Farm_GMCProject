/*
 * MahaFarm serial bridge (Path A — USB).
 *
 *   Arduino  ──USB serial──►  this script  ──HTTP──►  MahaFarm API
 *            ◄──USB serial──                ◄──HTTP──
 *
 * - Reads newline-delimited JSON from the Arduino, e.g.
 *     {"readings":[{"label":"Tank level","value":63,"unit":"%"}]}
 *   and POSTs it to /api/device/ingest.
 * - Polls /api/device/commands and forwards each to the Arduino as a line:
 *     CMD,relay,pump,on,30
 *   then acks it.
 *
 * Requires Node 18+ (global fetch). Configure via .env (see .env.example).
 */
import 'dotenv/config'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'
const DEVICE_KEY = process.env.DEVICE_KEY || ''
const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/ttyUSB0'
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10)
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '4000', 10)

const headers = { 'Content-Type': 'application/json', 'x-device-key': DEVICE_KEY }

function log(...a) {
  console.log(new Date().toISOString(), ...a)
}

// --- Open the serial port ---
const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE }, (err) => {
  if (err) {
    console.error(`✖ Could not open ${SERIAL_PORT}: ${err.message}`)
    console.error('  Tip: run `npm run list-ports` to find the right port, then set SERIAL_PORT in .env')
    process.exit(1)
  }
})
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

log(`Bridge started → ${API_BASE_URL}  (serial ${SERIAL_PORT} @ ${BAUD_RATE})`)

// --- Arduino → API: forward sensor readings ---
parser.on('data', async (line) => {
  const text = line.trim()
  if (!text || !text.startsWith('{')) return // ignore boot noise / debug prints
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    return log('· skipped non-JSON line:', text.slice(0, 80))
  }
  if (!payload.readings) return
  try {
    const res = await fetch(`${API_BASE_URL}/device/ingest`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) log('↑ ingested:', (data.updated || []).join(', ') || '(none)')
    else log('✖ ingest failed:', res.status, data?.error?.message || '')
  } catch (err) {
    log('✖ ingest error:', err.message)
  }
})

port.on('error', (err) => log('serial error:', err.message))

// --- API → Arduino: poll commands and forward them ---
async function pollCommands() {
  try {
    const res = await fetch(`${API_BASE_URL}/device/commands`, { headers })
    if (!res.ok) return
    const commands = await res.json()
    for (const c of commands) {
      const line = `CMD,${c.type},${c.target || '-'},${c.state || '-'},${c.durationSec || 0}\n`
      port.write(line)
      log('↓ command →', line.trim())
      await fetch(`${API_BASE_URL}/device/commands/${c.id || c._id}/ack`, { method: 'POST', headers }).catch(() => {})
    }
  } catch (err) {
    log('✖ poll error:', err.message)
  }
}
setInterval(pollCommands, POLL_INTERVAL_MS)

process.on('SIGINT', () => {
  log('shutting down…')
  port.close(() => process.exit(0))
})
