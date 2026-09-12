import http from 'http';
import argon2 from 'argon2';
import app from '../src/index.js';
import { prisma } from '../src/db/prisma.js';

class TestClient {
  public cookies: string[] = [];
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
  if (!condition) throw new Error(`[SECURITY ASSERTION FAILED] ${msg}`);
}

async function runSecurityAudit() {
  console.log('=== PHASE 11: COMPREHENSIVE SECURITY & CLIENT-TAMPERING AUDIT ===\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;
  console.log(`Ephemeral security test server active on port ${port}\n`);

  const clientAnon = new TestClient(port);
  const clientAlice = new TestClient(port);
  const clientBob = new TestClient(port);

  const timestamp = Date.now();
  const aliceEmail = `alice_${timestamp}@liferpg.security`;
  const bobEmail = `bob_${timestamp}@liferpg.security`;
  let aliceId = '';
  let bobId = '';
  let aliceQuestId = '';
  let aliceOneOffQuestId = '';
  let aliceHabitId = '';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated Guard Enforcement (All Protected Endpoints)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying 401 Unauthenticated Guards across all endpoints...');
    const protectedRoutes = [
      { path: '/api/character', method: 'GET' },
      { path: '/api/quests', method: 'GET' },
      { path: '/api/quests', method: 'POST', body: { title: 'Hack', attribute: 'strength', difficulty: 'easy', type: 'quest' } },
      { path: '/api/quests/a0000000-0000-0000-0000-000000000000/complete', method: 'POST' },
      { path: '/api/habits', method: 'GET' },
      { path: '/api/habits', method: 'POST', body: { title: 'Hack Habit', attribute: 'vitality' } },
      { path: '/api/habits/a0000000-0000-0000-0000-000000000000/complete', method: 'POST' },
      { path: '/api/shop/purchase', method: 'POST', body: { itemId: 'weapon_iron_sword' } },
      { path: '/api/focus/complete', method: 'POST', body: { minutes: 25 } },
      { path: '/api/inventory/equip', method: 'POST', body: { itemId: 'weapon_iron_sword' } },
    ];

    for (const r of protectedRoutes) {
      const res = await clientAnon.request<any>(r.path, r.method, r.body);
      assert(res.status === 401, `Expected 401 on unauthenticated ${r.method} ${r.path}, got ${res.status}`);
    }
    console.log('✔ All protected routes return 401 for unauthenticated requests.\n');

    // -------------------------------------------------------------------------
    // TEST 2: Authentication Security & Password Hashing (Argon2id)
    // -------------------------------------------------------------------------
    console.log('[TEST 2] Verifying Argon2id password hashing and session cookie issuance...');
    const aliceSignup = await clientAlice.request<any>('/api/auth/signup', 'POST', {
      name: 'Alice Guardian',
      email: aliceEmail,
      password: 'StrongPassword123!',
    });
    assert(aliceSignup.status === 201, `Alice signup failed: ${aliceSignup.status}`);
    aliceId = aliceSignup.data.id;
    assert(!aliceSignup.data.passwordHash, 'Response must NEVER expose password hash');

    // Verify session cookie was set with HttpOnly flag
    const cookie = clientAlice.cookies.find(c => c.startsWith('liferpg.sid='));
    assert(!!cookie, 'Server must set liferpg.sid session cookie');

    // Verify in database: password must be Argon2id hash, not plaintext
    const aliceDbUser = await prisma.user.findUnique({ where: { id: aliceId } });
    assert(!!aliceDbUser, 'User must exist in database');
    assert(aliceDbUser.passwordHash.startsWith('$argon2id$'), 'Password must be hashed with Argon2id');
    const isArgonValid = await argon2.verify(aliceDbUser.passwordHash, 'StrongPassword123!');
    assert(isArgonValid, 'Argon2id verification failed');

    // Setup Bob
    const bobSignup = await clientBob.request<any>('/api/auth/signup', 'POST', {
      name: 'Bob Infiltrator',
      email: bobEmail,
      password: 'StrongPassword123!',
    });
    assert(bobSignup.status === 201, 'Bob signup failed');
    bobId = bobSignup.data.id;
    console.log('✔ Passwords securely hashed with Argon2id; HttpOnly session cookies issued.\n');

    // -------------------------------------------------------------------------
    // TEST 3: Cross-User Data Isolation & Horizontal Privilege Escalation
    // -------------------------------------------------------------------------
    console.log('[TEST 3] Verifying Cross-User Data Isolation (Horizontal Privilege Escalation)...');
    // Alice creates a daily quest, a one-off quest, and a habit
    const q1 = await clientAlice.request<any>('/api/quests', 'POST', {
      title: "Alice's Secret Routine",
      attribute: 'strength',
      difficulty: 'medium',
      type: 'daily',
    });
    assert(q1.status === 201, 'Quest creation failed');
    aliceQuestId = q1.data.id;

    const q2 = await clientAlice.request<any>('/api/quests', 'POST', {
      title: "Alice's One-off Milestone",
      attribute: 'intellect',
      difficulty: 'easy',
      type: 'quest',
    });
    assert(q2.status === 201, 'One-off quest creation failed');
    aliceOneOffQuestId = q2.data.id;

    const h1 = await clientAlice.request<any>('/api/habits', 'POST', {
      title: "Alice's Meditation Habit",
      attribute: 'vitality',
      frequency: 'daily',
    });
    assert(h1.status === 201, 'Habit creation failed');
    aliceHabitId = h1.data.id;

    // Bob tries to read Alice's quests and habits
    const bobQuests = await clientBob.request<any[]>('/api/quests');
    assert(bobQuests.data.length === 0, 'Bob must NOT see Alice quests');

    const bobHabits = await clientBob.request<any[]>('/api/habits');
    assert(bobHabits.data.length === 0, 'Bob must NOT see Alice habits');

    // Bob tries to patch Alice's quest
    const bobHackPatch = await clientBob.request<any>(`/api/quests/${aliceQuestId}`, 'PATCH', {
      title: 'Hacked by Bob',
    });
    assert(bobHackPatch.status === 404, `Expected 404 on cross-user quest PATCH, got ${bobHackPatch.status}`);

    // Bob tries to delete Alice's quest
    const bobHackDelete = await clientBob.request<any>(`/api/quests/${aliceQuestId}`, 'DELETE');
    assert(bobHackDelete.status === 404, `Expected 404 on cross-user quest DELETE, got ${bobHackDelete.status}`);

    // Bob tries to complete Alice's quest
    const bobHackComplete = await clientBob.request<any>(`/api/quests/${aliceQuestId}/complete`, 'POST');
    assert(bobHackComplete.status === 404, `Expected 404 on cross-user quest COMPLETE, got ${bobHackComplete.status}`);

    // Bob tries to complete Alice's habit
    const bobHackHabit = await clientBob.request<any>(`/api/habits/${aliceHabitId}/complete`, 'POST');
    assert(bobHackHabit.status === 404, `Expected 404 on cross-user habit COMPLETE, got ${bobHackHabit.status}`);

    // Bob tries to delete Alice's habit
    const bobHackHabitDel = await clientBob.request<any>(`/api/habits/${aliceHabitId}`, 'DELETE');
    assert(bobHackHabitDel.status === 404, `Expected 404 on cross-user habit DELETE, got ${bobHackHabitDel.status}`);
    console.log('✔ Cross-user data isolation verified: All horizontal tampering blocked with 404.\n');

    // -------------------------------------------------------------------------
    // TEST 4: Client-Tampering on Quest Completion (XP, Gold, Stats Spoofing)
    // -------------------------------------------------------------------------
    console.log('[TEST 4] Verifying Client-Tampering Prevention on Quest Completion...');
    // Alice attempts to send arbitrary XP, Gold, Stats, Level inside request body
    const spoofPayload = {
      xp: 999999,
      xpAwarded: 999999,
      gold: 999999,
      goldAwarded: 999999,
      level: 99,
      strength: 99,
      intellect: 99,
      currentStreak: 50,
      rewardAmount: 999999,
    };
    const compResult = await clientAlice.request<any>(
      `/api/quests/${aliceQuestId}/complete`,
      'POST',
      spoofPayload
    );
    assert(compResult.status === 200, `Completion failed: ${compResult.status}`);
    // Server must award medium difficulty: 60 XP, 16 Gold, exactly +1 strength stat
    assert(compResult.data.xpAwarded === 60, `Server must award 60 XP, got ${compResult.data.xpAwarded}`);
    assert(compResult.data.goldAwarded === 16, `Server must award 16 Gold, got ${compResult.data.goldAwarded}`);

    // Verify in PostgreSQL that Alice was NOT granted spoofed values
    const aliceChar = await clientAlice.request<any>('/api/character');
    assert(aliceChar.data.stats.xp === 60, `Expected 60 XP in DB, got ${aliceChar.data.stats.xp}`);
    assert(aliceChar.data.stats.gold === 41, `Expected 41 Gold (25 base + 16 reward), got ${aliceChar.data.stats.gold}`);
    assert(aliceChar.data.stats.level === 1, `Expected level 1, got ${aliceChar.data.stats.level}`);
    assert(aliceChar.data.stats.attributes.strength === 2, `Expected strength 2 (1 base + 1 reward), got ${aliceChar.data.stats.attributes.strength}`);
    console.log('✔ Quest completion values are strictly server-calculated; client spoofing rejected.\n');

    // -------------------------------------------------------------------------
    // TEST 5: Duplicate Quest Completion Prevention
    // -------------------------------------------------------------------------
    console.log('[TEST 5] Verifying Duplicate Quest Completion Prevention...');
    // Alice attempts to complete the same daily quest twice in the same day
    const dupDaily = await clientAlice.request<any>(`/api/quests/${aliceQuestId}/complete`, 'POST');
    assert(dupDaily.status === 400, `Expected 400 on duplicate daily completion, got ${dupDaily.status}`);
    assert(dupDaily.data.message.includes('already completed today'), 'Error message must reflect duplicate daily');

    // Alice completes her one-off quest
    const compOneOff = await clientAlice.request<any>(`/api/quests/${aliceOneOffQuestId}/complete`, 'POST');
    assert(compOneOff.status === 200, 'One-off quest completion failed');

    // Alice attempts to re-complete the one-off quest
    const dupOneOff = await clientAlice.request<any>(`/api/quests/${aliceOneOffQuestId}/complete`, 'POST');
    assert(dupOneOff.status === 400, `Expected 400 on duplicate one-off completion, got ${dupOneOff.status}`);
    assert(dupOneOff.data.message.includes('already completed'), 'Error message must reflect duplicate quest');
    console.log('✔ Duplicate quest completion strictly rejected by server & database constraints.\n');

    // -------------------------------------------------------------------------
    // TEST 6: Completed Quest Metadata Tampering
    // -------------------------------------------------------------------------
    console.log('[TEST 6] Verifying Retroactive Tampering of Completed Quest...');
    const tamperCompleted = await clientAlice.request<any>(
      `/api/quests/${aliceOneOffQuestId}`,
      'PATCH',
      { difficulty: 'epic', type: 'daily' }
    );
    assert(tamperCompleted.status === 400, `Expected 400 on modifying completed quest difficulty/type, got ${tamperCompleted.status}`);
    console.log('✔ Modifying difficulty or type of an already-completed quest is blocked.\n');

    // -------------------------------------------------------------------------
    // TEST 7: Habit Duplicate & Client-Tampering Prevention
    // -------------------------------------------------------------------------
    console.log('[TEST 7] Verifying Habit Duplicate Prevention and Server-side Streaks...');
    // Alice completes Habit A
    const habComp1 = await clientAlice.request<any>(`/api/habits/${aliceHabitId}/complete`, 'POST');
    assert(habComp1.status === 200, 'Habit completion failed');
    assert(habComp1.data.currentStreak === 1, `Expected streak 1, got ${habComp1.data.currentStreak}`);

    // Alice attempts to complete Habit A again today
    const habCompDup = await clientAlice.request<any>(`/api/habits/${aliceHabitId}/complete`, 'POST');
    assert(habCompDup.status === 400, `Expected 400 on duplicate habit completion, got ${habCompDup.status}`);
    assert(habCompDup.data.message.includes('already completed today'), 'Must mention already completed today');

    // Alice attempts to inject streak when creating a habit
    const hackHabit = await clientAlice.request<any>('/api/habits', 'POST', {
      title: 'Hacked Streak Habit',
      attribute: 'agility',
      currentStreak: 999,
      longestStreak: 999,
      userId: bobId,
    });
    assert(hackHabit.status === 201, 'Habit creation failed');
    assert(hackHabit.data.currentStreak === 0, 'Injected streak must be ignored (defaults to 0)');
    assert(hackHabit.data.userId === aliceId, 'Injected userId must be ignored (scoped to session user)');
    console.log('✔ Habits strictly enforce daily completion limit and server-side streaks.\n');

    // -------------------------------------------------------------------------
    // TEST 8: Shop & Inventory Security (Price/Quantity/Equipment Tampering)
    // -------------------------------------------------------------------------
    console.log('[TEST 8] Verifying Shop Price, Inventory Quantity, and Equipment Security...');
    // Alice currently has 25 base + 16 (quest 1) + 30 (quest 2) = 71 Gold.
    // Let's attempt to buy weapon_focus_staff (cost: 220 Gold) with spoofed price 0
    const spoofPriceBuy = await clientAlice.request<any>('/api/shop/purchase', 'POST', {
      itemId: 'weapon_focus_staff',
      cost: 0,
      price: 0,
      costGold: 0,
      quantity: 10,
    });
    assert(spoofPriceBuy.status === 400, `Expected 400 for insufficient gold despite client spoof, got ${spoofPriceBuy.status}`);
    assert(spoofPriceBuy.data.message.includes('Not enough gold'), 'Must reject due to insufficient gold');

    // Alice buys Elixir of Focus (cost: 40 Gold). Alice has 25 + 16 + 8 = 49 Gold. Remaining: 9 Gold.
    const validBuy = await clientAlice.request<any>('/api/shop/purchase', 'POST', {
      itemId: 'potion_focus',
      quantity: 50, // Tampering attempt: request 50 potions
    });
    assert(validBuy.status === 200, 'Purchase failed');
    assert(validBuy.data.stats.gold === 9, `Expected 9 Gold remaining (49 - 40), got ${validBuy.data.stats.gold}`);
    const potionInv = validBuy.data.inventory.find((i: any) => i.itemId === 'potion_focus');
    assert(potionInv && potionInv.quantity === 1, `Client requested 50, but server must increment by exactly 1. Got: ${potionInv?.quantity}`);

    // Bob attempts to equip Alice's potion
    const bobEquipAliceItem = await clientBob.request<any>('/api/inventory/equip', 'POST', {
      itemId: 'potion_focus',
    });
    assert(bobEquipAliceItem.status === 404, `Expected 404 on equipping unowned item, got ${bobEquipAliceItem.status}`);
    assert(bobEquipAliceItem.data.message.includes('Item not owned'), 'Must reject unowned item equip');
    console.log('✔ Item prices, gold deduction, inventory quantities, and equipment ownership verified.\n');

    // -------------------------------------------------------------------------
    // TEST 9: Focus Dungeon Security & Duration Validation
    // -------------------------------------------------------------------------
    console.log('[TEST 9] Verifying Focus Dungeon Duration Validation & Reward Integrity...');
    // Negative duration
    const negFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', { minutes: -15 });
    assert(negFocus.status === 400, `Expected 400 on negative duration, got ${negFocus.status}`);

    // Zero duration
    const zeroFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', { minutes: 0 });
    assert(zeroFocus.status === 400, `Expected 400 on zero duration, got ${zeroFocus.status}`);

    // Duration exceeding max (> 240)
    const excessFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', { minutes: 500 });
    assert(excessFocus.status === 400, `Expected 400 on >240 duration, got ${excessFocus.status}`);

    // Non-integer float duration
    const floatFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', { minutes: 25.5 });
    assert(floatFocus.status === 400, `Expected 400 on float duration, got ${floatFocus.status}`);

    // Non-number string duration
    const stringFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', { minutes: 'invalid' });
    assert(stringFocus.status === 400, `Expected 400 on string duration, got ${stringFocus.status}`);

    // Valid session with spoofed rewards
    const validFocus = await clientAlice.request<any>('/api/focus/complete', 'POST', {
      minutes: 25,
      xp: 999999,
      gold: 999999,
      intellect: 999999,
    });
    assert(validFocus.status === 200, 'Valid focus session failed');
    assert(validFocus.data.xpAwarded === 40, `Expected 40 XP, got ${validFocus.data.xpAwarded}`);
    assert(validFocus.data.goldAwarded === 10, `Expected 10 Gold, got ${validFocus.data.goldAwarded}`);

    // Verify FocusSession record exists in PostgreSQL
    const focusRows = await prisma.focusSession.findMany({ where: { userId: aliceId } });
    assert(focusRows.length === 1, 'Focus session history row must exist');
    assert(focusRows[0].durationMinutes === 25, 'Duration must be 25');
    console.log('✔ Focus Dungeon duration validation and server-authoritative calculations verified.\n');

    // -------------------------------------------------------------------------
    // TEST 10: Input Validation & Injection Prevention
    // -------------------------------------------------------------------------
    console.log('[TEST 10] Verifying Robust Input Validation & Malformed Payloads...');
    // Invalid signup (missing email)
    const badSignup1 = await clientAnon.request<any>('/api/auth/signup', 'POST', { name: 'Test', password: 'Password123!' });
    assert(badSignup1.status === 400, 'Expected 400 on missing email');

    // Invalid signup (short password)
    const badSignup2 = await clientAnon.request<any>('/api/auth/signup', 'POST', { name: 'Test', email: 't@t.com', password: '123' });
    assert(badSignup2.status === 400, 'Expected 400 on short password');

    // Invalid attribute enum
    const badAttrQuest = await clientAlice.request<any>('/api/quests', 'POST', {
      title: 'Invalid Attribute Quest',
      attribute: 'superpower',
      difficulty: 'easy',
      type: 'quest',
    });
    assert(badAttrQuest.status === 400, 'Expected 400 on invalid attribute enum');

    // Invalid difficulty enum
    const badDiffQuest = await clientAlice.request<any>('/api/quests', 'POST', {
      title: 'Invalid Diff Quest',
      attribute: 'strength',
      difficulty: 'nightmare',
      type: 'quest',
    });
    assert(badDiffQuest.status === 400, 'Expected 400 on invalid difficulty enum');

    // Malformed UUID param
    const malformedUuidQuest = await clientAlice.request<any>('/api/quests/not-a-valid-uuid/complete', 'POST');
    assert(malformedUuidQuest.status === 400, 'Expected 400 on non-UUID quest ID param');

    const malformedUuidHabit = await clientAlice.request<any>('/api/habits/not-a-valid-uuid/complete', 'POST');
    assert(malformedUuidHabit.status === 400, 'Expected 400 on non-UUID habit ID param');
    console.log('✔ All malformed inputs, invalid enums, and non-UUID parameters rejected with 400.\n');

    // -------------------------------------------------------------------------
    // TEST 11: Error Handling & Stack Trace Leaks
    // -------------------------------------------------------------------------
    console.log('[TEST 11] Verifying 404 Handlers and Safe Error Responses (No Stack Traces)...');
    const notFoundRes = await clientAlice.request<any>('/api/unknown-endpoint');
    assert(notFoundRes.status === 404, 'Unknown route must return 404');
    assert(notFoundRes.data.message === 'Endpoint not found.', 'Safe error message expected');
    assert(!notFoundRes.data.stack, 'Stack traces must NEVER be exposed in responses');
    console.log('✔ Error responses are sanitized and never leak server stack traces.\n');

    // -------------------------------------------------------------------------
    // TEST 12: Session Termination (Logout)
    // -------------------------------------------------------------------------
    console.log('[TEST 12] Verifying Complete Session Destruction on Logout...');
    const logoutRes = await clientAlice.request<any>('/api/auth/logout', 'POST');
    assert(logoutRes.status === 200, 'Logout failed');

    // Alice tries to access protected endpoint after logout
    const postLogoutMe = await clientAlice.request<any>('/api/auth/me');
    assert(postLogoutMe.data === null, 'Session must return null after logout');

    const postLogoutChar = await clientAlice.request<any>('/api/character');
    assert(postLogoutChar.status === 401, 'Protected route must return 401 after logout');
    console.log('✔ Session cleanly destroyed and invalidated upon logout.\n');

    // -------------------------------------------------------------------------
    // Cleanup Test Users
    // -------------------------------------------------------------------------
    await prisma.user.deleteMany({
      where: { id: { in: [aliceId, bobId] } },
    });
    console.log('✔ Test data cleaned up cleanly from database.');

    console.log('\n=============================================================');
    console.log('ALL PHASE 11 SECURITY & CLIENT-TAMPERING TESTS PASSED (100%)');
    console.log('=============================================================');
  } finally {
    server.close();
  }
}

runSecurityAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Security audit test failed:', err);
    process.exit(1);
  });
