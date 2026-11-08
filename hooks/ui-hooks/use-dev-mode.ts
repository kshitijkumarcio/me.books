"use client";

import { useSyncExternalStore } from "react";

function subscribeUrlChange(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getDevParamSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("dev") === "true";
}

function getServerDevParamSnapshot(): boolean {
  return false;
}

/**
 * Hook to detect developer mode via NODE_ENV or `?dev=true` URL query parameter.
 */
export function useDevMode(): boolean {
  const isDevParam = useSyncExternalStore(
    subscribeUrlChange,
    getDevParamSnapshot,
    getServerDevParamSnapshot
  );

  const isDevEnvironment = process.env.NODE_ENV === "development";
  return isDevEnvironment || isDevParam;
}

