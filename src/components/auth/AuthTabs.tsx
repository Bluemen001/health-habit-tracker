"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, LogIn } from "lucide-react";

export default function AuthTabs() {
  const [loading, setLoading] = useState<"login" | "register" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fakeSubmit = async (type: "login" | "register") => {
    setMessage(null);
    setLoading(type);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(null);
    setMessage(type === "login" ? "Logged in successfully (demo)" : "Account created (demo)");
  };

  return (
    <Card className="w-full max-w-xl border-foreground/10 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
          <ShieldCheck className="h-5 w-5" /> Secure Access
        </CardTitle>
        <CardDescription>Sign in to track your habits and therapy sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                fakeSubmit("login");
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" type="email" required placeholder="you@clinic.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                <Input id="password-login" type="password" required placeholder="••••••••" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Two-factor protected</div>
                <Button type="submit" disabled={loading === "login"}>
                  <LogIn className="mr-2 h-4 w-4" /> {loading === "login" ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                fakeSubmit("register");
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name-register">Full name</Label>
                <Input id="name-register" required placeholder="Alex Johnson" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email-register">Email</Label>
                <Input id="email-register" type="email" required placeholder="alex@clinic.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-register">Password</Label>
                <Input id="password-register" type="password" required placeholder="Create a strong password" />
              </div>
              <Separator />
              <Button type="submit" className="w-full" disabled={loading === "register"}>
                {loading === "register" ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {message && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}