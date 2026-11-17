// Recognises the type and colour of a piece of clothing with Amazon Rekognition.

import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

// The 6 categories of our app, and the colours the user can choose from.
// (The frontend has the same lists in src/options.js.)
export const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];
export const COLOURS = [
  'black', 'white', 'grey', 'beige', 'brown', 'red', 'orange',
  'yellow', 'green', 'blue', 'purple', 'pink', 'other',
];

// Rekognition label name -> our category.
const CATEGORY_BY_LABEL = {
  'T-Shirt': 'top', 'Shirt': 'top', 'Blouse': 'top', 'Sweater': 'top',
  'Sweatshirt': 'top', 'Hoodie': 'top', 'Tank Top': 'top', 'Long Sleeve': 'top',
  'Pants': 'bottom', 'Jeans': 'bottom', 'Shorts': 'bottom', 'Skirt': 'bottom',
  'Dress': 'dress', 'Gown': 'dress',
  'Coat': 'outerwear', 'Jacket': 'outerwear', 'Blazer': 'outerwear', 'Raincoat': 'outerwear',
  'Shoe': 'shoes', 'Footwear': 'shoes', 'Sneaker': 'shoes', 'Boot': 'shoes',
  'Sandal': 'shoes', 'High Heel': 'shoes',
  'Hat': 'accessory', 'Cap': 'accessory', 'Bag': 'accessory', 'Handbag': 'accessory',
  'Scarf': 'accessory', 'Belt': 'accessory', 'Sunglasses': 'accessory', 'Tie': 'accessory',
};

const rekognition = new RekognitionClient({});

// analysePhoto(bytes) -> { category, colour, confidence, source }
export async function analysePhoto(bytes) {
  if (process.env.USE_REKOGNITION === 'false') {
    return fakeResult();
  }
  try {
    const response = await rekognition.send(new DetectLabelsCommand({
      Image: { Bytes: bytes },
      Features: ['GENERAL_LABELS', 'IMAGE_PROPERTIES'],
      MinConfidence: 70,
    }));

    // Labels come sorted by confidence: take the first one we know.
    const match = (response.Labels || []).find((label) => CATEGORY_BY_LABEL[label.Name]);

    return {
      category: match ? CATEGORY_BY_LABEL[match.Name] : 'unknown', // "unknown": the user picks
      colour: dominantColour(response.ImageProperties),
      confidence: match ? Math.round(match.Confidence) : 0,
      source: 'rekognition',
    };
  } catch (err) {
    // Rekognition not available (region, account, quota...): keep the app working.
    console.error('Rekognition failed, using a simulated result:', err.message);
    return fakeResult();
  }
}

// The main colour of the object in front (the clothing), as a simple name.
function dominantColour(imageProperties) {
  const colours = imageProperties?.Foreground?.DominantColors
    || imageProperties?.DominantColors
    || [];
  if (colours.length === 0) return 'other';
  let name = (colours[0].SimplifiedColor || '').toLowerCase();
  if (name === 'gray') name = 'grey';
  return COLOURS.includes(name) ? name : 'other';
}

// Used when Rekognition is switched off or fails. The app shows "AI: simulated".
function fakeResult() {
  const randomOf = (list) => list[Math.floor(Math.random() * list.length)];
  return {
    category: randomOf(CATEGORIES),
    colour: randomOf(COLOURS),
    confidence: 50,
    source: 'simulated',
  };
}
