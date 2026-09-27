import mongoose from 'mongoose'

/**
 * A stored Foresight advisory — one run of the engine for one field.
 *
 * Persisting these is what makes impact measurable over a season: every run
 * records the litres recommended against the fixed-schedule baseline, so the
 * saving can be totalled rather than estimated.
 */
const advisorySchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', index: true },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },

    location: {
      name: String,
      admin: String,
      lat: Number,
      lon: Number,
    },
    crop: { type: String, required: true },
    areaHa: { type: Number, default: 1 },
    plantedOn: Date,

    stage: {
      name: String,
      dap: Number,
      kc: Number,
      seasonProgress: Number,
      daysToHarvest: Number,
    },

    water: {
      etcMm: Number,
      rainfallMm: Number,
      effectiveRainMm: Number,
      deficitMm: Number,
      litresNeeded: Number,
      irrigationNeeded: Boolean,
    },

    savings: {
      baselineLitres: Number,
      foresightLitres: Number,
      litresSaved: Number,
      percentSaved: Number,
      nairaSaved: Number,
    },

    disease: [
      {
        key: String,
        label: String,
        peakScore: Number,
        peakLevel: String,
        peakDate: String,
        leadDays: Number,
      },
    ],

    advisory: String,
    language: { type: String, default: 'en' },

    // Provenance — recorded so every advisory can be audited after the fact.
    dataSource: String, // 'open-meteo' | 'fallback'
    aiEngine: String, // 'llm' | 'rule-based' | 'rule-based-fallback'
    aiModel: String,
  },
  { timestamps: true }
)

export default mongoose.model('Advisory', advisorySchema)
