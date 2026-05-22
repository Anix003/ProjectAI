'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { OAuthProvider } from 'appwrite';
import { Eye, EyeOff, Lock, Mail, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CitizenLoginPage() {
  const router = useRouter();
  
  // Form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});

  // Client-side validations
  const validateForm = () => {
    const errors: typeof validationErrors = {};
    const trimmedInput = emailOrPhone.trim();

    if (!trimmedInput) {
      errors.emailOrPhone = 'Email or phone number is required';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      const phoneDigits = trimmedInput.replace(/\D/g, '');
      const isPhone = /^\+?[1-9]\d{1,14}$/.test(trimmedInput) || (phoneDigits.length >= 8 && /^\d+$/.test(phoneDigits));
      
      if (!isEmail && !isPhone) {
        errors.emailOrPhone = 'Enter a valid email address or phone number';
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle standard credentials login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Successful authentication, redirect to dashboard
      router.push('/citizen/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth via Appwrite
  const handleGoogleOAuth = async () => {
    setError(null);
    try {
      const successUrl = `${window.location.origin}/citizen/dashboard`;
      const failureUrl = `${window.location.origin}/citizen/login`;
      
      // Redirects user to Google sign-in page hosted by Appwrite
      await account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google authentication was unsuccessful. Try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070b19] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Decorative gradient blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3 animate-pulse">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Civic <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Empowering communities through artificial intelligence</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Citizen Portal Sign In</h2>

          {/* Alert Error Box */}
          {error && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 rounded-xl p-4 mb-6 text-red-200 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            {/* Email or Phone field */}
            <div>
              <label htmlFor="emailOrPhone" className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  {/^\d+$/.test(emailOrPhone.replace(/\D/g, '')) && emailOrPhone.length > 3 ? (
                    <Phone className="h-4.5 w-4.5" />
                  ) : (
                    <Mail className="h-4.5 w-4.5" />
                  )}
                </span>
                <input
                  id="emailOrPhone"
                  type="text"
                  placeholder="name@domain.com or +123456789"
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    if (validationErrors.emailOrPhone) {
                      setValidationErrors(prev => ({ ...prev, emailOrPhone: undefined }));
                    }
                  }}
                  className={`w-full bg-slate-950/60 border ${
                    validationErrors.emailOrPhone ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
                  } rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none focus:ring-4 transition duration-200 text-sm`}
                />
              </div>
              {validationErrors.emailOrPhone && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.emailOrPhone}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-slate-300 text-sm font-semibold">
                  Password
                </label>
                <Link 
                  href="/citizen/forgot-password" 
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter 8+ characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`w-full bg-slate-950/60 border ${
                    validationErrors.password ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
                  } rounded-xl py-3 pl-11 pr-11 text-white placeholder-slate-500 outline-none focus:ring-4 transition duration-200 text-sm`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition duration-150"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500/30 focus:ring-offset-slate-900 focus:ring-2 cursor-pointer outline-none"
              />
              <label htmlFor="rememberMe" className="ml-2.5 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition">
                Remember Me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:from-violet-800 disabled:to-cyan-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer focus:ring-4 focus:ring-violet-500/20 outline-none text-sm mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition duration-150" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-800" />
            <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Or continue with</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="w-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-white py-3 rounded-xl transition duration-150 flex items-center justify-center gap-3 cursor-pointer outline-none focus:ring-4 focus:ring-slate-500/10 text-sm font-semibold"
          >
            {/* Google Icon SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Workspace</span>
          </button>

          {/* Registration Redirect */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <span>New user? </span>
            <Link 
              href="/citizen/register" 
              className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition ml-1"
            >
              Create a free account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
