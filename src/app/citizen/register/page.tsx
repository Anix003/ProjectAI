'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  dateOfBirth?: string;
  pinCode?: string;
  address?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CitizenRegisterPage() {
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [address, setAddress] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' };
    if (score === 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' };
    if (score === 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' };
    return { label: 'Very Strong', color: 'bg-green-400', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password);

  // ── Validate ────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (phoneDigits.length < 8) {
      errors.phone = 'Enter a valid phone number (min 8 digits)';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (pinCode && !/^\d{4,10}$/.test(pinCode)) {
      errors.pinCode = 'Enter a valid pin code (4-10 digits)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ''),
          password,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          pinCode: pinCode || null,
          address: address.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Success – redirect to dashboard
      router.push('/citizen/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers to clear validation on change ──────────────────────────────

  const clearError = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Shared input classes
  const inputBase = (hasError: boolean) =>
    `w-full bg-slate-950/60 border ${
      hasError
        ? 'border-red-500/80 focus:ring-red-500/20'
        : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
    } rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none focus:ring-4 transition duration-200 text-sm`;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-[#070b19] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Decorative gradient blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[25%] h-[25%] rounded-full bg-fuchsia-900/15 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 my-8">
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3 animate-pulse">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Civic{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Empowering communities through artificial intelligence</p>
        </div>

        {/* Registration Card */}
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1">Create Your Account</h2>
          <p className="text-slate-400 text-sm mb-6">
            Join the Civic AI citizen portal to access smarter public services.
          </p>

          {/* Alert Error Box */}
          {error && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 rounded-xl p-4 mb-6 text-red-200 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* ── Name Row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-slate-300 text-sm font-semibold mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError('firstName');
                    }}
                    className={inputBase(!!validationErrors.firstName)}
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-slate-300 text-sm font-semibold mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearError('lastName');
                    }}
                    className={inputBase(!!validationErrors.lastName)}
                  />
                </div>
                {validationErrors.lastName && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* ── Email ────────────────────────────────────────────── */}
            <div>
              <label htmlFor="email" className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  className={inputBase(!!validationErrors.email)}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.email}
                </p>
              )}
            </div>

            {/* ── Phone ────────────────────────────────────────────── */}
            <div>
              <label htmlFor="phone" className="block text-slate-300 text-sm font-semibold mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError('phone');
                  }}
                  className={inputBase(!!validationErrors.phone)}
                />
              </div>
              {validationErrors.phone && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.phone}
                </p>
              )}
            </div>

            {/* ── Gender & DOB Row ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-slate-300 text-sm font-semibold mb-2">
                  Gender
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`${inputBase(false)} pr-10 appearance-none cursor-pointer ${
                      !gender ? 'text-slate-500' : 'text-white'
                    }`}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Select gender
                    </option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g} className="bg-slate-900 text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-slate-300 text-sm font-semibold mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <Calendar className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inputBase(false)} ${
                      !dateOfBirth ? 'text-slate-500' : 'text-white'
                    } [color-scheme:dark]`}
                  />
                </div>
              </div>
            </div>

            {/* ── Password ─────────────────────────────────────────── */}
            <div>
              <label htmlFor="password" className="block text-slate-300 text-sm font-semibold mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  className={`${inputBase(!!validationErrors.password)} pr-11`}
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
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Strength:{' '}
                    <span
                      className={
                        passwordStrength.color.replace('bg-', 'text-').replace('-500', '-400').replace('-400', '-300')
                      }
                    >
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.password}
                </p>
              )}
            </div>

            {/* ── Confirm Password ─────────────────────────────────── */}
            <div>
              <label htmlFor="confirmPassword" className="block text-slate-300 text-sm font-semibold mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  className={`${inputBase(!!validationErrors.confirmPassword)} pr-11`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition duration-150"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {/* Password match indicator */}
              {confirmPassword && !validationErrors.confirmPassword && password === confirmPassword && (
                <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* ── Pin Code & Address ───────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pin Code */}
              <div>
                <label htmlFor="pinCode" className="block text-slate-300 text-sm font-semibold mb-2">
                  Pin Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="pinCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="560001"
                    value={pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPinCode(val);
                      clearError('pinCode');
                    }}
                    className={inputBase(!!validationErrors.pinCode)}
                  />
                </div>
                {validationErrors.pinCode && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.pinCode}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-slate-300 text-sm font-semibold mb-2">
                  Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="address"
                    type="text"
                    placeholder="City / Area"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearError('address');
                    }}
                    className={inputBase(false)}
                  />
                </div>
              </div>
            </div>

            {/* ── Submit ───────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:from-violet-800 disabled:to-cyan-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer focus:ring-4 focus:ring-violet-500/20 outline-none text-sm mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition duration-150" />
                </>
              )}
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <span>Already have an account? </span>
            <Link
              href="/citizen/login"
              className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
