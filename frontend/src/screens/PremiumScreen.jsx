// FR05 - Premium. SIMULATED: static comparison, no payment.
const ROWS = [
  ['Clothes in the closet', 'Up to 50', 'Unlimited'],
  ['AI type and colour detection', 'Yes', 'Yes'],
  ['Outfit of the day', '1 per day', 'Unlimited'],
  ['Background removal', 'No', 'Yes'],
  ['Ads', 'Yes', 'No'],
  ['Price', 'Free', '€2.99 / month'],
];

export default function PremiumScreen() {
  return (
    <section>
      <div className="banner">Simulated - not part of this prototype</div>
      <h2>Free or Premium?</h2>
      <table>
        <thead>
          <tr><th></th><th>Free</th><th>Premium</th></tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, free, premium]) => (
            <tr key={feature}><td>{feature}</td><td>{free}</td><td>{premium}</td></tr>
          ))}
        </tbody>
      </table>
      <button className="button big" disabled>Go Premium (not available)</button>
    </section>
  );
}
