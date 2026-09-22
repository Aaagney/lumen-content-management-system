/**
 * Lightweight, deterministic text normalization + similarity utilities.
 * No external services / AI calls — just string processing.
 */

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ') // strip URLs before comparing prose
    .replace(/[^\w\s]/g, ' ')        // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

function toTokenSet(text) {
  return new Set(tokenize(text));
}

/**
 * Jaccard similarity between two strings, based on token sets.
 * Returns a value between 0 (completely different) and 1 (identical set of words).
 */
function jaccardSimilarity(textA, textB) {
  const setA = toTokenSet(textA);
  const setB = toTokenSet(textB);

  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const token of setA) {
    if (setB.has(token)) intersectionSize += 1;
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Exact-match check on normalized text (catches copy-paste with only
 * whitespace/punctuation/case differences).
 */
function isExactNormalizedMatch(textA, textB) {
  const a = normalizeText(textA);
  const b = normalizeText(textB);
  return a.length > 0 && a === b;
}

module.exports = {
  normalizeText,
  tokenize,
  toTokenSet,
  jaccardSimilarity,
  isExactNormalizedMatch
};
