import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, count, asc } from "drizzle-orm";
import { db } from "@/db";
import { habitCompletions, habits } from "@/db/schema";
import { auth } from "@/lib/auth";

async function getCurrentUser(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.substring(7);
    const session = await auth.api.getSession({
      headers: { authorization: `Bearer ${token}` },
    });

    return session?.user ?? null;
  } catch {
    return null;
  }
}

function utcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6);

    const startDate = utcDate(start);
    const endDate = utcDate(today);

    const rows = await db
      .select({
        date: habitCompletions.completedDate,
        total: count(),
      })
      .from(habitCompletions)
      .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
      .where(
        and(
          eq(habits.userId, user.id),
          gte(habitCompletions.completedDate, startDate),
          lte(habitCompletions.completedDate, endDate),
        ),
      )
      .groupBy(habitCompletions.completedDate)
      .orderBy(asc(habitCompletions.completedDate));

    const totals = new Map(rows.map((row) => [row.date, Number(row.total)]));

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      const key = utcDate(date);

      return {
        date: key,
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        completions: totals.get(key) ?? 0,
      };
    });

    return NextResponse.json({ success: true, data: days });
  } catch (error) {
    console.error("Habit completion analytics error:", error);
    return NextResponse.json(
      { error: "Unable to load habit analytics" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "A valid request body is required" },
        { status: 400 },
      );
    }

    const { habitId, completed } = body as {
      habitId?: unknown;
      completed?: unknown;
    };

    if (
      typeof habitId !== "number" ||
      !Number.isSafeInteger(habitId) ||
      habitId <= 0 ||
      typeof completed !== "boolean"
    ) {
      return NextResponse.json(
        { error: "A valid habitId and boolean completed value are required" },
        { status: 400 },
      );
    }

    const ownedHabit = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
      .limit(1);

    if (ownedHabit.length === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = utcDate(new Date());
    const existing = await db
      .select({ id: habitCompletions.id })
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.completedDate, today),
        ),
      )
      .limit(1);

    if (completed && existing.length === 0) {
      await db.insert(habitCompletions).values({
        habitId,
        completedDate: today,
        createdAt: new Date(),
      });
    } else if (!completed && existing.length > 0) {
      await db
        .delete(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habitId),
            eq(habitCompletions.completedDate, today),
          ),
        );
    }

    return NextResponse.json({
      success: true,
      date: today,
      completed,
    });
  } catch (error) {
    console.error("Habit completion update error:", error);
    return NextResponse.json(
      { error: "Unable to update habit completion" },
      { status: 500 },
    );
  }
}
