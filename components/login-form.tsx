"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { handleApiError } from "@/utils/apiHelpers";
import { ApiError } from "@/types/error";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BASE_URL + "/auth/login",
        JSON.stringify({ email, password }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (response && response?.data) {
        console.log("Login successful:", response?.data);
        const accessTokenExpiry = new Date();
        accessTokenExpiry.setTime(accessTokenExpiry.getTime() + 15 * 60 * 1000); // 15 min
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setTime(
          refreshTokenExpiry.getTime() + 15 * 24 * 60 * 60 * 1000
        ); // 15 days

        Cookies.set("accessToken", response?.data?.accessToken, {
          expires: accessTokenExpiry,
          secure: true,
        });
        Cookies.set("refreshToken", response?.data?.refreshToken, {
          expires: refreshTokenExpiry,
          secure: true,
        });

        window.location.href = "/";
      }
    } catch (err) {
      console.log(err);
      setError(
        (err as AxiosError<{ error: string }>)?.response?.data?.error ||
          "An unknown error occurred"
      );
      handleApiError(err as ApiError);
      // console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
