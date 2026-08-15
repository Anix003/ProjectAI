"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Lock, Mail, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Authentication failed. Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans">
      {/* Background glow grids */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[90px]" />

      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <div
            onClick={() => router.push("/")}
            className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            C
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Access Civic AI
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            Sign in to your municipal dashboard profile
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicai.gov.in"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            {isSubmitting ? "Verifying Session..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-white/5 text-xs text-gray-400">
          New to Civic AI?{" "}
          <Link
            href="/register"
            className="text-blue-400 font-bold hover:underline"
          >
            Register an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
