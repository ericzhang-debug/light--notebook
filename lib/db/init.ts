import { db } from './index';
import { notes } from './schema';
import { sql } from 'drizzle-orm';

async function init() {
  // Create notes table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'New Note',
      content TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    )
  `);

  console.log('Database initialized successfully!');
  process.exit(0);
}

init().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
