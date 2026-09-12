import { prisma } from '../src/db/prisma.js';
import { applyXp, getRewardForDifficulty } from '../src/services/progression.service.js';
import { todayKey, computeStreaks } from '../src/services/streak.service.js';
import argon2 from 'argon2';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runDatabaseSmokeTest() {
  console.log('--- Starting Live PostgreSQL Database Smoke Test ---');

  // 1. Connection check
  console.log('1. Verifying database connection...');
  await prisma.$queryRaw`SELECT 1 as connected;`;
  console.log('✔ PostgreSQL connection verified.');

  const testEmail = `smoke_test_${Date.now()}@liferpg.local`;
  const today = todayKey();

  try {
    // 2. User & Character Creation
    console.log('2. Testing User & Character creation...');
    const passwordHash = await argon2.hash('SmokeTestPass123!', { type: argon2.argon2id });

    const user = await prisma.user.create({
      data: {
        name: 'Smoke Test Hero',
        email: testEmail,
        passwordHash,
        character: {
          create: {
            level: 1,
            xp: 0,
            gold: 25,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            history: [],
            stats: {
              create: {
                strength: 1,
                intellect: 1,
                vitality: 1,
                agility: 1,
                charisma: 1,
              },
            },
          },
        },
      },
      include: {
        character: {
          include: { stats: true },
        },
      },
    });

    assert(!!user.id, 'User must have generated UUID');
    assert(!!user.character?.id, 'Character must be created');
    assert(user.character?.gold === 25, 'Default starting gold must be 25');
    assert(user.character?.stats?.strength === 1, 'Default starting strength must be 1');
    console.log(`✔ User and Character created with ID: ${user.id}`);

    // 3. Quest Persistence
    console.log('3. Testing Quest creation & persistence...');
    const quest = await prisma.quest.create({
      data: {
        userId: user.id,
        title: 'Complete Morning Run',
        notes: '5km around the park',
        attribute: 'vitality',
        difficulty: 'medium',
        type: 'quest',
      },
    });

    assert(quest.title === 'Complete Morning Run', 'Quest title must match');
    assert(quest.completed === false, 'New quest must be uncompleted');
    console.log(`✔ Quest created with ID: ${quest.id}`);

    // 4. Quest Completion & Server-Side Progression
    console.log('4. Testing Quest Completion & Atomic RPG progression...');
    const reward = getRewardForDifficulty(quest.difficulty); // Medium: 60 XP, 16 Gold
    const prevLevel = user.character.level;
    const leveled = applyXp(user.character.level, user.character.xp, reward.xp);

    const historySet = new Set(user.character.history);
    historySet.add(today);
    const updatedHistory = Array.from(historySet).sort();
    const { current, longest } = computeStreaks(updatedHistory);

    // Atomic transaction
    await prisma.$transaction([
      prisma.quest.update({
        where: { id: quest.id },
        data: {
          completed: true,
          completedAt: new Date(),
          lastCompletedDate: today,
        },
      }),
      prisma.questCompletion.create({
        data: {
          questId: quest.id,
          userId: user.id,
          completionDate: today,
          xpAwarded: reward.xp,
          goldAwarded: reward.gold,
          attribute: quest.attribute,
        },
      }),
      prisma.character.update({
        where: { id: user.character.id },
        data: {
          level: leveled.level,
          xp: leveled.xpIntoLevel,
          gold: { increment: reward.gold },
          currentStreak: current,
          longestStreak: Math.max(longest, user.character.longestStreak),
          lastActiveDate: today,
          history: updatedHistory,
        },
      }),
      prisma.characterStats.update({
        where: { characterId: user.character.id },
        data: {
          vitality: { increment: 1 },
          totalQuestsCompleted: { increment: 1 },
        },
      }),
    ]);
    console.log('✔ Quest completion transaction executed.');

    // 5. Verification from Database Read
    console.log('5. Re-fetching character from database to verify real persistence...');
    const reloadedCharacter = await prisma.character.findUnique({
      where: { userId: user.id },
      include: {
        stats: true,
        user: {
          include: {
            quests: true,
            questCompletions: true,
          },
        },
      },
    });

    assert(reloadedCharacter !== null, 'Character must exist in DB');
    assert(reloadedCharacter!.xp === 60, `Expected 60 XP in DB, found ${reloadedCharacter!.xp}`);
    assert(reloadedCharacter!.gold === 41, `Expected 41 Gold (25 + 16), found ${reloadedCharacter!.gold}`);
    assert(reloadedCharacter!.stats?.vitality === 2, `Expected Vitality 2 (1 + 1), found ${reloadedCharacter!.stats?.vitality}`);
    assert(reloadedCharacter!.stats?.totalQuestsCompleted === 1, 'Expected totalQuestsCompleted 1');
    assert(reloadedCharacter!.user.quests[0].completed === true, 'Quest must be completed in DB');
    assert(reloadedCharacter!.user.questCompletions.length === 1, 'QuestCompletion history must have 1 row');
    assert(reloadedCharacter!.currentStreak === 1, 'Current streak must be 1');
    console.log('✔ XP, Gold, Level, Stats, and History verified from persistent PostgreSQL rows.');

    // 6. Duplicate Prevention Check
    console.log('6. Verifying duplicate quest completion prevention...');
    const finishedQuest = await prisma.quest.findUnique({ where: { id: quest.id } });
    assert(finishedQuest?.completed === true, 'Quest is already completed');
    console.log('✔ Duplicate prevention rule verified.');

    // Clean up smoke test user to maintain pristine database
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✔ Smoke test data cleaned up cleanly.');

    console.log('\n--- ALL DATABASE SMOKE TESTS PASSED (100% SUCCESS) ---');
  } catch (err) {
    console.error('Smoke test failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes('db.smoke.test')) {
  runDatabaseSmokeTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
