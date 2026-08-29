import dotenv from 'dotenv'

dotenv.config()

/** Read an env var, falling back to a default. Throws only if no value at all. */
function read(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: read('MONGODB_URI', 'mongodb://127.0.0.1:27017/mahafarm'),
  jwtSecret: read('JWT_SECRET', 'dev_secret_change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecure: (process.env.COOKIE_SECURE || 'false') === 'true',
  // Hardware integration: shared key the Arduino/bridge sends in x-device-key.
  deviceKey: process.env.DEVICE_KEY || '',
  // Optional: pin device readings to a specific farm (defaults to the first farm).
  deviceFarmId: process.env.DEVICE_FARM_ID || '',
}

export const isProd = env.nodeEnv === 'production'

// A small safety nudge for production deployments.
if (isProd && env.jwtSecret === 'dev_secret_change_me') {
  console.warn('⚠  JWT_SECRET is using the insecure default in production. Set a strong secret.')
}

if (isProd && env.mongoUri.includes('127.0.0.1')) {
  console.warn(
    '⚠  MONGODB_URI is not set — falling back to localhost (127.0.0.1), which will not exist ' +
      'on a hosted platform. Set MONGODB_URI to your MongoDB Atlas connection string.'
  )
}
