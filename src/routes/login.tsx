import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wifi, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Authenticated");
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background bg-grid px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Wifi className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success pulse-dot" />
          </div>
          <div className="text-center">
            <h1 className="font-mono text-2xl font-semibold tracking-[0.2em] text-primary text-glow">
              Asher-Link
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              NOC Console
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur"
        >
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="uppercase tracking-wider">Operator login</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="u" className="text-xs uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-mono"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="p"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-5 w-full font-mono uppercase tracking-wider"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign in"}
          </Button>

          <div className="mt-5 rounded-md border border-dashed border-border/70 p-3 text-[11px] text-muted-foreground">
            <p className="mb-1 uppercase tracking-wider text-foreground/70">Accounts</p>
            <p className="font-mono">
              admin / admin <span className="text-primary">· admin</span>
            </p>
            <p className="font-mono">
              operator / operator <span className="text-info">· operator</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
