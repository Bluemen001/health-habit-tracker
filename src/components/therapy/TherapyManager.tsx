"use client";

import { useMemo, useState } from "react";
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
  note?: string;
  exercises: string[];
};

export default function TherapyManager() {
  const templates = useMemo(() => ["CBT", "Mindfulness", "Physiotherapy", "Group Therapy"], []);
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, date: "2025-09-27", time: "10:00", type: "CBT", note: "Breathing & reframing", exercises: ["Box Breathing", "Thought Log"] },
  ]);

  const [form, setForm] = useState<Session>({ id: 0, date: "", time: "", type: "CBT", note: "", exercises: [] });

  const addSession = () => {
    if (!form.date || !form.time) return;
    const next: Session = { ...form, id: Math.max(0, ...sessions.map((s) => s.id)) + 1 };
    setSessions((s) => [next, ...s]);
    setForm({ id: 0, date: "", time: "", type: "CBT", note: "", exercises: [] });
  };

  const toggleExercise = (name: string) => {
    setForm((f) => ({ ...f, exercises: f.exercises.includes(name) ? f.exercises.filter((e) => e !== name) : [...f.exercises, name] }));
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
                value={form.note}
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
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}