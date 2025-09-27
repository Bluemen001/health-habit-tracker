"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Activity, HeartPulse, Brain, Stethoscope } from "lucide-react";

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Daily Habit Completion", value: 76, icon: Activity, tone: "bg-teal-600" },
      { label: "Mood Stability", value: 64, icon: Brain, tone: "bg-sky-600" },
      { label: "Sleep Quality", value: 82, icon: HeartPulse, tone: "bg-cyan-600" },
      { label: "Therapy Attendance", value: 92, icon: Stethoscope, tone: "bg-blue-600" },
    ],
    []
  );

  return (
    <section className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-foreground/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <s.icon className={`${s.tone} text-white h-5 w-5 rounded p-1`} />
                {s.label}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">This Week</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">{s.value}%</span>
                <span className="text-sm text-muted-foreground">target: 90%</span>
              </div>
              <Progress className="mt-3" value={s.value} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-teal-600" /> Overview
          </CardTitle>
          <CardDescription>Your emotional state and therapy engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="emotion" className="w-full">
            <TabsList className="flex w-full sm:w-auto">
              <TabsTrigger value="emotion">Emotional State</TabsTrigger>
              <TabsTrigger value="therapy">Therapy Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="emotion" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="h-40 w-full rounded border border-dashed border-border flex items-end gap-1 p-3">
                    {[56, 60, 58, 62, 68, 70, 66, 72, 74, 69, 71, 77].map((v, i) => (
                      <div key={i} className="bg-sky-500/70 dark:bg-sky-400/70 w-full rounded-t" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Mood index (higher is better)</p>
                </div>
                <div className="space-y-2">
                  <Stat label="Calm" value={62} color="bg-teal-500" />
                  <Stat label="Focused" value={71} color="bg-sky-500" />
                  <Stat label="Energized" value={54} color="bg-cyan-500" />
                  <Stat label="Rested" value={79} color="bg-blue-500" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="therapy" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  {[
                    { label: "Completed", value: 8, tone: "bg-teal-600" },
                    { label: "Scheduled", value: 3, tone: "bg-sky-600" },
                    { label: "Missed", value: 1, tone: "bg-orange-500" },
                    { label: "Exercises", value: 24, tone: "bg-blue-600" },
                  ].map((t) => (
                    <div key={t.label} className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">{t.label}</div>
                      <div className="mt-1 flex items-end justify-between">
                        <span className="text-2xl font-semibold">{t.value}</span>
                        <span className={`${t.tone} text-white text-xs px-2 py-0.5 rounded-full`}>weekly</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <Separator className="mb-3" />
                  <ul className="space-y-2">
                    {[
                      { d: "Mon", note: "CBT focus training" },
                      { d: "Wed", note: "Mindfulness practice" },
                      { d: "Fri", note: "Physio breathing" },
                    ].map((s) => (
                      <li key={s.d} className="flex items-center justify-between rounded border p-2">
                        <div className="text-sm">
                          <div className="font-medium">{s.note}</div>
                          <div className="text-muted-foreground">{s.d} • 45 min</div>
                        </div>
                        <Badge variant="outline">upcoming</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded bg-muted">
        <div className={`${color} h-2 rounded`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}