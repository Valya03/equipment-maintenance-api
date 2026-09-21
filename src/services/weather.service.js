import { config } from "../config/index.js";
import { equipmentService } from "./equipment.service.js";

// Пороги для определения пригодности окна (можно вынести в config)
const WEATHER_THRESHOLDS = {
  maxWindSpeed: 10, // м/с
  maxPrecipitation: 0, // мм
};

export class WeatherService {
  async getWeatherForEquipment(equipmentId) {
    const equipment = await equipmentService.getById(equipmentId);
    const { lat, lon } = equipment.location;

    const url = `${config.weatherApiUrl}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation,windspeed_10m&timezone=auto`;

    // Таймаут для внешнего запроса
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.requestTimeoutMs,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Weather API responded with ${response.status}`);
      }

      const data = await response.json();
      const current = data.current_weather;

      const isSuitable =
        current.windspeed <= WEATHER_THRESHOLDS.maxWindSpeed &&
        (current.precipitation || 0) <= WEATHER_THRESHOLDS.maxPrecipitation;

      return {
        equipmentId,
        location: { lat, lon },
        current: {
          temperature: current.temperature,
          windspeed: current.windspeed,
          precipitation: current.precipitation || 0,
          weathercode: current.weathercode,
        },
        suitableForOutdoorWork: isSuitable,
        thresholds: WEATHER_THRESHOLDS,
      };
    } catch (error) {
      clearTimeout(timeout);
      // Не роняю сервис при недоступности внешнего API
      throw new Error(`Не удалось получить прогноз погоды: ${error.message}`);
    }
  }
}

export const weatherService = new WeatherService();
