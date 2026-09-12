import http from 'http';
import app from '../src/index.js';
import { prisma } from '../src/db/prisma.js';

class TestClient {
  private cookies: string[] = [];
  private baseUrl: string;

  constructor(port: number) {
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async request<T>(
    path: string,
    method = 'GET',
    body?: Record<string, unknown>
  ): Promise<{ status: number; data: T }> {
    const url = new URL(path, this.baseUrl);
    const payload = body ? JSON.stringify(body) : undefined;

    return new Promise((resolve, reject) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.cookies.length > 0) {
        headers['Cookie'] = this.cookies.join('; ');
      }
      if (payload) {
        headers['Content-Length'] = String(Buffer.byteLength(payload));
      }

      const req = http.request(
        url,
        { method, headers },
        (res) => {
          // Capture Set-Cookie headers
          const setCookie = res.headers['set-cookie'];
          if (setCookie) {
            setCookie.forEach((cookieStr) => {
              const cookiePart = cookieStr.split(';')[0];
              this.cookies = this.cookies.filter(
                (c) => !c.startsWith(cookiePart.split('=')[0] + '=')
              );
              this.cookies.push(cookiePart);
            });
          }

          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            let data;
            try {
              data = JSON.parse(raw);
            } catch {
              data = raw;
            }
            resolve({ status: res.statusCode || 500, data });
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  clearCookies() {
    this.cookies = [];
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

async function runE2EIntegration() {
  console.log('--- Starting End-to-End Frontend/Backend Integration Test ---');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;
  console.log(`Live test server listening on port ${port}`);

  const clientAria = new TestClient(port);
  const clientBob = new TestClient(port);

  const ariaEmail = `aria_${Date.now()}@liferpg.test`;
  const bobEmail = `bob_${Date.now()}@liferpg.test`;

  try {
    // 1. Health check
    const health = await clientAria.request<{ status: string }>('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Healthcheck failed');
    console.log('1. Health check OK.');

    // 2. Aria Signup
    console.log('2. Testing Aria signup...');
    const signupAria = await clientAria.request<{ id: string; name: string; email: string }>(
      '/api/auth/signup',
      'POST',
      {
        name: 'Aria the Diligent',
        email: ariaEmail,
        password: 'Password123!',
      }
    );
    assert(signupAria.status === 201, `Signup failed with status ${signupAria.status}`);
    assert(signupAria.data.email === ariaEmail, 'Email must match');
    const ariaId = signupAria.data.id;
    console.log(`✔ Aria registered with ID: ${ariaId}`);

    // 3. Aria Session Restoration via HttpOnly Cookie (GET /api/auth/me)
    console.log('3. Testing session restoration (GET /api/auth/me)...');
    const meAria = await clientAria.request<{ id: string; name: string }>(
      '/api/auth/me'
    );
    assert(meAria.status === 200, 'Session restore failed');
    assert(meAria.data?.id === ariaId, 'Session user ID must match Aria');
    console.log('✔ Session restored from HttpOnly cookie.');

    // 4. Aria Initial Character Sheet (GET /api/character)
    console.log('4. Testing initial character retrieval...');
    const charAria = await clientAria.request<{
      stats: { level: number; xp: number; gold: number; attributes: Record<string, number> };
    }>('/api/character');
    assert(charAria.status === 200, 'Failed to fetch character');
    assert(charAria.data.stats.level === 1, 'Initial level must be 1');
    assert(charAria.data.stats.xp === 0, 'Initial XP must be 0');
    assert(charAria.data.stats.gold === 25, 'Initial Gold must be 25');
    assert(charAria.data.stats.attributes.intellect === 1, 'Initial intellect must be 1');
    console.log('✔ Character sheet initialized correctly.');

    // 5. Quest Creation (POST /api/quests)
    console.log('5. Testing Quest Creation (POST /api/quests)...');
    const newQuest = await clientAria.request<{ id: string; title: string; completed: boolean }>(
      '/api/quests',
      'POST',
      {
        title: 'Complete Algorithms Chapter',
        notes: 'Read pages 40-70',
        attribute: 'intellect',
        difficulty: 'medium', // Rewards 60 XP, 16 Gold
        type: 'daily',
      }
    );
    assert(newQuest.status === 201, 'Quest creation failed');
    assert(!newQuest.data.completed, 'New quest must be uncompleted');
    const questId = newQuest.data.id;
    console.log(`✔ Quest created with ID: ${questId}`);

    // 6. Quest Listing (GET /api/quests)
    console.log('6. Testing Quest Listing...');
    const listQ = await clientAria.request<any[]>('/api/quests');
    assert(listQ.status === 200, 'List quests failed');
    assert(listQ.data.length === 1, 'Aria must have exactly 1 quest');
    console.log('✔ Quest list verified.');

    // 7. Quest Completion & Server-trusted Rewards (POST /api/quests/:id/complete)
    console.log('7. Completing quest with server-authoritative calculations...');
    const compResult = await clientAria.request<{
      xpAwarded: number;
      goldAwarded: number;
      attribute: string;
      newLevel: number;
      newlyUnlocked: any[];
    }>(`/api/quests/${questId}/complete`, 'POST');
    assert(compResult.status === 200, `Completion failed with status ${compResult.status}`);
    assert(compResult.data.xpAwarded === 60, `Expected 60 XP awarded, got ${compResult.data.xpAwarded}`);
    assert(compResult.data.goldAwarded === 16, `Expected 16 Gold awarded, got ${compResult.data.goldAwarded}`);
    assert(compResult.data.attribute === 'intellect', 'Attribute must be intellect');
    assert(compResult.data.newlyUnlocked.some(a => a.id === 'first_quest'), 'First Quest achievement must unlock');
    console.log('✔ Quest completed: +60 XP, +16 Gold, unlocked "First Quest" achievement.');

    // 8. Duplicate Completion Prevention (Security Requirement #4)
    console.log('8. Testing duplicate completion prevention...');
    const dupResult = await clientAria.request<{ message: string }>(
      `/api/quests/${questId}/complete`,
      'POST'
    );
    assert(dupResult.status === 400, `Expected 400 on duplicate completion, got ${dupResult.status}`);
    console.log(`✔ Duplicate completion rejected: "${dupResult.data.message}"`);

    // 9. Shop Purchase (POST /api/shop/purchase)
    // Aria now has 25 + 16 = 41 Gold. Let's purchase Elixir of Focus (cost: 40 Gold)
    console.log('9. Testing Shop Purchase (POST /api/shop/purchase)...');
    const buyResult = await clientAria.request<{
      stats: { gold: number };
      inventory: Array<{ itemId: string; quantity: number }>;
    }>('/api/shop/purchase', 'POST', { itemId: 'potion_focus' });
    assert(buyResult.status === 200, `Purchase failed: ${buyResult.status}`);
    assert(buyResult.data.stats.gold === 1, `Expected 1 Gold remaining (41 - 40), got ${buyResult.data.stats.gold}`);
    assert(buyResult.data.inventory.some(i => i.itemId === 'potion_focus' && i.quantity === 1), 'Potion must be in inventory');
    console.log('✔ Purchase successful: 40 Gold deducted, item added to inventory.');

    // 10. Insufficient Gold Check (Security Requirement #1 & #7)
    console.log('10. Testing insufficient funds prevention...');
    const brokeBuy = await clientAria.request<{ message: string }>(
      '/api/shop/purchase',
      'POST',
      { itemId: 'potion_focus' }
    );
    assert(brokeBuy.status === 400, `Expected 400 for insufficient gold, got ${brokeBuy.status}`);
    console.log(`✔ Insufficient gold rejected: "${brokeBuy.data.message}"`);

    // 11. Focus Dungeon & Level-Up Test (POST /api/focus/complete)
    // Aria currently has Level 1, 60 XP.
    // Level 1 -> 2 threshold is 100 XP.
    // Running a 25-minute focus session awards: round(25 * 1.6) = 40 XP, round(25 * 0.4) = 10 Gold.
    // 60 + 40 = 100 XP -> exactly triggers Level Up to Level 2!
    console.log('11. Testing Focus Dungeon session and Level-Up trigger...');
    const focusResult = await clientAria.request<{
      xpAwarded: number;
      goldAwarded: number;
      leveledUp: boolean;
      newLevel: number;
      previousLevel: number;
    }>('/api/focus/complete', 'POST', { minutes: 25 });
    assert(focusResult.status === 200, 'Focus session failed');
    assert(focusResult.data.xpAwarded === 40, `Expected 40 XP, got ${focusResult.data.xpAwarded}`);
    assert(focusResult.data.goldAwarded === 10, `Expected 10 Gold, got ${focusResult.data.goldAwarded}`);
    assert(focusResult.data.leveledUp === true, 'Aria must level up to Level 2');
    assert(focusResult.data.previousLevel === 1, 'Previous level must be 1');
    assert(focusResult.data.newLevel === 2, 'New level must be 2');
    console.log('✔ Focus Dungeon completed: +40 XP, +10 Gold, Level 1 -> 2 Level-Up triggered!');

    // 12. Cross-User Data Isolation Check (Security Requirements #5 & #18)
    console.log('12. Testing Cross-User Data Isolation (Bob)...');
    const signupBob = await clientBob.request<{ id: string }>('/api/auth/signup', 'POST', {
      name: 'Bob the Cautious',
      email: bobEmail,
      password: 'Password123!',
    });
    assert(signupBob.status === 201, 'Bob signup failed');
    const bobId = signupBob.data.id;

    // Bob cannot see Aria's quests
    const bobQuests = await clientBob.request<any[]>('/api/quests');
    assert(bobQuests.data.length === 0, 'Bob must not see Aria quests');

    // Bob cannot complete or delete Aria's quest
    const bobHackComplete = await clientBob.request<{ message: string }>(
      `/api/quests/${questId}/complete`,
      'POST'
    );
    assert(bobHackComplete.status === 404, 'Bob must not be able to complete Aria quest');

    const bobHackDelete = await clientBob.request<{ message: string }>(
      `/api/quests/${questId}`,
      'DELETE'
    );
    assert(bobHackDelete.status === 404, 'Bob must not be able to delete Aria quest');

    // Bob character is fresh
    const bobChar = await clientBob.request<any>('/api/character');
    assert(bobChar.data.stats.level === 1, 'Bob level must be 1');
    assert(bobChar.data.stats.gold === 25, 'Bob gold must be 25');
    console.log('✔ Cross-user isolation verified: Bob cannot read, modify, or steal Aria progress.');

    // 13. Logout and Re-login Persistence Check
    console.log('13. Testing Logout, Unauthenticated Guard, and Re-login persistence...');
    await clientAria.request('/api/auth/logout', 'POST');

    // Unauthenticated now
    const unauthMe = await clientAria.request<any>('/api/auth/me');
    assert(unauthMe.data === null, 'Aria must be unauthenticated after logout');

    const unauthChar = await clientAria.request<any>('/api/character');
    assert(unauthChar.status === 401, 'Character must be blocked when unauthenticated');

    // Re-login
    const loginAria = await clientAria.request<any>('/api/auth/login', 'POST', {
      email: ariaEmail,
      password: 'Password123!',
    });
    assert(loginAria.status === 200, 'Re-login failed');

    // Verify all progress is retained from PostgreSQL
    const reloadedAria = await clientAria.request<any>('/api/character');
    assert(reloadedAria.data.stats.level === 2, `Expected Level 2 after re-login, got ${reloadedAria.data.stats.level}`);
    assert(reloadedAria.data.stats.gold === 11, `Expected 11 Gold (1 + 10), got ${reloadedAria.data.stats.gold}`);
    assert(reloadedAria.data.stats.attributes.intellect === 3, 'Intellect must be 3 (1 base + 1 quest + 1 focus)');
    assert(reloadedAria.data.inventory.length === 1, 'Inventory must be persisted');
    assert(reloadedAria.data.unlockedAchievements.length === 1, 'Achievement must be persisted');
    console.log('✔ Re-login verified: Level 2, 11 Gold, Intellect 3, Inventory & Achievements 100% persisted in PostgreSQL!');

    // Cleanup test accounts
    await prisma.user.deleteMany({
      where: { id: { in: [ariaId, bobId] } },
    });
    console.log('✔ Test users cleaned up cleanly.');

    console.log('\n--- ALL FRONTEND/BACKEND INTEGRATION TESTS PASSED (100% SUCCESS) ---');
  } finally {
    server.close();
  }
}

runE2EIntegration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Integration test failed:', err);
    process.exit(1);
  });
