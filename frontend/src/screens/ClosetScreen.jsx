// FR03 - My virtual closet: a grid of my clothes, filter by type, delete.
import { useEffect, useState } from 'react';
import { callApi } from '../api.js';
import { CATEGORIES } from '../options.js';

export default function ClosetScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load my clothes when the screen opens
  useEffect(() => {
    callApi('GET', '/items')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(item) {
    if (!window.confirm(`Delete this ${item.category}?`)) return;
    try {
      await callApi('DELETE', `/items/${item.itemId}`);
      setItems(items.filter((i) => i.itemId !== item.itemId));
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = filter === 'all' ? items : items.filter((i) => i.category === filter);

  return (
    <section>
      <h2>My closet</h2>

      <div className="filters">
        {['all', ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={filter === c ? 'chip active' : 'chip'}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && shown.length === 0 && (
        <p className="muted">Nothing here yet. Use the Add tab to take a photo.</p>
      )}

      <div className="grid">
        {shown.map((item) => (
          <div className="card" key={item.itemId}>
            <img src={item.photoUrl} alt={`${item.colour} ${item.category}`} />
            <div className="card-body">
              <strong>{item.category}</strong>
              <span className="muted">{item.colour}</span>
              <button className="delete" onClick={() => handleDelete(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
