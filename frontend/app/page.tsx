"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`
        );

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();

        if (data.status === "healthy") {
          setStatus("Frontend connected to backend ✓");
        }
      } catch {
        setStatus("Could not connect to backend");
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">{status}</h1>
    </main>
  );
}