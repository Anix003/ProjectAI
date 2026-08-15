"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { databases } from "@/lib/appwrite-client";
import { Query } from "appwrite";
import { Lock, Mail, ArrowRight, User, Phone, Briefcase, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState("Citizen"); // 'Citizen' or 'Officer'
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  // Fetch initial departments list for officer routing options
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await databases.listDocuments(databaseId, "departments", [
          Query.limit(20),
        ]);
        setDepartments(res.documents);
        if (res.documents.length > 0) {
          setDepartmentId(res.documents[0].id_departments);
        }
      } catch (err) {
        console.error("Error fetching departments:", err.message);
      }
    };
    fetchDepts();
  }, [databaseId]);

  const handleSendOTP = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setOtpLoading(true);
    setOtpMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setOtpSent(true);
      if (data.mock) {
        setOtpMessage("Demo Mode: OTP sent! Since SMTP credentials are not set, check the server console for your 6-digit code.");
      } else {
        setOtpMessage(`Verification code sent to ${email}. Please check your inbox.`);
      }
    } catch (err) {
      setError(err.message || "Connection failure. OTP request aborted.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        departmentId: role === "Officer" ? departmentId : "",
        otp,
      };

      const res = await register(payload);
      if (res.success) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error || "Registration failed. Try again.");
      }
    } catch (err) {
      setError("Connection failure. Registration aborted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans">
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[90px]" />

      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div
            onClick={() => router.push("/")}
            className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            C
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Register for Civic AI services
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex gap-2 p-1 bg-slate-950 border border-white/5 rounded-xl mb-6">
          <button
            type="button"
            disabled={otpSent}
            onClick={() => setRole("Citizen")}
            className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${
              role === "Citizen" ? "bg-blue-600 text-white" : "text-gray-400"
            } ${otpSent ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Citizen Profile
          </button>
          <button
            type="button"
            disabled={otpSent}
            onClick={() => setRole("Officer")}
            className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${
              role === "Officer" ? "bg-blue-600 text-white" : "text-gray-400"
            } ${otpSent ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Municipal Officer
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold mb-4 text-center">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={firstName}
                  disabled={otpSent}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-10 pr-3 py-3 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                disabled={otpSent}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                disabled={otpSent}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@example.com"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                value={password}
                disabled={otpSent}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Department selector if Officer selected */}
          {role === "Officer" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block">
                Assign Department *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <select
                  value={departmentId}
                  disabled={otpSent}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.$id} value={d.id_departments}>
                      {d.departments_name} ({d.id_departments})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* OTP Verification Block */}
          {otpSent && (
            <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-fade-in mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-400 block text-center">
                  Verification Code (OTP) *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="------"
                  className="w-full text-center text-lg font-bold font-mono bg-slate-950 border border-blue-500/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 tracking-[0.5em] pl-[0.5em]"
                  required
                />
              </div>

              {otpMessage && (
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  {otpMessage}
                </p>
              )}

              <div className="flex justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading}
                  className="text-blue-400 hover:underline font-bold cursor-pointer disabled:opacity-50"
                >
                  {otpLoading ? "Sending..." : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-gray-400 hover:underline cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || otpLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            {otpSent ? (
              isSubmitting ? "Verifying & Registering..." : "Verify & Complete Registration"
            ) : (
              otpLoading ? "Sending Code..." : "Send Verification Code"
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-blue-400 font-bold hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
