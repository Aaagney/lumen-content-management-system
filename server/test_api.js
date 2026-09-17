const http = require('http');
const assert = require('assert');
const { pool } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Phase 3 API Integration Verification ---');
  try {
    // 1. Health check
    console.log('1. Testing /health...');
    const health = await makeRequest('GET', '/health');
    assert.strictEqual(health.status, 200);
    console.log('   ✓ Health check passed');

    // 2. Stats
    console.log('2. Testing GET /api/stats...');
    const stats = await makeRequest('GET', '/api/stats');
    assert.strictEqual(stats.status, 200);
    assert(stats.body.total_users > 0, 'Should return total users > 0');
    console.log(`   ✓ Stats passed: ${stats.body.total_users} users, ${stats.body.trusted_users} trusted, ${stats.body.normal_users} normal, ${stats.body.low_trust_users} low trust`);

    // 3. Get all users
    console.log('3. Testing GET /api/users...');
    const usersRes = await makeRequest('GET', '/api/users');
    assert.strictEqual(usersRes.status, 200);
    assert(Array.isArray(usersRes.body) && usersRes.body.length > 0);
    console.log(`   ✓ Users list passed: ${usersRes.body.length} users returned`);

    // 4. Test Search filter
    console.log('4. Testing GET /api/users?search=Priya...');
    const searchRes = await makeRequest('GET', '/api/users?search=Priya');
    assert.strictEqual(searchRes.status, 200);
    assert(searchRes.body.some(u => u.name.includes('Priya')));
    console.log('   ✓ Search filter passed');

    // 5. Test Trust Level filter
    console.log('5. Testing GET /api/users?trust_level=Trusted...');
    const trustedRes = await makeRequest('GET', '/api/users?trust_level=Trusted');
    assert.strictEqual(trustedRes.status, 200);
    assert(trustedRes.body.every(u => u.trust_level === 'Trusted'));
    console.log(`   ✓ Trust Level filter passed: ${trustedRes.body.length} trusted users`);

    // 6. Get single user
    const testUserId = usersRes.body[0].id;
    console.log(`6. Testing GET /api/users/${testUserId}...`);
    const singleUser = await makeRequest('GET', `/api/users/${testUserId}`);
    assert.strictEqual(singleUser.status, 200);
    assert.strictEqual(singleUser.body.id, testUserId);
    console.log(`   ✓ Single user detail passed for "${singleUser.body.name}" (Score: ${singleUser.body.trust_score}, Level: ${singleUser.body.trust_level})`);

    // 7. Get user reputation history
    console.log(`7. Testing GET /api/users/${testUserId}/reputation-history...`);
    const historyRes = await makeRequest('GET', `/api/users/${testUserId}/reputation-history`);
    assert.strictEqual(historyRes.status, 200);
    assert(Array.isArray(historyRes.body));
    console.log(`   ✓ Reputation history passed: ${historyRes.body.length} entries`);

    // 8. Test Update Reputation Action
    console.log(`8. Testing POST /api/users/${testUserId}/reputation (Add +5 Approved Content)...`);
    const prevScore = singleUser.body.trust_score;
    const updateRes = await makeRequest('POST', `/api/users/${testUserId}/reputation`, {
      action: 'Approved Quality Content',
      points: 5,
      reason: 'Automated test quality article approval',
      actionCategory: 'positive'
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.user.trust_score, Math.min(100, prevScore + 5));
    console.log(`   ✓ Reputation updated: ${prevScore} -> ${updateRes.body.user.trust_score} (Level: ${updateRes.body.user.trust_level})`);

    // 9. Verify history entry in MySQL
    const updatedHistory = await makeRequest('GET', `/api/users/${testUserId}/reputation-history`);
    assert.strictEqual(updatedHistory.body[0].action, 'Approved Quality Content');
    console.log('   ✓ History entry persisted and verified in MySQL!');

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND API & MYSQL TESTS PASSED! 🎉');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

// Start tests
setTimeout(runTests, 1500);
