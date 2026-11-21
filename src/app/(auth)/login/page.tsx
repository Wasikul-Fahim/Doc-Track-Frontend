"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const login = useLogin();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMessage("");
    try {
      await login.mutateAsync(data);
      toast.success("Welcome back!", { description: "You have been signed in." });
      router.push(next);
      router.refresh();
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const msg = err.code === "RATE_LIMITED" ? "Too many attempts. Please try again in a few minutes." : err.message ?? "Invalid email or password";
      setErrorMessage(msg);
      toast.error("Sign in failed", { description: msg });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8">
            <span className="text-4xl font-bold">Doc Track</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">Doctor Tracker</h1>
          <p className="text-lg opacity-90 mb-10">
            A streamlined admin platform for managing doctors, patients, and clinic analytics.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm opacity-80">
            <div className="p-4 rounded-lg bg-primary-foreground/10">
              <div className="text-2xl font-bold">12+</div>
              <div>Specializations</div>
            </div>
            <div className="p-4 rounded-lg bg-primary-foreground/10">
              <div className="text-2xl font-bold">200+</div>
              <div>Patients tracked</div>
            </div>
            <div className="p-4 rounded-lg bg-primary-foreground/10">
              <div className="text-2xl font-bold">Real-time</div>
              <div>Analytics dashboard</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@doctrack.dev"
                  {...register("email")}
                  disabled={login.isPending}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={login.isPending}
                    aria-invalid={!!errors.password}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={login.isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Separator />
            <p className="text-center text-sm text-muted-foreground">
              Demo credentials: <code className="font-mono text-xs bg-muted px-1 rounded">admin@doctrack.dev</code> / <code className="font-mono text-xs bg-muted px-1 rounded">Admin@123</code>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// useSearchParams() needs a Suspense boundary so the page can be prerendered.
export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginContent />
    </React.Suspense>
  );
}
