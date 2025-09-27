import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { therapySessions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function getCurrentUser(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    const token = authorization.substring(7);
    const session = await auth.api.getSession({
      headers: { authorization: `Bearer ${token}` }
    });
    return session?.user || null;
  } catch {
    return null;
  }
}

function validateDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
}

function validateTime(timeString: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const sessions = await db.select()
      .from(therapySessions)
      .where(eq(therapySessions.userId, user.id))
      .orderBy(desc(therapySessions.date), desc(therapySessions.time));

    const sessionsWithParsedExercises = sessions.map(session => ({
      ...session,
      exercises: JSON.parse(session.exercises)
    }));

    return NextResponse.json({ 
      success: true, 
      data: sessionsWithParsedExercises 
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { date, time, type, note, exercises } = requestBody;

    if (!date) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (!validateDate(date)) {
      return NextResponse.json({ 
        error: "Date must be in YYYY-MM-DD format",
        code: "INVALID_DATE" 
      }, { status: 400 });
    }

    if (!time) {
      return NextResponse.json({ 
        error: "Time is required",
        code: "MISSING_TIME" 
      }, { status: 400 });
    }

    if (!validateTime(time)) {
      return NextResponse.json({ 
        error: "Time must be in HH:mm format",
        code: "INVALID_TIME" 
      }, { status: 400 });
    }

    if (!type || typeof type !== 'string' || type.trim().length === 0) {
      return NextResponse.json({ 
        error: "Type is required and must be a non-empty string",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    if (!Array.isArray(exercises)) {
      return NextResponse.json({ 
        error: "Exercises must be an array of strings",
        code: "INVALID_EXERCISES" 
      }, { status: 400 });
    }

    for (const exercise of exercises) {
      if (typeof exercise !== 'string') {
        return NextResponse.json({ 
          error: "All exercises must be strings",
          code: "INVALID_EXERCISE_TYPE" 
        }, { status: 400 });
      }
    }

    const now = new Date();
    const newSession = await db.insert(therapySessions)
      .values({
        userId: user.id,
        date: date.trim(),
        time: time.trim(),
        type: type.trim(),
        note: note ? note.trim() : null,
        exercises: JSON.stringify(exercises),
        createdAt: now,
        updatedAt: now
      })
      .returning();

    const sessionWithParsedExercises = {
      ...newSession[0],
      exercises: JSON.parse(newSession[0].exercises)
    };

    return NextResponse.json({ 
      success: true, 
      data: sessionWithParsedExercises 
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingSession = await db.select()
      .from(therapySessions)
      .where(and(eq(therapySessions.id, parseInt(id)), eq(therapySessions.userId, user.id)))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { date, time, type, note, exercises } = requestBody;
    const updates: any = { updatedAt: new Date() };

    if (date !== undefined) {
      if (!validateDate(date)) {
        return NextResponse.json({ 
          error: "Date must be in YYYY-MM-DD format",
          code: "INVALID_DATE" 
        }, { status: 400 });
      }
      updates.date = date.trim();
    }

    if (time !== undefined) {
      if (!validateTime(time)) {
        return NextResponse.json({ 
          error: "Time must be in HH:mm format",
          code: "INVALID_TIME" 
        }, { status: 400 });
      }
      updates.time = time.trim();
    }

    if (type !== undefined) {
      if (!type || typeof type !== 'string' || type.trim().length === 0) {
        return NextResponse.json({ 
          error: "Type must be a non-empty string",
          code: "INVALID_TYPE" 
        }, { status: 400 });
      }
      updates.type = type.trim();
    }

    if (note !== undefined) {
      updates.note = note ? note.trim() : null;
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises)) {
        return NextResponse.json({ 
          error: "Exercises must be an array of strings",
          code: "INVALID_EXERCISES" 
        }, { status: 400 });
      }

      for (const exercise of exercises) {
        if (typeof exercise !== 'string') {
          return NextResponse.json({ 
            error: "All exercises must be strings",
            code: "INVALID_EXERCISE_TYPE" 
          }, { status: 400 });
        }
      }

      updates.exercises = JSON.stringify(exercises);
    }

    const updatedSession = await db.update(therapySessions)
      .set(updates)
      .where(and(eq(therapySessions.id, parseInt(id)), eq(therapySessions.userId, user.id)))
      .returning();

    if (updatedSession.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionWithParsedExercises = {
      ...updatedSession[0],
      exercises: JSON.parse(updatedSession[0].exercises)
    };

    return NextResponse.json({ 
      success: true, 
      data: sessionWithParsedExercises 
    }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const deleted = await db.delete(therapySessions)
      .where(and(eq(therapySessions.id, parseInt(id)), eq(therapySessions.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const deletedSessionWithParsedExercises = {
      ...deleted[0],
      exercises: JSON.parse(deleted[0].exercises)
    };

    return NextResponse.json({ 
      success: true, 
      data: deletedSessionWithParsedExercises,
      message: 'Session deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}