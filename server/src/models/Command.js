import mongoose from 'mongoose'

/**
 * A command queued by the app for the hardware to execute (app → device).
 * The serial bridge polls pending commands, sends them to the Arduino, and
 * acks them. Example: { type: 'relay', target: 'pump', state: 'on', durationSec: 30 }.
 */
const commandSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    type: { type: String, required: true }, // e.g. 'relay', 'buzzer', 'servo'
    target: { type: String, default: '' }, // e.g. 'pump', 'valve', 'light'
    state: { type: String, default: '' }, // e.g. 'on' | 'off'
    durationSec: { type: Number, default: 0 }, // 0 = until told otherwise
    zone: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'sent', 'done'], default: 'pending' },
    sentAt: { type: Date },
    doneAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model('Command', commandSchema)
