const config = require('../config');

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;
const IP_HOST_REGEX = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;

function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  return matches.map((u) => u.trim());
}

function safeParseUrl(rawUrl) {
  try {
    // Ensure a protocol so the URL constructor can parse it.
    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
    return new URL(withProtocol);
  } catch (err) {
    return null;
  }
}

function isShortenedUrl(hostname) {
  return config.LINKS.SHORTENER_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function isIpBasedUrl(hostname) {
  return IP_HOST_REGEX.test(hostname);
}

/**
 * A URL is "obfuscated/suspicious" if it uses tricks like:
 * - an "@" in the URL (userinfo tricks, e.g. real-site.com@evil.com)
 * - excessive subdomains
 * - punycode / non-ascii host
 * - suspicious top-level domains often used for throwaway spam sites
 */
function isObfuscatedUrl(rawUrl, parsed) {
  if (rawUrl.includes('@')) return true;
  if (!parsed) return true; // failed to parse at all -> treat as suspicious
  if (parsed.hostname.startsWith('xn--')) return true;
  const subdomainCount = parsed.hostname.split('.').length - 2;
  if (subdomainCount >= 3) return true;
  const suspiciousTlds = ['.xyz', '.top', '.click', '.zip', '.gq', '.tk', '.work'];
  if (suspiciousTlds.some((tld) => parsed.hostname.endsWith(tld))) return true;
  return false;
}

/**
 * Analyze all URLs found in a piece of content.
 * Returns per-url flags plus an overall summary used by the risk engine.
 */
function analyzeUrls(text) {
  const urls = extractUrls(text);
  const details = urls.map((rawUrl) => {
    const parsed = safeParseUrl(rawUrl);
    const hostname = parsed ? parsed.hostname.toLowerCase() : null;
    return {
      url: rawUrl,
      hostname,
      isShortened: hostname ? isShortenedUrl(hostname) : false,
      isIpBased: hostname ? isIpBasedUrl(hostname) : false,
      isObfuscated: isObfuscatedUrl(rawUrl, parsed)
    };
  });

  return {
    totalLinks: urls.length,
    excessiveLinks: urls.length > config.LINKS.MAX_LINKS_BEFORE_FLAG,
    hasShortened: details.some((d) => d.isShortened),
    hasIpBased: details.some((d) => d.isIpBased),
    hasObfuscated: details.some((d) => d.isObfuscated),
    domains: [...new Set(details.map((d) => d.hostname).filter(Boolean))],
    details
  };
}

module.exports = {
  extractUrls,
  safeParseUrl,
  isShortenedUrl,
  isIpBasedUrl,
  isObfuscatedUrl,
  analyzeUrls
};
