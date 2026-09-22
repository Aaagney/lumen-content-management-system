const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000';

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend API Tests ---');
  let passed = 0;
  let failed = 0;

  // Clean up any existing test records for reporter 1 before testing
  const db = require('./config/db');
  await db.query('DELETE FROM appeals');
  await db.query('DELETE FROM reports');

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated request without x-user-id -> 401
    const unauth = await makeRequest('GET', '/api/reports');
    assert('Unauthenticated GET /api/reports returns 401', unauth.status === 401, `Got ${unauth.status}`);

    // 2. Normal user (ID 1: Priya) reports Article 1
    const reportArticle = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'article',
      reported_id: 1,
      reason: 'Misinformation',
      description: 'The claim in paragraph 2 needs citation.'
    });
    assert('Normal user reports article -> 201 Created', reportArticle.status === 201, `Got ${reportArticle.status} ${JSON.stringify(reportArticle.body)}`);
    const reportId = reportArticle.body.id;

    // 3. Duplicate active report prevention -> 409
    const duplicateReport = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'article',
      reported_id: 1,
      reason: 'Spam',
      description: 'Duplicate attempt'
    });
    assert('Duplicate pending report prevented -> 409 Conflict', duplicateReport.status === 409, `Got ${duplicateReport.status}`);

    // 4. Invalid reason rejection -> 400
    const invalidReason = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'article',
      reported_id: 1,
      reason: 'NotARealReason'
    });
    assert('Invalid report reason -> 400 Bad Request', invalidReason.status === 400, `Got ${invalidReason.status}`);

    // 5. Self-report prevention -> 400
    const selfReport = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'user',
      reported_id: 1,
      reason: 'Harassment'
    });
    assert('Self-report user -> 400 Bad Request', selfReport.status === 400, `Got ${selfReport.status}`);

    // 6. Normal user (ID 1) reports Comment 1
    const reportComment = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'comment',
      reported_id: 1,
      reason: 'Spam',
      description: 'Appears promotional'
    });
    assert('Normal user reports comment -> 201 Created', reportComment.status === 201, `Got ${reportComment.status}`);

    // 7. Normal user (ID 1) reports User 2
    const reportUser = await makeRequest('POST', '/api/reports', { 'x-user-id': '1' }, {
      reported_type: 'user',
      reported_id: 2,
      reason: 'Inappropriate Content',
      description: 'User avatar violates guidelines'
    });
    assert('Normal user reports user -> 201 Created', reportUser.status === 201, `Got ${reportUser.status}`);

    // 8. Normal user views their own reports
    const myReports = await makeRequest('GET', '/api/reports', { 'x-user-id': '1' });
    assert('Normal user retrieves own reports -> 200 OK', myReports.status === 200 && Array.isArray(myReports.body), `Got ${myReports.status}`);
    const allBelongToUser = myReports.body.every(r => r.reporter_id === 1);
    assert('Normal user only sees their own reports', allBelongToUser, `Found other users reports`);

    // 9. Normal user tries to update report status -> 403 Forbidden
    const unauthStatusUpdate = await makeRequest('PUT', `/api/reports/${reportId}/status`, { 'x-user-id': '1' }, {
      status: 'Resolved',
      admin_note: 'Hacking status'
    });
    assert('Normal user cannot update report status -> 403 Forbidden', unauthStatusUpdate.status === 403, `Got ${unauthStatusUpdate.status}`);

    // 10. Admin user (ID 3: Amara) views all reports
    const adminReports = await makeRequest('GET', '/api/reports', { 'x-user-id': '3' });
    assert('Admin retrieves all reports -> 200 OK', adminReports.status === 200 && adminReports.body.length >= 3, `Got ${adminReports.status}`);

    // 11. Admin updates report status and adds admin note + AI placeholders
    const adminUpdate = await makeRequest('PUT', `/api/reports/${reportId}/status`, { 'x-user-id': '3' }, {
      status: 'Under Review',
      admin_note: 'Under investigation by senior editor.',
      risk_score: 45.5,
      risk_level: 'Medium',
      ai_result: 'Needs Review',
      ai_reason: 'Flagged for factual verification'
    });
    assert('Admin updates report status -> 200 OK', adminUpdate.status === 200, `Got ${adminUpdate.status}`);

    // 12. Normal user (ID 1) submits Appeal on the report
    const appealSubmit = await makeRequest('POST', '/api/appeals', { 'x-user-id': '1' }, {
      report_id: reportId,
      reason: 'Dispute moderation delay',
      description: 'Providing authoritative peer-reviewed citation confirming paragraph 2 is incorrect.'
    });
    assert('Normal user submits appeal -> 201 Created', appealSubmit.status === 201, `Got ${appealSubmit.status}`);
    const appealId = appealSubmit.body.id;

    // 13. Normal user duplicate appeal -> 409 Conflict
    const duplicateAppeal = await makeRequest('POST', '/api/appeals', { 'x-user-id': '1' }, {
      report_id: reportId,
      reason: 'Repeated appeal',
      description: 'Same thing'
    });
    assert('Duplicate appeal prevented -> 409 Conflict', duplicateAppeal.status === 409, `Got ${duplicateAppeal.status}`);

    // 14. Normal user views own appeals
    const myAppeals = await makeRequest('GET', '/api/appeals', { 'x-user-id': '1' });
    assert('Normal user retrieves own appeals -> 200 OK', myAppeals.status === 200 && myAppeals.body.some(a => a.id === appealId), `Got ${myAppeals.status}`);

    // 15. Admin views all appeals
    const adminAppeals = await makeRequest('GET', '/api/appeals', { 'x-user-id': '3' });
    assert('Admin retrieves all appeals -> 200 OK', adminAppeals.status === 200 && adminAppeals.body.length >= 1, `Got ${adminAppeals.status}`);

    // 16. Normal user tries to update appeal status -> 403 Forbidden
    const unauthAppealUpdate = await makeRequest('PUT', `/api/appeals/${appealId}/status`, { 'x-user-id': '1' }, {
      status: 'Approved'
    });
    assert('Normal user cannot update appeal status -> 403 Forbidden', unauthAppealUpdate.status === 403, `Got ${unauthAppealUpdate.status}`);

    // 17. Admin approves/updates appeal status
    const adminAppealUpdate = await makeRequest('PUT', `/api/appeals/${appealId}/status`, { 'x-user-id': '3' }, {
      status: 'Approved',
      admin_note: 'Citation accepted. Content updated accordingly.'
    });
    assert('Admin updates appeal status -> 200 OK', adminAppealUpdate.status === 200, `Got ${adminAppealUpdate.status}`);

    // 18. Check report details includes the appeal
    const reportDetails = await makeRequest('GET', `/api/reports/${reportId}`, { 'x-user-id': '1' });
    assert('GET /api/reports/:id includes appeals array', reportDetails.status === 200 && reportDetails.body.appeals.length >= 1, `Got ${reportDetails.status}`);

    // 19. Verify existing Article endpoints still work
    const articlesRes = await makeRequest('GET', '/api/articles');
    assert('Existing GET /api/articles returns 200 OK', articlesRes.status === 200 && Array.isArray(articlesRes.body), `Got ${articlesRes.status}`);

    const singleArticleRes = await makeRequest('GET', '/api/articles/1');
    assert('Existing GET /api/articles/1 returns 200 OK', singleArticleRes.status === 200 && singleArticleRes.body.title, `Got ${singleArticleRes.status}`);

    // 20. Verify existing User endpoints still work
    const userRes = await makeRequest('GET', '/api/users/1');
    assert('Existing GET /api/users/1 returns 200 OK', userRes.status === 200 && userRes.body.name === 'Priya Mehta', `Got ${userRes.status}`);

    console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Start temporary test server if server is not already running
const serverApp = require('./server.js');
// Wait 1 second for port to bind, then run tests
setTimeout(runTests, 1000);
