import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';

// GET /api/notes - List all notes for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userNotes = await db.query.notes.findMany({
    where: eq(notes.userId, userId),
    orderBy: [desc(notes.updatedAt)]
  });

  return NextResponse.json(userNotes);
}

// POST /api/notes - Create a new note
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [newNote] = await db.insert(notes)
    .values({ userId, title: 'New Note', content: '' })
    .returning();

  return NextResponse.json(newNote, { status: 201 });
}
