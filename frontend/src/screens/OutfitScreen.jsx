// FR04 - Outfit of the day, based on today's weather in my city.
import { useEffect, useState } from 'react';
import { callApi } from '../api.js';

export default function OutfitScreen() {
  const [city, setCity] = useState('Dublin');
  const [outfit, setOutfit] = useState(null);  // { weather, items, explanation }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadOutfit() {
    setLoading(true);
    setError('');
    try {
      setOutfit(await callApi('GET', `/outfit?city=${encodeURIComponent(city)}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Get a first outfit when the screen opens
  useEffect(() => { loadOutfit(); }, []);

  return (
    <section>
      <h2>Outfit of the day</h2>

      <form className="row" onSubmit={(e) => { e.preventDefault(); loadOutfit(); }}>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        <button className="button">Go</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {outfit && !loading && (
        <>
          <div className="weather">
            {outfit.weather.available ? (
              <>
                <strong>{outfit.weather.city}</strong>
                <span>🌡️ {outfit.weather.temperature}°C</span>
                <span>🌧️ {outfit.weather.rainChance}%</span>
              </>
            ) : (
              <span>Weather unavailable (using {outfit.weather.temperature}°C)</span>
            )}
          </div>

          <div className="grid">
            {outfit.items.map((item) => (
              <div className="card" key={item.itemId}>
                <img src={item.photoUrl} alt={`${item.colour} ${item.category}`} />
                <div className="card-body">
                  <strong>{item.category}</strong>
                  <span className="muted">{item.colour}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="explanation">{outfit.explanation}</p>
          <button className="button big" onClick={loadOutfit}>Another one</button>
        </>
      )}
    </section>
  );
}
