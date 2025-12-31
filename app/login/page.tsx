"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Server,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const router = useRouter();

  function validate() {
    if (!apiKey || apiKey.trim() === "") {
      setError("API Key is required");
      return false;
    }
    return true;
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmed = apiKey.trim();
      try {
        localStorage.setItem("apiKey", trimmed);
      } catch {
        setError("Failed to save API key");
        toast.error("Failed to save API key");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/tasks", {
        method: "GET",
        headers: { "X-CLIENT-KEY": trimmed, Accept: "application/json" },
      });
      if (res.status === 401) {
        try {
          localStorage.removeItem("apiKey");
        } catch {}
        setError("Invalid API key");
        toast.error("Invalid API key");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        try {
          type ErrorBody = {
            error?: string | null;
            detail?: string | null;
            [key: string]: unknown;
          };
          const body = (await res.json().catch(() => undefined)) as
            | ErrorBody
            | undefined;
          const msg =
            typeof body?.error === "string"
              ? body.error
              : typeof body?.detail === "string"
              ? body.detail
              : "Unable to verify API key";
          setError(String(msg));
          toast.error(String(msg));
        } catch {
          setError("Unable to verify API key");
          toast.error("Unable to verify API key");
        }
        setLoading(false);
        return;
      }
      setSuccess(true);
      try {
        window.dispatchEvent(new Event("apiKeyChanged"));
      } catch {}
      router.replace("/");
    } catch {
      try {
        localStorage.removeItem("apiKey");
      } catch {}
      setError("Network error");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1724] rounded-2xl shadow-card overflow-hidden border border-slate-200 dark:border-slate-700 relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-400" />
        <form onSubmit={onSubmit} className="p-8 sm:p-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <div className="mx-auto bg-primary/10 dark:bg-primary/20 p-3 rounded-full mb-2 w-fit">
              <Server size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Connect to T-Board
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Enter your personal access token to sync your tasks securely.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {error ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                <AlertTriangle
                  size={20}
                  className="text-red-600 dark:text-red-300 mt-0.5"
                />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            ) : null}

            {success ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                <CheckCircle
                  size={20}
                  className="text-green-600 dark:text-green-300 mt-0.5"
                />
                <div>
                  <p className="font-medium">Saved</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    API key stored locally
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="apiKey"
              >
                API Key
              </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Key
                      size={18}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-10 pr-10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                    onClick={() => setShowKey((s) => !s)}
                  >
                    {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
            </div>

            <Button
              disabled={loading}
              aria-busy={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-3 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 transform active:scale-[0.98]"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </Button>
            <Toaster position="top-right" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-start gap-3">
              <Lock
                size={18}
                className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your API key is stored locally in your browser. We never
                transmit it to third-party servers.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
