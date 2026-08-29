const http = require('http');
const assert = require('assert');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const get = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    }).on('error', reject);
  });
};

async function runTests() {
  console.log('Starting integration tests...');
  try {
    // Test 1: GET /api/articles
    console.log('Testing GET /api/articles...');
    const articlesRes = await get(`${BASE_URL}/api/articles`);
    assert.strictEqual(articlesRes.statusCode, 200, 'GET /api/articles should return 200');
    assert(Array.isArray(articlesRes.body), 'Response should be an array');
    assert(articlesRes.body.length > 0, 'Should return at least one article');
    console.log(`✓ GET /api/articles passed (${articlesRes.body.length} articles found)`);

    // Test 2: GET /api/articles/search?q=CRISPR
    console.log('Testing GET /api/articles/search?q=CRISPR...');
    const searchRes = await get(`${BASE_URL}/api/articles/search?q=CRISPR`);
    assert.strictEqual(searchRes.statusCode, 200, 'GET /api/articles/search should return 200');
    assert(Array.isArray(searchRes.body), 'Search response should be an array');
    assert(searchRes.body.some(a => a.title.includes('CRISPR')), 'Should find articles matching query');
    console.log(`✓ GET /api/articles/search passed`);

    // Test 3: GET /api/articles/:id
    const firstArticleId = articlesRes.body[0].id;
    console.log(`Testing GET /api/articles/${firstArticleId}...`);
    const detailRes = await get(`${BASE_URL}/api/articles/${firstArticleId}`);
    assert.strictEqual(detailRes.statusCode, 200, `GET /api/articles/${firstArticleId} should return 200`);
    assert.strictEqual(detailRes.body.id, firstArticleId, 'Article ID should match');
    assert(detailRes.body.title, 'Article should have a title');
    console.log(`✓ GET /api/articles/:id passed`);

    // Test 4: Static file check /data/quizzes.json
    console.log('Testing GET /data/quizzes.json...');
    const quizRes = await get(`${BASE_URL}/data/quizzes.json`);
    assert.strictEqual(quizRes.statusCode, 200, 'GET /data/quizzes.json should return 200');
    assert(quizRes.body[firstArticleId.toString()], 'Quiz data should exist for the article');
    console.log(`✓ GET /data/quizzes.json passed`);

    console.log('\nAll tests passed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed: ❌', error);
    process.exit(1);
  }
}

// Wait a bit for server to fully initialize before running tests
setTimeout(runTests, 1000);
