# 🌦️ MahaFarm Foresight — how it works

Foresight answers two questions for any field in Nigeria, **without a single sensor**:

1. **How much water does this field need today?**
2. **What is the disease risk this week — before symptoms appear?**

Built for the GOMYCODE × NVIDIA *Come Build with AI* hackathon, 27 September 2026.

---

## Why no sensors

Hardware was always MahaFarm's weakest link: probes cost money, need installing, and fail
200 km from anyone who can fix them. Foresight removes that dependency. A farmer who can
name a location and a crop gets an advisory immediately. **Sensors become the premium tier,
not the price of entry.**

---

## The pipeline

```
location + crop + planting date
        │
        ├─► geocode (Open-Meteo, with a local Nigerian gazetteer fallback)
        │
        ├─► free agro-weather: hourly temp/humidity, daily ET₀ + rainfall
        │        (Open-Meteo — no API key; climatology fallback if unreachable)
        │
        ├─► GROWTH STAGE        days after planting → FAO-56 crop coefficient (Kc)
        │
        ├─► WATER BALANCE       ETc = ET₀ × Kc
        │                       deficit = ETc − effective rainfall
        │                       litres  = deficit(mm) × 10,000 × hectares ÷ efficiency
        │
        ├─► DISEASE RISK        score each of 7 days against published infection
        │                       conditions (temperature band + hours above a humidity
        │                       threshold). Inverse models for dry-weather pests.
        │
        ├─► AI ADVISORY         an LLM turns the computed figures into a prioritised
        │                       plan, English or Hausa  (rules-engine fallback)
        │
        └─► persist + respond   every run stored, so saving totals over a season
```

## The deliberate split: maths vs language

| Layer | File | Responsibility |
|---|---|---|
| **Numbers** | `services/agronomy.js` | Deterministic, auditable, testable. Kc tables, water balance, infection models. |
| **Data** | `services/weatherData.js` | Free public weather, caching, timeouts, fallback. |
| **Language** | `services/advisor.js` | Turns figures into advice. **Never calculates.** |

The model is handed a fact sheet of already-correct figures. It is explicitly instructed
never to invent or recalculate a number. This is the core design decision: a hallucinated
irrigation volume costs a farmer real water and real money, so the model is kept away from
arithmetic entirely and used for what it is good at — prioritising and explaining, in the
farmer's own language.

## Reliability

Two independent fallbacks mean the endpoint degrades in quality, never in function:

| Failure | Behaviour |
|---|---|
| Open-Meteo unreachable | Latitude-banded climatology profile, **labelled in the UI** as seasonal norms |
| No model key configured | Deterministic rules-engine writes the advisory |
| Model call fails or times out (20s) | Same rules-engine fallback, with the reason surfaced |
| Database unavailable | Advisory still returned; only the persistence step is skipped |

Weather responses are cached in-process for 30 minutes to stay inside free-tier rate limits.

## Responsible AI

- Every advisory carries a **provenance panel**: data source, method, AI role, assumptions.
- Disease output is labelled a **risk forecast, not a diagnosis** — in both languages.
- A "confirm with your extension officer" note appears before any spraying advice.
- No personal data is collected; the endpoint takes a place name and a crop.

## API

```http
POST /api/foresight
{
  "location": "kura",            // or lat + lon
  "crop": "maize",               // maize | rice | tomato | pepper | onion | cowpea
  "plantedOn": "2026-07-14",
  "areaHa": 5,
  "irrigationMethod": "sprinkler", // drip | sprinkler | furrow | flood
  "language": "en"               // en | ha
}

GET /api/foresight/options    → crops, locations, methods, languages
GET /api/foresight/history    → past advisories + cumulative litres and ₦ saved
```

**Public by design.** A farmer should get an advisory without an account, and it keeps the
feature reachable even when auth or the database is degraded — which is exactly when it is
still needed.

## Configuration

```
LLM_API_KEY   = <key>                                  # blank → rules engine
LLM_BASE_URL  = https://integrate.api.nvidia.com/v1    # any OpenAI-compatible endpoint
LLM_MODEL     = meta/llama-3.1-70b-instruct
```

Provider-agnostic on purpose: swapping NVIDIA Build for Groq, OpenAI or a local Ollama
server is an environment change, not a code change.

## Sources

- **FAO-56** — Allen et al., *Crop evapotranspiration: guidelines for computing crop water
  requirements*. Crop coefficients (Table 12) and the ETc = ET₀ × Kc method.
- **Effective rainfall** — USDA-SCS style approximation.
- **Infection thresholds** — published temperature-and-leaf-wetness conditions per pathogen,
  encoded as constants in `agronomy.js` with each model's parameters visible in code.

## Verified

The water balance was checked against hand calculation:
6.48 mm × 10,000 × 5 ha ÷ 0.75 efficiency = **432,000 L** — exactly what the engine returns.
Rain of 18 mm (14.4 mm effective) correctly suppresses irrigation against a 6.48 mm demand.
The inverse thrips model fires in hot dry conditions while blight models stay silent, and
vice versa on humid nights.
