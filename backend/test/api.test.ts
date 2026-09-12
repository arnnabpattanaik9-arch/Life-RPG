import http from 'http';
import app from '../src/index.js';

function request(
  port: number,
  path: string,
  method = 'GET',
  body?: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode || 500, data, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

async function runApiTests() {
  console.log('--- Starting API HTTP Endpoint Tests ---');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as { port: number };
  const port = address.port;
  console.log(`Ephemeral test server listening on port ${port}`);

  try {
    // 1. Health check
    console.log('Testing GET /api/health...');
    const health = await request(port, '/api/health');
    assert(health.status === 200, `Expected 200, got ${health.status}`);
    assert(health.data.status === 'ok', `Expected status: ok, got ${health.data.status}`);
    console.log('✔ GET /api/health returned 200 OK.');

    // 2. Unauthenticated access guards
    console.log('Testing Unauthenticated Route Guards (Security Requirement #5 & #6)...');
    const unauthQuests = await request(port, '/api/quests');
    assert(unauthQuests.status === 401, `Expected 401 on /api/quests, got ${unauthQuests.status}`);
    assert(unauthQuests.data.message.includes('Not authenticated'), `Expected auth message, got: ${unauthQuests.data.message}`);

    const unauthChar = await request(port, '/api/character');
    assert(unauthChar.status === 401, `Expected 401 on /api/character, got ${unauthChar.status}`);

    const unauthShop = await request(port, '/api/shop/purchase', 'POST', { itemId: 'weapon_iron_sword' });
    assert(unauthShop.status === 401, `Expected 401 on /api/shop/purchase, got ${unauthShop.status}`);
    console.log('✔ All protected routes strictly enforce 401 session guard.');

    // 3. Validation guard on invalid signup
    console.log('Testing Zod Input Validation on Auth...');
    const invalidSignup = await request(port, '/api/auth/signup', 'POST', {
      name: '',
      email: 'not-an-email',
      password: '123', // less than 6 chars
    });
    assert(invalidSignup.status === 400, `Expected 400 validation error, got ${invalidSignup.status}`);
    console.log(`✔ Invalid signup rejected with 400: "${invalidSignup.data.message}"`);

    // 4. Unknown endpoint 404
    console.log('Testing 404 Handler...');
    const notFound = await request(port, '/api/non-existent-endpoint');
    assert(notFound.status === 404, `Expected 404, got ${notFound.status}`);
    console.log('✔ 404 handler verified.');

    // 5. Unauthenticated /api/auth/me returns null
    console.log('Testing GET /api/auth/me unauthenticated state...');
    const meRes = await request(port, '/api/auth/me');
    assert(meRes.status === 200 && meRes.data === null, 'Expected 200 with null for unauthenticated me');
    console.log('✔ GET /api/auth/me cleanly returns null when unauthenticated.');

    console.log('\n--- ALL API HTTP ENDPOINT TESTS PASSED (100% SUCCESS) ---');
    process.exit(0);
  } finally {
    server.close();
  }
}

runApiTests().catch((err) => {
  console.error('API Test suite failed:', err);
  process.exit(1);
});
