// Today's weather from Open-Meteo (free, no API key).

const FALLBACK_TEMPERATURE = 12;

// getWeather(city) -> { city, temperature, rainChance, available }
export async function getWeather(city) {
  try {
    // 1. City name -> latitude and longitude
    const geo = await getJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
    );
    const place = geo.results?.[0];
    if (!place) throw new Error(`City not found: ${city}`);

    // 2. Today's max temperature and chance of rain at that place
    const forecast = await getJson(
      'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${place.latitude}&longitude=${place.longitude}`
      + '&daily=temperature_2m_max,precipitation_probability_max'
      + '&timezone=auto&forecast_days=1',
    );

    return {
      city: place.name,
      temperature: Math.round(forecast.daily.temperature_2m_max[0]),
      rainChance: forecast.daily.precipitation_probability_max[0] ?? 0,
      available: true,
    };
  } catch (err) {
    // No weather? We still suggest an outfit, with a mild default temperature.
    console.error('Weather unavailable:', err.message);
    return { city, temperature: FALLBACK_TEMPERATURE, rainChance: 0, available: false };
  }
}

// Downloads a URL and reads the JSON. Gives up after 4 seconds.
async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`Open-Meteo answered ${response.status}`);
  return response.json();
}
