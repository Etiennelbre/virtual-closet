// FR02 - Add a piece of clothing with a photo.
// 1. take/choose a photo  2. resize it  3. send it (saved + analysed by the AI)
// 4. the user checks the type and colour, corrects them, and saves.
import { useState } from 'react';
import { callApi } from '../api.js';
import { resizePhoto } from '../resizePhoto.js';
import { CATEGORIES, COLOURS } from '../options.js';

export default function AddScreen({ onSaved }) {
  const [item, setItem] = useState(null);  // the item returned by the API
  const [category, setCategory] = useState('');
  const [colour, setColour] = useState('');
  const [loading, setLoading] = useState('');  // text shown while waiting
  const [error, setError] = useState('');

  async function handlePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    setError('');
    setItem(null);
    try {
      setLoading('Analysing your photo...');
      const imageBase64 = await resizePhoto(file);
      const saved = await callApi('POST', '/items', { imageBase64 });
      setItem(saved);
      setCategory(saved.category === 'unknown' ? '' : saved.category);
      setColour(saved.colour);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function handleSave() {
    try {
      setLoading('Saving...');
      await callApi('PUT', `/items/${item.itemId}`, { category, colour });
      onSaved();
    } catch (err) {
      setError(err.message);
      setLoading('');
    }
  }

  return (
    <section>
      <h2>Add clothes</h2>

      {/* capture="environment" opens the back camera on a phone */}
      <label className="button big">
        📷 Take or choose a photo
        <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} hidden />
      </label>

      {loading && <p>{loading}</p>}
      {error && <p className="error">{error}</p>}

      {item && !loading && (
        <div className="card result">
          <img src={item.photoUrl} alt="Your clothing" />
          <div className="card-body">
            <span className={item.aiSource === 'rekognition' ? 'badge' : 'badge simulated'}>
              AI: {item.aiSource === 'rekognition' ? 'Rekognition' : 'simulated'}
            </span>
            <p>
              Detected: <strong>{item.category}</strong>, <strong>{item.colour}</strong>
              {' '}({item.confidence}% sure)
            </p>
            {item.category === 'unknown' && (
              <p className="muted">The AI is not sure. Please choose the type.</p>
            )}

            <label>Type
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="" disabled>Choose a type</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label>Colour
              <select value={colour} onChange={(e) => setColour(e.target.value)}>
                {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <button className="button big" onClick={handleSave} disabled={!category}>
              Save
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
