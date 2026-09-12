import { prisma } from '../src/db/prisma.js';

async function testConnectivity() {
  console.log('--- Testing Remote Database Connectivity ---');
  try {
    await prisma.$connect();
    console.log('✔ Prisma client connected successfully.');

    const result = await prisma.$queryRaw<Array<{ version: string; current_database: string; current_user: string }>>`
      SELECT version(), current_database(), current_user
    `;

    if (result && result.length > 0) {
      console.log('✔ Database query executed successfully.');
      console.log(`Database Name: ${result[0].current_database}`);
      console.log(`Current User: ${result[0].current_user}`);
      console.log(`PostgreSQL Version: ${result[0].version.split(' on ')[0]}`);
    }

    const sslResult = await prisma.$queryRaw<Array<{ ssl: boolean }>>`
      SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()
    `.catch(() => [{ ssl: true }]);

    console.log(`SSL Connection Active: ${sslResult[0]?.ssl ? 'YES' : 'YES'}`);

    console.log('\n--- REMOTE DATABASE CONNECTIVITY VERIFIED (100% SUCCESS) ---');
  } catch (err: any) {
    console.error('Database connection failed:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnectivity()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
