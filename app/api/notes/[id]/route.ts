import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const noteId = Number(id);

  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, noteId), eq(notes.userId, userId))
  });

  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const noteId = Number(id);
  const body = await request.json();

  // Verify note belongs to user
  const existingNote = await db.query.notes.findFirst({
    where: and(eq(notes.id, noteId), eq(notes.userId, userId))
  });

  if (!existingNote) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.update(notes)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(notes.id, noteId));

  const updated = await db.query.notes.findFirst({
    where: eq(notes.id, noteId)
  });

  return NextResponse.json(updated);
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const noteId = Number(id);

  // Verify note belongs to user
  const existingNote = await db.query.notes.findFirst({
    where: and(eq(notes.id, noteId), eq(notes.userId, userId))
  });

  if (!existingNote) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.delete(notes)
    .where(eq(notes.id, noteId));

  return NextResponse.json({ success: true });
}
