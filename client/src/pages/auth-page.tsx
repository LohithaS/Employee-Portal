import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Lock, User, Shield, Users } from "lucide-react";
import loginBg from "@/assets/images/login-bg.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username must be at most 10 characters")
    .regex(/^[a-zA-Z]+$/, "Username must only contain alphabets"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters"),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username must be at most 10 characters")
    .regex(/^[a-zA-Z]+$/, "Username must only contain alphabets"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

function LoginForm({ role, isLoading, onSubmit }: { role: string; isLoading: boolean; onSubmit: (values: LoginFormValues) => void }) {
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={loginForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="jdoe"
                    className="pl-9"
                    data-testid={`input-login-username-${role.toLowerCase()}`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9"
                    data-testid={`input-login-password-${role.toLowerCase()}`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2">
          <Checkbox id={`remember-${role.toLowerCase()}`} />
          <Label htmlFor={`remember-${role.toLowerCase()}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading} data-testid={`button-login-${role.toLowerCase()}`}>
          {isLoading ? "Signing in..." : `Sign In as ${role}`}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: (values: RegisterFormValues & { role: string }) => void }) {
  const [selectedRole, setSelectedRole] = useState<string>("Employee");

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  const handleSubmit = (values: RegisterFormValues) => {
    onSubmit({ ...values, role: selectedRole });
  };

  return (
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={registerForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    className="pl-9"
                    data-testid="input-register-name"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="jdoe"
                    className="pl-9"
                    data-testid="input-register-username"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9"
                    data-testid="input-register-password"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Label className="text-sm font-medium">Role <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => setSelectedRole("Employee")}
              data-testid="button-role-employee"
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                selectedRole === "Employee"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Employee</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("Manager")}
              data-testid="button-role-manager"
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                selectedRole === "Manager"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">Manager</span>
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();

  const onEmployeeLogin = (values: LoginFormValues) => {
    login({ username: values.username, password: values.password, role: "Employee" });
  };

  const onManagerLogin = (values: LoginFormValues) => {
    login({ username: values.username, password: values.password, role: "Manager" });
  };

  const onRegister = (values: RegisterFormValues & { role: string }) => {
    register({ username: values.username, password: values.password, name: values.name, role: values.role });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col relative bg-muted text-white p-10">
        <div className="absolute inset-0 bg-zinc-900/20" />
        <img
          src={loginBg}
          alt="Office"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        />
        <div className="relative z-10 flex items-center text-lg font-medium">
          <Building2 className="mr-2 h-6 w-6" />
          Nexus Portal
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Efficiency is doing things right; effectiveness is doing the right things."
            </p>
            <footer className="text-sm">Peter Drucker</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <Tabs defaultValue="employee-login">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome</CardTitle>
              <CardDescription>
                Sign in to access the employee portal
              </CardDescription>
              <TabsList className="grid w-full grid-cols-3 mt-2">
                <TabsTrigger value="employee-login" data-testid="tab-employee-login" className="text-xs sm:text-sm">
                  <Users className="h-3.5 w-3.5 mr-1 hidden sm:block" />
                  Employee
                </TabsTrigger>
                <TabsTrigger value="manager-login" data-testid="tab-manager-login" className="text-xs sm:text-sm">
                  <Shield className="h-3.5 w-3.5 mr-1 hidden sm:block" />
                  Manager
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register" className="text-xs sm:text-sm">
                  Register
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="employee-login" className="mt-0">
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>Employee Login Portal</span>
                </div>
                <LoginForm role="Employee" isLoading={isLoading} onSubmit={onEmployeeLogin} />
              </TabsContent>
              <TabsContent value="manager-login" className="mt-0">
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>Manager Login Portal</span>
                </div>
                <LoginForm role="Manager" isLoading={isLoading} onSubmit={onManagerLogin} />
              </TabsContent>
              <TabsContent value="register" className="mt-0">
                <RegisterForm isLoading={isLoading} onSubmit={onRegister} />
              </TabsContent>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
              <div>
                Forgot your password? <a href="#" className="underline hover:text-primary">Reset it</a>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
