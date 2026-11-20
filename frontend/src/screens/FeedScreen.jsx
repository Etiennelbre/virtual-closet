// FR07 - Friends feed. SIMULATED: static sample posts, no backend.
const POSTS = [
  { name: 'Aoife', emoji: '🧥', text: 'Green raincoat + black jeans. Dublin weather, as usual!', likes: 12 },
  { name: 'Liam', emoji: '👟', text: 'New white sneakers in my closet today.', likes: 8 },
  { name: 'Sofia', emoji: '👗', text: 'Blue dress for the class presentation.', likes: 21 },
];

export default function FeedScreen() {
  return (
    <section>
      <div className="banner">Simulated - not part of this prototype</div>
      <h2>Friends feed</h2>
      {POSTS.map((post) => (
        <div className="card post" key={post.name}>
          <div className="post-photo">{post.emoji}</div>
          <div className="card-body">
            <strong>{post.name}</strong>
            <p>{post.text}</p>
            <span className="muted">❤️ {post.likes}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
