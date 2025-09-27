"use client";

import Image from "next/image";
import AuthTabs from "@/components/auth/AuthTabs";
import Dashboard from "@/components/dashboard/Dashboard";
import HabitTracker from "@/components/habits/HabitTracker";
import TherapyManager from "@/components/therapy/TherapyManager";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-background dark:to-background">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1583912086096-8f138907ca9f?q=80&w=1600&auto=format&fit=crop"
            alt="Healthcare background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Health Habit Tracker
              </h1>
              <p className="text-muted-foreground mt-1">
                Track habits, monitor mood, and manage therapy sessions securely.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary">Switch Theme</Button>
              <Button>New Report</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        <section>
          <AuthTabs />
        </section>
        <Dashboard />
        <HabitTracker />
        <TherapyManager />
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Health Habit Tracker</div>
          <div className="flex items-center gap-3">
            <a href="#accessibility" className="hover:underline">Accessibility</a>
            <a href="#privacy" className="hover:underline">Privacy</a>
            <a href="#terms" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}