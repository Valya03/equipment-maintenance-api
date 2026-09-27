import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000"],
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  weatherApiUrl:
    process.env.WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast",
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 5000,
  weatherThresholds: {
    maxWindSpeed: parseFloat(process.env.WEATHER_MAX_WIND_SPEED) || 10,
    maxPrecipitation: parseFloat(process.env.WEATHER_MAX_PRECIPITATION) || 0,
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || "equipment_maintenance",
    username: process.env.DB_USER || "app_user",
    password: process.env.DB_PASSWORD || "app_password",
    dialect: "postgres",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
    },
  },
};
