import { xpForLevel, applyXp, calculateFocusRewards } from '../src/services/progression.service.js';
import { computeStreaks, daysBetween, todayKey } from '../src/services/streak.service.js';
import { evaluateAchievements } from '../src/services/achievement.service.js';
import { SHOP_ITEMS, ACHIEVEMENTS } from '../src/data/catalog.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- Starting Life RPG Backend Verification Suite ---');

  // 1. Progression Math Tests
  console.log('Testing Progression Formula...');
  assert(xpForLevel(1) === 100, `Level 1->2 should cost 100 XP, got ${xpForLevel(1)}`);
  assert(xpForLevel(2) === 282, `Level 2->3 should cost 282 XP, got ${xpForLevel(2)}`);
  assert(xpForLevel(10) === 3162, `Level 10->11 should cost 3162 XP, got ${xpForLevel(10)}`);

  // Rollover test: Level 1 with 0 XP gets 120 XP -> Level 2 with 20 XP
  const levelUp = applyXp(1, 0, 120);
  assert(levelUp.level === 2, `Expected level 2, got ${levelUp.level}`);
  assert(levelUp.xpIntoLevel === 20, `Expected 20 xp into level, got ${levelUp.xpIntoLevel}`);
  assert(levelUp.xpForNextLevel === 282, `Expected 282 for next level, got ${levelUp.xpForNextLevel}`);
  console.log('✔ Progression Formula & Level Rollover verified.');

  // 2. Focus Dungeon Rewards
  console.log('Testing Focus Dungeon Calculations...');
  const focus25 = calculateFocusRewards(25);
  assert(focus25.xp === 40, `25 min focus should give 40 XP, got ${focus25.xp}`);
  assert(focus25.gold === 10, `25 min focus should give 10 Gold, got ${focus25.gold}`);

  const focus60 = calculateFocusRewards(60);
  assert(focus60.xp === 96, `60 min focus should give 96 XP, got ${focus60.xp}`);
  assert(focus60.gold === 24, `60 min focus should give 24 Gold, got ${focus60.gold}`);
  console.log('✔ Focus Dungeon Rewards verified.');

  // 3. Streak Calculation Tests
  console.log('Testing Streak Engine...');
  const today = todayKey();
  const d = new Date();
  
  const yesterdayDate = new Date(d);
  yesterdayDate.setDate(d.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const twoDaysAgoDate = new Date(d);
  twoDaysAgoDate.setDate(d.getDate() - 2);
  const twoDaysAgo = twoDaysAgoDate.toISOString().slice(0, 10);

  assert(daysBetween(yesterday, today) === 1, 'Days between yesterday and today should be 1');

  // Active today + yesterday = 2 day streak
  const streak2 = computeStreaks([yesterday, today]);
  assert(streak2.current === 2, `Current streak should be 2, got ${streak2.current}`);
  assert(streak2.longest === 2, `Longest streak should be 2, got ${streak2.longest}`);

  // 3 day streak
  const streak3 = computeStreaks([twoDaysAgo, yesterday, today]);
  assert(streak3.current === 3, `Current streak should be 3, got ${streak3.current}`);
  assert(streak3.longest === 3, `Longest streak should be 3, got ${streak3.longest}`);

  // Broken streak (only active 2 days ago)
  const brokenStreak = computeStreaks([twoDaysAgo]);
  assert(brokenStreak.current === 0, `Current streak should be 0 when inactive today and yesterday, got ${brokenStreak.current}`);
  assert(brokenStreak.longest === 1, `Longest streak should be preserved as 1, got ${brokenStreak.longest}`);
  console.log('✔ Streak Calculation Engine verified.');

  // 4. Achievement Rules
  console.log('Testing Achievement Rules...');
  const unlockedEmpty = evaluateAchievements(
    { level: 1, attributes: { intellect: 1 }, currentStreak: 0, longestStreak: 0 },
    false,
    new Set()
  );
  assert(unlockedEmpty.length === 0, 'No achievements should be unlocked initially');

  // First quest completed
  const unlockedFirst = evaluateAchievements(
    { level: 1, attributes: { intellect: 1 }, currentStreak: 1, longestStreak: 1 },
    true,
    new Set()
  );
  assert(unlockedFirst.some(a => a.id === 'first_quest'), 'First Quest achievement should unlock');

  // 3-day streak
  const unlockedConsistent = evaluateAchievements(
    { level: 1, attributes: { intellect: 1 }, currentStreak: 3, longestStreak: 3 },
    true,
    new Set(['first_quest'])
  );
  assert(unlockedConsistent.some(a => a.id === 'consistent'), 'Consistent achievement should unlock on 3 day streak');
  assert(!unlockedConsistent.some(a => a.id === 'first_quest'), 'Already unlocked achievement should not duplicate');
  console.log('✔ Achievement Rules verified.');

  // 5. Catalog Integrity
  console.log('Testing Catalog Integrity...');
  assert(SHOP_ITEMS.length === 8, `Expected 8 shop items, got ${SHOP_ITEMS.length}`);
  assert(ACHIEVEMENTS.length === 6, `Expected 6 achievements, got ${ACHIEVEMENTS.length}`);
  for (const item of SHOP_ITEMS) {
    assert(item.cost > 0, `Item ${item.id} must have positive cost`);
    assert(item.name.length > 0, `Item ${item.id} must have name`);
  }
  console.log('✔ Catalog Integrity verified.');

  console.log('\n--- ALL VERIFICATION CHECKS PASSED (100% SUCCESS) ---');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
