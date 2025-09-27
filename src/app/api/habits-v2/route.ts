import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { habits } from '@/db/schema';
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userHabits = await db.select()
      .from(habits)
      .where(eq(habits.userId, user.id))
      .orderBy(desc(habits.createdAt));

    return NextResponse.json({
      success: true,
      data: userHabits
    });
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

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, targetPerWeek } = requestBody;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Validate targetPerWeek
    if (targetPerWeek !== undefined) {
      if (!Number.isInteger(targetPerWeek) || targetPerWeek < 1 || targetPerWeek > 7) {
        return NextResponse.json({ 
          error: "Target per week must be an integer between 1 and 7",
          code: "INVALID_TARGET_PER_WEEK" 
        }, { status: 400 });
      }
    }

    const now = new Date();
    const newHabit = await db.insert(habits)
      .values({
        userId: user.id,
        name: name.trim(),
        targetPerWeek: targetPerWeek || 7,
        progress: 0,
        streak: 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newHabit[0]
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

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { id, name, targetPerWeek, progress, streak } = requestBody;

    // Validate ID
    if (!id || !Number.isInteger(id)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if habit exists and belongs to user
    const existingHabit = await db.select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .limit(1);

    if (existingHabit.length === 0) {
      return NextResponse.json({ 
        error: 'Habit not found' 
      }, { status: 404 });
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date()
    };

    // Validate and add fields to update
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (targetPerWeek !== undefined) {
      if (!Number.isInteger(targetPerWeek) || targetPerWeek < 1 || targetPerWeek > 7) {
        return NextResponse.json({ 
          error: "Target per week must be an integer between 1 and 7",
          code: "INVALID_TARGET_PER_WEEK" 
        }, { status: 400 });
      }
      updates.targetPerWeek = targetPerWeek;
    }

    if (progress !== undefined) {
      if (!Number.isInteger(progress)) {
        return NextResponse.json({ 
          error: "Progress must be an integer",
          code: "INVALID_PROGRESS" 
        }, { status: 400 });
      }
      updates.progress = Math.max(0, Math.min(100, progress));
    }

    if (streak !== undefined) {
      if (!Number.isInteger(streak)) {
        return NextResponse.json({ 
          error: "Streak must be an integer",
          code: "INVALID_STREAK" 
        }, { status: 400 });
      }
      updates.streak = Math.max(0, streak);
    }

    const updatedHabit = await db.update(habits)
      .set(updates)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedHabit[0]
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { id, progressDelta, streakDelta } = requestBody;

    // Validate ID
    if (!id || !Number.isInteger(id)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Validate deltas
    if (progressDelta !== undefined && !Number.isInteger(progressDelta)) {
      return NextResponse.json({ 
        error: "Progress delta must be an integer",
        code: "INVALID_PROGRESS_DELTA" 
      }, { status: 400 });
    }

    if (streakDelta !== undefined && !Number.isInteger(streakDelta)) {
      return NextResponse.json({ 
        error: "Streak delta must be an integer",
        code: "INVALID_STREAK_DELTA" 
      }, { status: 400 });
    }

    // Get current habit
    const existingHabit = await db.select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .limit(1);

    if (existingHabit.length === 0) {
      return NextResponse.json({ 
        error: 'Habit not found' 
      }, { status: 404 });
    }

    const current = existingHabit[0];

    // Calculate new values
    const updates: any = {
      updatedAt: new Date()
    };

    if (progressDelta !== undefined) {
      const newProgress = current.progress + progressDelta;
      updates.progress = Math.max(0, Math.min(100, newProgress));
    }

    if (streakDelta !== undefined) {
      const newStreak = current.streak + streakDelta;
      updates.streak = Math.max(0, newStreak);
    }

    const updatedHabit = await db.update(habits)
      .set(updates)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedHabit[0]
    });
  } catch (error) {
    console.error('PATCH error:', error);
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

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { id } = requestBody;

    // Validate ID
    if (!id || !Number.isInteger(id)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if habit exists and belongs to user
    const existingHabit = await db.select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .limit(1);

    if (existingHabit.length === 0) {
      return NextResponse.json({ 
        error: 'Habit not found' 
      }, { status: 404 });
    }

    const deletedHabit = await db.delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Habit deleted successfully',
      data: deletedHabit[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}