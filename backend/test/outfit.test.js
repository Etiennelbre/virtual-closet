// Tests for the outfit rules. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickOutfit } from '../src/outfit.js';

const top = { itemId: 't1', category: 'top' };
const bottom = { itemId: 'b1', category: 'bottom' };
const dress = { itemId: 'd1', category: 'dress' };
const shoes = { itemId: 's1', category: 'shoes' };
const coat = { itemId: 'c1', category: 'outerwear' };

const warm = { city: 'Dublin', temperature: 20, rainChance: 10, available: true };
const cold = { city: 'Dublin', temperature: 5, rainChance: 10, available: true };
const rainy = { city: 'Dublin', temperature: 18, rainChance: 80, available: true };

const categoriesOf = (outfit) => outfit.items.map((item) => item.category).sort();

test('warm day: top + bottom + shoes, no coat', () => {
  const outfit = pickOutfit([top, bottom, shoes, coat], warm);
  assert.deepEqual(categoriesOf(outfit), ['bottom', 'shoes', 'top']);
  assert.match(outfit.explanation, /no coat needed/);
});

test('cold day: a coat is added', () => {
  const outfit = pickOutfit([top, bottom, shoes, coat], cold);
  assert.ok(categoriesOf(outfit).includes('outerwear'));
});

test('rainy day: a coat is added even if it is warm', () => {
  const outfit = pickOutfit([top, bottom, shoes, coat], rainy);
  assert.ok(categoriesOf(outfit).includes('outerwear'));
});

test('only a dress: the dress is chosen', () => {
  const outfit = pickOutfit([dress, shoes], warm);
  assert.deepEqual(categoriesOf(outfit), ['dress', 'shoes']);
});

test('dress or top + bottom depends on the coin flip', () => {
  const items = [top, bottom, dress, shoes];
  const withDress = pickOutfit(items, warm, () => 0.1); // coin < 0.5 -> dress
  const withTop = pickOutfit(items, warm, () => 0.9); // coin >= 0.5 -> top + bottom
  assert.deepEqual(categoriesOf(withDress), ['dress', 'shoes']);
  assert.deepEqual(categoriesOf(withTop), ['bottom', 'shoes', 'top']);
});

test('missing clothes are listed in the explanation', () => {
  const outfit = pickOutfit([top], cold);
  assert.match(outfit.explanation, /a bottom/);
  assert.match(outfit.explanation, /shoes/);
  assert.match(outfit.explanation, /coat or jacket/);
});

test('empty closet: no items, and a helpful message', () => {
  const outfit = pickOutfit([], warm);
  assert.equal(outfit.items.length, 0);
  assert.match(outfit.explanation, /Add a top, a bottom, shoes/);
});

test('weather unavailable is said in the explanation', () => {
  const noWeather = { city: 'Dublin', temperature: 12, rainChance: 0, available: false };
  const outfit = pickOutfit([top, bottom, shoes], noWeather);
  assert.match(outfit.explanation, /Weather unavailable/);
});

test('random choice: different numbers pick different tops', () => {
  const top2 = { itemId: 't2', category: 'top' };
  const items = [top, top2, bottom, shoes];
  const first = pickOutfit(items, warm, () => 0.0);
  const second = pickOutfit(items, warm, () => 0.99);
  assert.equal(first.items[0].itemId, 't1');
  assert.equal(second.items[0].itemId, 't2');
});
