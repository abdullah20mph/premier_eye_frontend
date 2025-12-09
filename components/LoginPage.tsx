// src/components/LoginPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { setToken } from "../services/authTokenHelper";
import { toast } from "react-hot-toast";

type LoginPageProps = {
  onLoginSuccess: (token: string) => void;
  onSwitchToRegister: () => void;
};

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5000";

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/interaction/login`, { email, password });
      const token = res.data.token || res.data.data?.token || res.data.access_token;
      if (!token) throw new Error("Token missing from response");
      setToken(token);
      onLoginSuccess(token);
    } catch (err: any) {
      console.error("Login failed", err);
      toast.error(err.response?.data?.message || "Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white" />
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 bg-brand-blue/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute right-[-20px] bottom-[-20px] h-48 w-48 bg-gray-200/50 blur-3xl rounded-full" />
      <div
        className="pointer-events-none absolute inset-3 rounded-2xl opacity-45"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.035) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative">
        <h1 className="text-2xl font-bold text-brand-black mb-2">Welcome back 👋</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to access your sales dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
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
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-black text-brand-blue rounded-full py-2.5 text-sm font-semibold hover:bg-gray-900 transition disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-brand-blue font-semibold hover:underline"
          >
            Create one
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
