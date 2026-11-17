// Outfit of the day: simple rules, no AWS calls, so it is easy to test.
//
// Rules:
//   1. a top + a bottom, OR a dress
//   2. plus shoes
//   3. plus outerwear if it is cold (below 12°C) or rainy (rain chance above 50%)
// Clothes are chosen at random, so "Another one" gives a new outfit.

export const COLD_BELOW = 12; // °C
export const RAINY_ABOVE = 50; // %

// pickOutfit(items, weather) -> { items, explanation }
// "random" can be replaced in tests to get a predictable result.
export function pickOutfit(items, weather, random = Math.random) {
  const ofType = (category) => items.filter((item) => item.category === category);
  const pickOne = (list) => list[Math.floor(random() * list.length)];

  const tops = ofType('top');
  const bottoms = ofType('bottom');
  const dresses = ofType('dress');
  const shoes = ofType('shoes');
  const outerwear = ofType('outerwear');

  const chosen = [];
  const missing = [];

  // Rule 1: a dress, or a top + a bottom (if both are possible, flip a coin)
  const canWearDress = dresses.length > 0;
  const canWearTopAndBottom = tops.length > 0 && bottoms.length > 0;
  if (canWearDress && (!canWearTopAndBottom || random() < 0.5)) {
    chosen.push(pickOne(dresses));
  } else {
    if (tops.length > 0) chosen.push(pickOne(tops));
    else missing.push('a top');
    if (bottoms.length > 0) chosen.push(pickOne(bottoms));
    else missing.push('a bottom');
  }

  // Rule 2: shoes
  if (shoes.length > 0) chosen.push(pickOne(shoes));
  else missing.push('shoes');

  // Rule 3: outerwear when cold or rainy
  const isCold = weather.temperature < COLD_BELOW;
  const isRainy = weather.rainChance > RAINY_ABOVE;
  const needsOuterwear = isCold || isRainy;
  if (needsOuterwear) {
    if (outerwear.length > 0) chosen.push(pickOne(outerwear));
    else missing.push('a coat or jacket');
  }

  return { items: chosen, explanation: explain(weather, isCold, isRainy, missing) };
}

// Builds a short sentence explaining the choice.
function explain(weather, isCold, isRainy, missing) {
  const parts = [];

  if (!weather.available) {
    parts.push(`Weather unavailable, so we assume ${weather.temperature}°C.`);
  } else {
    parts.push(`${weather.temperature}°C with ${weather.rainChance}% chance of rain in ${weather.city}.`);
  }

  if (isCold && isRainy) parts.push('Cold and rainy: take a coat.');
  else if (isCold) parts.push('It is cold: take a coat.');
  else if (isRainy) parts.push('Rain is likely: take a jacket.');
  else parts.push('Mild weather: no coat needed.');

  if (missing.length > 0) {
    parts.push(`Add ${missing.join(', ')} to your closet to complete the outfit.`);
  }
  return parts.join(' ');
}
