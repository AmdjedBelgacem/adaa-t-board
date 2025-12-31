"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "../app/login/page";
import useTaskStore from "@/lib/store";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const setApiKey = useTaskStore.getState().setApiKey;

    const navigateToLogin = () => {
      try {
        router.replace("/login");
      } catch {}
      try {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } catch {}
    };

    async function validateKey(k: string | null) {
      if (!k) {
        if (mounted) {
          setAuthenticated(false);
          setReady(true);
        }
        navigateToLogin();
        return;
      }
      try {
        const res = await fetch("/api/tasks", {
          method: "GET",
          headers: { "X-CLIENT-KEY": k as string, Accept: "application/json" },
        });
        if (!mounted) return;
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setApiKey(null);
          setAuthenticated(false);
          navigateToLogin();
        }
      } catch {
        if (!mounted) return;
        setApiKey(null);
        setAuthenticated(false);
        navigateToLogin();
      } finally {
        if (mounted) setReady(true);
      }
    }

    validateKey(useTaskStore.getState().apiKey);

    function onStorage() {
      validateKey(useTaskStore.getState().apiKey);
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("apiKeyChanged", onStorage);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("apiKeyChanged", onStorage);
    };
  }, [router]);

  if (!ready) return null;

  if (!authenticated) return <LoginPage />;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
