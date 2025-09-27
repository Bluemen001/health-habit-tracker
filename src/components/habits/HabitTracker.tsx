"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Plus, Flame } from "lucide-react";

export type Habit = {
  id: number;
  name: string;
  targetPerWeek: number;
  progress: number; // 0-100
  streak: number;
};

export default function HabitTracker() {
  const initial = useMemo<Habit[]>(
    () => [
      { id: 1, name: "Morning Walk", targetPerWeek: 5, progress: 60, streak: 7 },
      { id: 2, name: "Meditation", targetPerWeek: 7, progress: 80, streak: 12 },
      { id: 3, name: "Hydration (2L)", targetPerWeek: 7, progress: 45, streak: 3 },
    ],
    []
  );

  const [habits, setHabits] = useState<Habit[]>(initial);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", targetPerWeek: 5 });

  // Load habits from API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
        const res = await fetch("/api/habits-v2", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load habits");
        const data = await res.json();
        if (Array.isArray(data.data)) setHabits(data.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load habits");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addHabit = async () => {
    if (!form.name.trim()) return;
    try {
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      const res = await fetch("/api/habits-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ name: form.name.trim(), targetPerWeek: Number(form.targetPerWeek) || 1 }),
      });
      if (!res.ok) throw new Error("Failed to add habit");
      const data = await res.json();
      if (data?.data) {
        setHabits((h) => [data.data, ...h]);
      }
      setForm({ name: "", targetPerWeek: 5 });
    } catch (e: any) {
      setError(e?.message || "Failed to add habit");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      const res = await fetch("/api/habits-v2", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
        body: JSON.stringify({
          id: editing.id,
          name: editing.name,
          targetPerWeek: editing.targetPerWeek,
          progress: editing.progress,
          streak: editing.streak,
        }),
      });
      if (!res.ok) throw new Error("Failed to update habit");
      const data = await res.json();
      if (data?.data) setHabits((h) => h.map((x) => (x.id === editing.id ? data.data : x)));
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || "Failed to update habit");
    }
  };

  const toggleToday = async (h: Habit, checked: boolean) => {
    const progressDelta = checked ? 10 : -10;
    const streakDelta = checked ? 1 : -1;
    // optimistic update
    setHabits((list) =>
      list.map((x) =>
        x.id === h.id
          ? {
              ...x,
              progress: Math.max(0, Math.min(100, x.progress + progressDelta)),
              streak: Math.max(0, x.streak + streakDelta),
            }
          : x
      )
    );
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      const res = await fetch("/api/habits-v2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
        body: JSON.stringify({ id: h.id, progressDelta, streakDelta }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      const data = await res.json();
      if (data?.data) setHabits((list) => list.map((x) => (x.id === h.id ? data.data : x)));
    } catch (e) {
      // on failure, refetch to sync
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      fetch("/api/habits-v2", {
        headers: { Authorization: `Bearer ${token || ""}` },
      })
        .then((r) => r.json())
        .then((d) => Array.isArray(d.data) && setHabits(d.data))
        .catch(() => {});
    }
  };

  return (
    <section className="w-full space-y-4">
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-teal-600" /> Habit Tracking
          </CardTitle>
          <CardDescription>Add, edit, and track your healthy habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="habit-name">Habit name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Evening Stretching"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="habit-target">Target / week</Label>
              <Input
                id="habit-target"
                type="number"
                min={1}
                max={7}
                value={form.targetPerWeek}
                onChange={(e) => setForm((f) => ({ ...f, targetPerWeek: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={addHabit} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> Add Habit
              </Button>
            </div>
          </div>

          <Separator />

          {error && <div className="text-sm text-red-600">{error}</div>}
          {loading && <div className="text-sm text-muted-foreground">Loading habits...</div>}

          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {habits.map((h) => (
              <li key={h.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg">{h.name}</div>
                    <div className="text-sm text-muted-foreground">Target: {h.targetPerWeek}/week</div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" /> {h.streak} day streak
                  </Badge>
                </div>

                <div className="mt-3 h-2 w-full rounded bg-muted">
                  <div className="h-2 rounded bg-teal-600" style={{ width: `${h.progress}%` }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Progress: {h.progress}%</div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Checkbox id={`complete-${h.id}`} onCheckedChange={(v) => {
                      const checked = !!v;
                      toggleToday(h, checked);
                    }} />
                    <Label htmlFor={`complete-${h.id}`}>Mark today complete</Label>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => setEditing(h)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {editing && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="text-sm text-muted-foreground">Editing</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-target">Target / week</Label>
                  <Input id="edit-target" type="number" min={1} max={7} value={editing.targetPerWeek} onChange={(e) => setEditing({ ...editing, targetPerWeek: Number(e.target.value) })} />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={saveEdit}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}