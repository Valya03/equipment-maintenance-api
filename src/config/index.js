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
};

export const config = {
  // ... существующие поля
  weatherThresholds: {
    maxWindSpeed: parseFloat(process.env.WEATHER_MAX_WIND_SPEED) || 10,
    maxPrecipitation: parseFloat(process.env.WEATHER_MAX_PRECIPITATION) || 0,
  },
};
