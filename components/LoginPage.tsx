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
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(
    /\/+$/, ""
  ) || "http://localhost:5000";

const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/interaction/login`, {
        email,
        password,
      });

      // 🔐 adapt to your backend’s exact response shape
      const token =
        res.data.token || res.data.data?.token || res.data.access_token;

      if (!token) {
        throw new Error("Token missing from response");
      }

      setToken(token);            // save in localStorage
      onLoginSuccess(token);      // notify App (App will redirect to dashboard)
    } catch (err: any) {
      console.error("Login failed", err);
      toast.error(
        err.response?.data?.message || "Failed to log in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-brand-black mb-2">
        Welcome back 👋
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Sign in to access your sales dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-brand-blue font-semibold hover:underline"
        >
          Create one
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
