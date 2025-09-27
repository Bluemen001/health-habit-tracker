"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ClipboardList, Dumbbell } from "lucide-react";

export type Session = {
  id: number;
  date: string;
  time: string;
  type: string;
  note?: string | null;
  exercises: string[];
};

export default function TherapyManager() {
  const templates = useMemo(() => ["CBT", "Mindfulness", "Physiotherapy", "Group Therapy"], []);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Session>({ id: 0, date: "", time: "", type: "CBT", note: "", exercises: [] });

  // Load sessions from API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
        const res = await fetch("/api/therapy-sessions-v2", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load therapy sessions");
        const data = await res.json();
        if (Array.isArray(data.data)) setSessions(data.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load therapy sessions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addSession = async () => {
    if (!form.date || !form.time || !form.type) return;
    try {
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      const res = await fetch("/api/therapy-sessions-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          type: form.type,
          note: form.note || null,
          exercises: form.exercises,
        }),
      });
      if (!res.ok) throw new Error("Failed to add session");
      const data = await res.json();
      if (data?.data) setSessions((s) => [data.data, ...s]);
      setForm({ id: 0, date: "", time: "", type: "CBT", note: "", exercises: [] });
    } catch (e: any) {
      setError(e?.message || "Failed to add session");
    }
  };

  const removeSession = async (id: number) => {
    // optimistic
    const prev = sessions;
    setSessions((s) => s.filter((x) => x.id !== id));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
      const res = await fetch(`/api/therapy-sessions-v2?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (!res.ok) throw new Error("Failed to delete session");
    } catch {
      // rollback
      setSessions(prev);
    }
  };

  const toggleExercise = (name: string) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.includes(name)
        ? f.exercises.filter((e) => e !== name)
        : [...f.exercises, name],
    }));
  };

  return (
    <section className="w-full space-y-4">
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" /> Therapy Management
          </CardTitle>
          <CardDescription>Schedule sessions, take notes, and track exercises</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="sess-date">Date</Label>
              <Input id="sess-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sess-time">Time</Label>
              <Input id="sess-time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={addSession}>Add Session</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" /> Notes
              </div>
              <Textarea
                placeholder="Session notes..."
                value={form.note || ""}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Dumbbell className="h-4 w-4" /> Exercises
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Box Breathing",
                  "Body Scan",
                  "Gratitude Journal",
                  "Progressive Relaxation",
                ].map((ex) => {
                  const active = form.exercises.includes(ex);
                  return (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => toggleExercise(ex)}
                      className={`text-sm px-3 py-1 rounded-full border ${active ? "bg-teal-600 text-white" : "bg-muted"}`}
                    >
                      {ex}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {loading && <div className="text-sm text-muted-foreground">Loading sessions...</div>}

          <div className="pt-4">
            <div className="text-sm font-medium mb-2">Upcoming & Recent Sessions</div>
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id} className="rounded border p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-medium">{s.type}</div>
                    <div className="text-muted-foreground text-sm">{s.date} • {s.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.exercises.slice(0, 3).map((e) => (
                      <Badge key={e} variant="secondary" className="rounded-full">{e}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeSession(s.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}