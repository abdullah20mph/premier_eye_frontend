// src/components/RegisterPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

type RegisterPageProps = {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
};

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(
    /\/+$/, ""
  ) || "http://localhost:5000";

const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [display_name, setDisplay_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const sanitizedDisplay_name = 
        display_name.trim().length === 0 ? null : display_name.trim();
    
    setIsLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/interaction/register`, {
        firstName,
        lastName,
        display_name: sanitizedDisplay_name,
        email,
        password,
        confirmPassword,
      });

      toast.success("Account created! You can now log in.");
      onRegisterSuccess(); // switch to login
    } catch (err: any) {
      console.error("Register failed", err);
      const errorMessage = err.response?.data?.message;
      console.error("Backend Error Message:", errorMessage);
      toast.error(
        err.response?.data?.message || "Failed to create account. Please try again."
        
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-brand-black mb-2">
        Create your account
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Set up access to your clinic dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              First name
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Sarah"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Last name
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ahmed"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Display name
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            value={display_name}
            onChange={(e) => setDisplay_name(e.target.value)}
            placeholder="Dr. Sarah Ahmed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Confirm password
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-black text-brand-blue rounded-full py-2.5 text-sm font-semibold hover:bg-gray-900 transition disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-brand-blue font-semibold hover:underline"
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
