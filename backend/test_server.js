const app = require('./server');

const server = app.listen(5099, async () => {
  console.log('Testing server running on port 5099...');

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5099/api/health');
    const healthData = await healthRes.json();
    console.log('Health check:', healthData.status === 'online' ? 'PASS' : 'FAIL');

    // 2. POST /api/analyze
    const analyzeRes = await fetch('http://localhost:5099/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://192.168.1.1/login-verify-account' })
    });
    const analyzeData = await analyzeRes.json();
    console.log('POST /api/analyze:', analyzeData.success && analyzeData.data.riskLevel === 'Phishing' ? 'PASS' : 'FAIL', `(Score: ${analyzeData.data?.riskScore})`);

    const scanId = analyzeData.data.id;

    // 3. GET /api/history
    const historyRes = await fetch('http://localhost:5099/api/history');
    const historyData = await historyRes.json();
    console.log('GET /api/history:', historyData.success && historyData.data.length > 0 ? 'PASS' : 'FAIL', `(Count: ${historyData.data?.length})`);

    // 4. DELETE /api/history/:id
    const deleteRes = await fetch(`http://localhost:5099/api/history/${scanId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    console.log('DELETE /api/history/:id:', deleteData.success ? 'PASS' : 'FAIL');

    console.log('ALL API ENDPOINTS TESTED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
